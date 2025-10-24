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

    try {
      let channelId: string;
      
      // Since we know the user is already added, skip channel creation and use existing channels
      console.log('User already added to feed, finding existing channels...');
      
      // List chat channels and find one to use
      const channels = await whopClient.chatChannels.list({ 
        company_id: process.env.WHOP_COMPANY_ID || '' 
      });
      
      // Find the first available channel
      let foundChannel = null;
      for await (const channel of channels) {
        foundChannel = channel;
        break; // Use the first channel available
      }
      
      if (foundChannel) {
        channelId = foundChannel.id;
        console.log('Using existing support channel:', {
          clientId: client.id,
          whopUserId: client.whopUserId,
          channelId: channelId
        });
      } else {
        // If no channels found, try a different approach - use direct messages
        console.log('No existing channels found, trying alternative approach...');
        
        // For now, we'll create a simple message without a specific channel
        // This is a fallback - in production you might want to handle this differently
        throw new Error('No suitable channels found for sending notifications');
      }

      // Step 2: Send message to the support channel
      const message = await whopClient.messages.create({
        channel_id: channelId!,
        content: 'Test notification from LeadGen - Your notification settings are working correctly!',
      });

      console.log('Test message sent successfully:', {
        clientId: client.id,
        whopUserId: client.whopUserId,
        channelId: channelId,
        messageId: message.id
      });

      return NextResponse.json({
        success: true,
        message: 'Test notification sent successfully! Check your Whop messages.',
        clientId: client.id,
        whopUserId: client.whopUserId,
        channelId: channelId,
        messageId: message.id,
        debug: {
          step1: {
            apiCall: 'chatChannels.list (existing channels)',
            channelId: channelId
          },
          step2: {
            apiCall: 'messages.create',
            response: message
          }
        }
      });

    } catch (apiError) {
      console.error('Error calling Whop SDK:', apiError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send notification via Whop SDK',
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
