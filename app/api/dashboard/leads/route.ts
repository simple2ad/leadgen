import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(request: NextRequest) {
  try {
    // Get client ID and lead ID from query parameters
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const leadId = searchParams.get('leadId');
    
    if (!clientId || !leadId) {
      return NextResponse.json(
        { success: false, error: 'Client ID and Lead ID required' },
        { status: 400 }
      );
    }

    // Verify the lead belongs to the client before deleting
    const lead = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    if (lead.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lead not found.' },
        { status: 404 }
      );
    }

    if (lead[0].clientId !== clientId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to delete this lead.' },
        { status: 403 }
      );
    }

    // Delete the lead
    await db
      .delete(leads)
      .where(eq(leads.id, leadId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while deleting the lead.' },
      { status: 500 }
    );
  }
}
