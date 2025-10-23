'use server';

import { db } from '@/lib/db';
import { clients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function updateWebhookUrl(webhookUrl: string) {
  try {
    const headersList = await headers();
    const clientId = headersList.get('x-client-id');

    if (!clientId) {
      return { success: false, error: 'Authentication required.' };
    }

    // Validate URL format if provided
    if (webhookUrl && !isValidUrl(webhookUrl)) {
      return { success: false, error: 'Please enter a valid URL.' };
    }

    // Update the client's webhook URL
    await db
      .update(clients)
      .set({ webhookUrl: webhookUrl || null })
      .where(eq(clients.id, clientId));

    return { success: true };
  } catch (error) {
    console.error('Error updating webhook URL:', error);
    return { 
      success: false, 
      error: 'An error occurred while updating your webhook URL.' 
    };
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

export async function updateUsername(username: string) {
  try {
    const headersList = await headers();
    const clientId = headersList.get('x-client-id');

    if (!clientId) {
      return { success: false, error: 'Authentication required.' };
    }

    // Validate username
    if (!username || username.trim().length < 3) {
      return { success: false, error: 'Username must be at least 3 characters long.' };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return { success: false, error: 'Username can only contain letters, numbers, hyphens, and underscores.' };
    }

    // Check if username is already taken
    const existingClient = await db
      .select()
      .from(clients)
      .where(eq(clients.username, username))
      .limit(1);

    if (existingClient.length > 0 && existingClient[0].id !== clientId) {
      return { success: false, error: 'Username is already taken. Please choose another one.' };
    }

    // Update the client's username
    await db
      .update(clients)
      .set({ username: username.trim() })
      .where(eq(clients.id, clientId));

    return { success: true };
  } catch (error) {
    console.error('Error updating username:', error);
    return { 
      success: false, 
      error: 'An error occurred while updating your username.' 
    };
  }
}

export async function updateFieldSettings(captureName: boolean, capturePhone: boolean) {
  try {
    const headersList = await headers();
    const clientId = headersList.get('x-client-id');

    if (!clientId) {
      return { success: false, error: 'Authentication required.' };
    }

    // Update the client's field settings
    await db
      .update(clients)
      .set({ 
        captureName: captureName || false,
        capturePhone: capturePhone || false
      })
      .where(eq(clients.id, clientId));

    return { success: true };
  } catch (error) {
    console.error('Error updating field settings:', error);
    return { 
      success: false, 
      error: 'An error occurred while updating your field settings.' 
    };
  }
}

export async function testWebhook() {
  try {
    const headersList = await headers();
    const clientId = headersList.get('x-client-id');

    if (!clientId) {
      return { success: false, error: 'Authentication required.' };
    }

    // Get client info including webhook URL
    const client = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (client.length === 0) {
      return { success: false, error: 'Client not found.' };
    }

    const webhookUrl = client[0].webhookUrl;
    if (!webhookUrl) {
      return { success: false, error: 'No webhook URL configured.' };
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

    return { success: true };
  } catch (error) {
    console.error('Error testing webhook:', error);
    return { 
      success: false, 
      error: 'Failed to send test webhook. Please check your webhook URL.' 
    };
  }
}
