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

    // Send actual notification via Whop API
    const whopApiKey = process.env.WHOP_API_KEY;
    if (!whopApiKey) {
      console.error('WHOP_API_KEY environment variable is not set');
      return NextResponse.json(
        { success: false, error: 'Notification service is not configured properly' },
        { status: 500 }
      );
    }

    try {
      // Send notification via Whop API
      const notificationResponse = await fetch('https://api.whop.com/api/v2/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whopApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: client.whopUserId,
          title: 'LeadGen Test Notification',
          message: 'Test notification from LeadGen - Your notification settings are working correctly!',
          type: 'info'
        }),
      });

      if (!notificationResponse.ok) {
        const errorData = await notificationResponse.text();
        console.error('Whop API error:', notificationResponse.status, errorData);
        return NextResponse.json(
          { 
            success: false, 
            error: `Failed to send notification: ${notificationResponse.status}`,
            debug: {
              status: notificationResponse.status,
              statusText: notificationResponse.statusText,
              error: errorData
            }
          },
          { status: 500 }
        );
      }

      const notificationResult = await notificationResponse.json();
      
      console.log('Test notification sent successfully:', {
        clientId: client.id,
        whopUserId: client.whopUserId,
        notificationId: notificationResult.id
      });

      return NextResponse.json({
        success: true,
        message: 'Test notification sent successfully',
        clientId: client.id,
        whopUserId: client.whopUserId,
        notificationId: notificationResult.id,
        debug: {
          apiCall: 'POST /api/v2/notifications',
          status: notificationResponse.status,
          response: notificationResult
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
