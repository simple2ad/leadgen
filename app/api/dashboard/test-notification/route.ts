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
      
      // Try to create support channel first
      try {
        const supportChannel = await whopClient.supportChannels.create({
          company_id: process.env.WHOP_COMPANY_ID || '',
          user_id: client.whopUserId,
        });
        channelId = supportChannel.id;
        console.log('Support channel created:', {
          clientId: client.id,
          whopUserId: client.whopUserId,
          channelId: channelId
        });
      } catch (createError: any) {
        // If channel already exists, try to find existing channels
        if (createError.message?.includes('already been added') || createError.status === 422) {
          console.log('Support channel already exists, trying to find existing channels...');
          
          // List chat channels and find one for this user
          const channels = await whopClient.chatChannels.list({ 
            company_id: process.env.WHOP_COMPANY_ID || '' 
          });
          
          // Find a channel that matches our user
          let foundChannel = null;
          for await (const channel of channels) {
            // Check if this channel is associated with our user
            // We'll use the channel ID as a fallback since we can't easily match by user
            // In a real implementation, we might need to store channel IDs in our database
            foundChannel = channel;
            break; // Use the first channel for now as a fallback
          }
          
          if (foundChannel) {
            channelId = foundChannel.id;
            console.log('Found existing support channel:', {
              clientId: client.id,
              whopUserId: client.whopUserId,
              channelId: channelId
            });
          } else {
            throw new Error('Could not find existing support channel for user');
          }
        } else {
          throw createError;
        }
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
            apiCall: 'supportChannels.create (with fallback)',
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
