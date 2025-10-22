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
