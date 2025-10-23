import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { capturePages } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface RouteParams {
  params: {
    clientId: string;
    slug: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { clientId, slug } = params;

    // Find the capture page
    const page = await db
      .select()
      .from(capturePages)
      .where(and(
        eq(capturePages.clientId, clientId),
        eq(capturePages.slug, slug),
        eq(capturePages.isActive, true)
      ))
      .limit(1);

    if (page.length === 0) {
      return NextResponse.json(
        { error: 'Capture page not found' },
        { status: 404 }
      );
    }

    const pageData = page[0];

    // Return the page data (excluding sensitive fields)
    return NextResponse.json({
      id: pageData.id,
      name: pageData.name,
      slug: pageData.slug,
      headline: pageData.headline,
      subheadline: pageData.subheadline,
      backgroundType: pageData.backgroundType,
      backgroundColor: pageData.backgroundColor,
      backgroundGradient: pageData.backgroundGradient,
      backgroundImage: pageData.backgroundImage,
      textColor: pageData.textColor,
      buttonColor: pageData.buttonColor,
      buttonTextColor: pageData.buttonTextColor,
      fontFamily: pageData.fontFamily,
      captureName: pageData.captureName,
      capturePhone: pageData.capturePhone,
    });

  } catch (error) {
    console.error('Error fetching capture page:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
