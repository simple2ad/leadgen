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
    const { username, captureName, capturePhone } = body;

    // Validate username if provided
    if (username) {
      if (username.trim().length < 3) {
        return NextResponse.json(
          { success: false, error: 'Username must be at least 3 characters long.' },
          { status: 400 }
        );
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return NextResponse.json(
          { success: false, error: 'Username can only contain letters, numbers, hyphens, and underscores.' },
          { status: 400 }
        );
      }

      // Check if username is already taken
      const existingClient = await db
        .select()
        .from(clients)
        .where(eq(clients.username, username))
        .limit(1);

      if (existingClient.length > 0 && existingClient[0].id !== clientId) {
        return NextResponse.json(
          { success: false, error: 'Username is already taken. Please choose another one.' },
          { status: 400 }
        );
      }
    }

    // Update the client's settings
    const updateData: any = {};
    if (username) updateData.username = username.trim();
    if (captureName !== undefined) updateData.captureName = captureName || false;
    if (capturePhone !== undefined) updateData.capturePhone = capturePhone || false;

    await db
      .update(clients)
      .set(updateData)
      .where(eq(clients.id, clientId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while updating your settings.' },
      { status: 500 }
    );
  }
}
