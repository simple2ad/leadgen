import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { clients } from '@/lib/db/schema';

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

    // Send message via Whop Support Channels API
    const whopApiKey = process.env.WHOP_API_KEY;
    const companyId = process.env.WHOP_COMPANY_ID;
    
    if (!whopApiKey || !companyId) {
      console.error('WHOP_API_KEY or WHOP_COMPANY_ID environment variables are not set');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Notification service is not configured properly',
          debug: {
            missing: !whopApiKey ? 'WHOP_API_KEY' : 'WHOP_COMPANY_ID'
          }
        },
        { status: 500 }
      );
    }

    try {
      // Step 1: Create or get support channel for the user
      const channelResponse = await fetch('https://api.whop.com/api/v5/support_channels', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whopApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: companyId,
          user_id: client.whopUserId,
        }),
      });

      if (!channelResponse.ok) {
        const errorData = await channelResponse.text();
        console.error('Whop Support Channel API error:', channelResponse.status, errorData);
        return NextResponse.json(
          { 
            success: false, 
            error: `Failed to create support channel: ${channelResponse.status}`,
            debug: {
              apiCall: 'POST /api/v5/support_channels',
              status: channelResponse.status,
              statusText: channelResponse.statusText,
              error: errorData
            }
          },
          { status: 500 }
        );
      }

      const channelResult = await channelResponse.json();
      const channelId = channelResult.id;

      console.log('Support channel created/retrieved:', {
        clientId: client.id,
        whopUserId: client.whopUserId,
        channelId: channelId
      });

      // Step 2: Send message to the support channel
      const messageResponse = await fetch('https://api.whop.com/api/v5/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whopApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: 'Test notification from LeadGen - Your notification settings are working correctly!',
          channel_id: channelId,
        }),
      });

      if (!messageResponse.ok) {
        const errorData = await messageResponse.text();
        console.error('Whop Messages API error:', messageResponse.status, errorData);
        return NextResponse.json(
          { 
            success: false, 
            error: `Failed to send message: ${messageResponse.status}`,
            debug: {
              apiCall: 'POST /api/v5/messages',
              status: messageResponse.status,
              statusText: messageResponse.statusText,
              error: errorData,
              channelId: channelId
            }
          },
          { status: 500 }
        );
      }

      const messageResult = await messageResponse.json();
      
      console.log('Test message sent successfully:', {
        clientId: client.id,
        whopUserId: client.whopUserId,
        channelId: channelId,
        messageId: messageResult.id
      });

      return NextResponse.json({
        success: true,
        message: 'Test notification sent successfully! Check your Whop messages.',
        clientId: client.id,
        whopUserId: client.whopUserId,
        channelId: channelId,
        messageId: messageResult.id,
        debug: {
          step1: {
            apiCall: 'POST /api/v5/support_channels',
            status: channelResponse.status,
            response: channelResult
          },
          step2: {
            apiCall: 'POST /api/v5/messages',
            status: messageResponse.status,
            response: messageResult
          }
        }
      });

    } catch (apiError) {
      console.error('Error calling Whop API:', apiError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to connect to notification service',
          debug: {
            error: apiError instanceof Error ? apiError.message : 'Unknown error'
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
