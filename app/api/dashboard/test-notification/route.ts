import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { clients } from '@/lib/db/schema';
import { whopClient } from '@/lib/whop-sdk';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      );
    }

    
    // Get client data
    const client = await db.query.clients.findFirst({
      where: eq(clients.id, clientId),
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check if notifications are enabled
    if (!client.notifyOnNewLeads) {
      return NextResponse.json(
        { success: false, error: 'Notifications are disabled. Please enable notifications first.' },
        { status: 400 }
      );
    }

    const companyId = process.env.WHOP_COMPANY_ID;
    
    if (!companyId) {
      console.error('WHOP_COMPANY_ID environment variable is not set');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Notification service is not configured properly',
          debug: {
            missing: 'WHOP_COMPANY_ID'
          }
        },
        { status: 500 }
      );
    }

    try {
      // Use the SDK to create/get support channel for the user
      console.log('Creating/getting support channel for user:', client.whopUserId);
      
      const supportChannel = await whopClient.supportChannels.create({
        company_id: companyId,
        user_id: client.whopUserId!,
      });

      console.log('Support channel created/retrieved:', supportChannel);

      // Send message to the support channel using the SDK
      const message = await whopClient.messages.create({
        channel_id: supportChannel.id,
        content: 'Test notification from LeadGen - Your notification settings are working correctly!',
      });

      console.log('Test message sent successfully:', {
        clientId: client.id,
        whopUserId: client.whopUserId,
        channelId: supportChannel.id,
        messageId: message.id
      });

      return NextResponse.json({
        success: true,
        message: 'Test notification sent successfully! Check your Whop messages.',
        clientId: client.id,
        whopUserId: client.whopUserId,
        channelId: supportChannel.id,
        messageId: message.id,
        debug: {
          step1: {
            apiCall: 'POST /support_channels',
            channelId: supportChannel.id,
            channelName: supportChannel.custom_name
          },
          step2: {
            apiCall: 'POST /messages',
            messageId: message.id,
            content: message.content
          }
        }
      });

    } catch (apiError) {
      console.error('Error calling Whop API:', apiError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send notification',
          debug: {
            error: apiError instanceof Error ? apiError.message : 'Unknown error',
            stack: apiError instanceof Error ? apiError.stack : undefined
          }
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
