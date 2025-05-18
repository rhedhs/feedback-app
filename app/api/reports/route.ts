import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    const format = searchParams.get('format') || 'json';
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    const feedbackItems = await prisma.feedback.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });
    
    if (format === 'json') {
      // Return JSON data
      return NextResponse.json({
        sessionId,
        generated: new Date().toISOString(),
        feedbackCount: feedbackItems.length,
        items: feedbackItems,
      });
    } else {
      // For other formats, we'll need to implement PDF generation
      // This would typically be done server-side with a library
      return NextResponse.json(
        { error: 'Unsupported format' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}