import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Get client ID from query parameter or body
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    
    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Client ID required' },
        { status: 400 }
      );
    }

    // Get client info including webhook URL
    const client = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (client.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Client not found.' },
        { status: 404 }
      );
    }

    const webhookUrl = client[0].webhookUrl;
    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, error: 'No webhook URL configured.' },
        { status: 400 }
      );
    }

    // Send test webhook with placeholder data
    const testData = {
      event: 'test_webhook',
      lead: {
        id: 'test-lead-id',
        email: 'test@example.com',
        name: 'Test User',
        phone: '+1-555-0123',
        createdAt: new Date().toISOString(),
      },
      client: {
        id: client[0].id,
        username: client[0].username,
      },
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      throw new Error(`Webhook test failed with status: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error testing webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send test webhook. Please check your webhook URL.' },
      { status: 500 }
    );
  }
}
