import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { capturePages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;

    // Find the capture page by slug
    const page = await db
      .select()
      .from(capturePages)
      .where(eq(capturePages.slug, slug))
      .limit(1);

    if (page.length === 0) {
      return NextResponse.json(
        { error: 'Capture page not found' },
        { status: 404 }
      );
    }

    const pageData = page[0];

    // Return the client ID for redirection
    return NextResponse.json({
      clientId: pageData.clientId,
      slug: pageData.slug,
    });

  } catch (error) {
    console.error('Error resolving capture page:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
