import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clients, leads } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { email, username, name, phone } = await request.json();

    if (!email || !username) {
      return NextResponse.json(
        { error: 'Email and username are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find the client by username
    const client = await db
      .select()
      .from(clients)
      .where(eq(clients.username, username))
      .limit(1);

    if (client.length === 0) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check if lead already exists for this email and client
    const existingLead = await db
      .select()
      .from(leads)
      .where(and(eq(leads.email, email), eq(leads.clientId, client[0].id)))
      .limit(1);

    if (existingLead.length > 0) {
      return NextResponse.json(
        { error: 'Lead already exists' },
        { status: 409 }
      );
    }

    // Insert the new lead
    const newLead = await db
      .insert(leads)
      .values({
        email,
        name: name || null,
        phone: phone || null,
        clientId: client[0].id,
      })
      .returning();

    console.log('New lead created:', newLead[0]);

    // Call webhook if configured
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
            name: newLead[0].name,
            phone: newLead[0].phone,
            createdAt: newLead[0].createdAt,
          },
          client: {
            id: client[0].id,
            username: client[0].username,
          },
        }),
        });
        console.log('Webhook called successfully');
      } catch (webhookError) {
        console.error('Webhook call failed:', webhookError);
        // Don't fail the request if webhook fails
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        lead: newLead[0],
        redirectUrl: `/${username}/thank-you`
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
