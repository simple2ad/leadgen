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

    // Use direct API calls instead of SDK to avoid the 422 error
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
      // Since we know the user is already added, we'll try to send a message directly
      // First, let's try to get existing support channels
      console.log('Getting existing support channels...');
      
      const channelsResponse = await fetch('https://api.whop.com/api/v5/support-channels', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${whopApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!channelsResponse.ok) {
        console.error('Failed to get support channels:', channelsResponse.status);
        // If we can't get channels, try a different approach
        throw new Error(`Failed to get support channels: ${channelsResponse.status}`);
      }

      const channelsData = await channelsResponse.json();
      console.log('Available support channels:', channelsData);

      // Find a channel that might work for our user
      let channelId = null;
      if (channelsData && channelsData.length > 0) {
        // Use the first available channel
        channelId = channelsData[0].id;
        console.log('Using channel:', channelId);
      } else {
        throw new Error('No support channels available');
      }

      // Send message to the support channel
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
        console.error('Failed to send message:', messageResponse.status, errorData);
        throw new Error(`Failed to send message: ${messageResponse.status}`);
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
            apiCall: 'GET /api/v5/support-channels',
            status: channelsResponse.status,
            channelsCount: channelsData?.length || 0
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
