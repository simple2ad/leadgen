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

    const body = await request.json();
    const { webhookUrl } = body;

    // Validate URL format if provided
    if (webhookUrl && !isValidUrl(webhookUrl)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid URL.' },
        { status: 400 }
      );
    }

    // Update the client's webhook URL
    await db
      .update(clients)
      .set({ webhookUrl: webhookUrl || null })
      .where(eq(clients.id, clientId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating webhook URL:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while updating your webhook URL.' },
      { status: 500 }
    );
  }
}

function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
