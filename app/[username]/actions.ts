'use server';

import { db } from '@/lib/db';
import { clients, leads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

// Generate a simple hash for basic security
function generateSecurityHash(email: string, username: string): string {
  const secret = process.env.SECURITY_HASH_SECRET || 'default-secret';
  return crypto
    .createHash('sha256')
    .update(`${email}:${username}:${secret}`)
    .digest('hex')
    .slice(0, 16);
}

export async function submitLead(email: string, username: string) {
  try {
    // Basic email validation
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // Find the client by username
    const client = await db
      .select()
      .from(clients)
      .where(eq(clients.username, username))
      .limit(1);

    if (client.length === 0) {
      return { success: false, error: 'Invalid capture page.' };
    }

    // Check if this email already exists for this client
    const existingLead = await db
      .select()
      .from(leads)
      .where(eq(leads.email, email))
      .where(eq(leads.clientId, client[0].id))
      .limit(1);

    if (existingLead.length > 0) {
      // Still redirect to thank you page, but don't create duplicate
      redirect(`/${username}/thank-you`);
    }

    // Insert the new lead
    const newLead = await db
      .insert(leads)
      .values({
        email: email.trim().toLowerCase(),
        clientId: client[0].id,
      })
      .returning();

    // Call webhook if client has one configured
    if (client[0].webhookUrl) {
      try {
        await fetch(client[0].webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'new_lead',
            lead: {
              id: newLead[0].id,
              email: newLead[0].email,
              createdAt: newLead[0].createdAt,
            },
            client: {
              id: client[0].id,
              username: client[0].username,
              email: client[0].email,
            },
          }),
        });
      } catch (webhookError) {
        console.error('Webhook call failed:', webhookError);
        // Don't fail the lead submission if webhook fails
      }
    }

    // Redirect to thank you page
    redirect(`/${username}/thank-you`);

  } catch (error) {
    console.error('Error submitting lead:', error);
    return { 
      success: false, 
      error: 'An error occurred while submitting your information. Please try again.' 
    };
  }
}
