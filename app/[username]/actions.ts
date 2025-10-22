'use server';

import { db, sql } from '@/lib/db';
import { clients, leads } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
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

// Function to create tables if they don't exist
async function ensureTablesExist() {
  try {
    // Try to create clients table
    await sql(`
      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        whop_user_id TEXT UNIQUE NOT NULL,
        email TEXT,
        username TEXT UNIQUE,
        webhook_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Try to create leads table
    await sql(`
      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL,
        client_id UUID REFERENCES clients(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Create indexes
    await sql(`
      CREATE INDEX IF NOT EXISTS idx_leads_client_id ON leads(client_id)
    `);
    await sql(`
      CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email)
    `);
    await sql(`
      CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at)
    `);
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

export async function submitLead(email: string, username: string) {
  try {
    // Basic email validation
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // Ensure tables exist before proceeding
    await ensureTablesExist();

    // Find the client by username
    const client = await db
      .select()
      .from(clients)
      .where(eq(clients.username, username))
      .limit(1);

    // If client doesn't exist, create a temporary one
    let clientRecord;
    if (client.length === 0) {
      // Create a temporary client for this username
      const newClient = await db
        .insert(clients)
        .values({
          whop_user_id: `temp-${username}-${Date.now()}`,
          username: username,
          email: null,
          webhook_url: null,
        })
        .returning();
      clientRecord = newClient[0];
    } else {
      clientRecord = client[0];
    }

    // Check if this email already exists for this client
    const existingLead = await db
      .select()
      .from(leads)
      .where(and(
        eq(leads.email, email),
        eq(leads.clientId, clientRecord.id)
      ))
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
        clientId: clientRecord.id,
      })
      .returning();

    // Call webhook if client has one configured
    if (clientRecord.webhookUrl) {
      try {
        await fetch(clientRecord.webhookUrl, {
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
              id: clientRecord.id,
              username: clientRecord.username,
              email: clientRecord.email,
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
