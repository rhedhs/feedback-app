"use server";

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import type { Feedback } from '@/types/feedback';

/**
 * Create a new feedback entry
 */
export async function createFeedback(data: {
  title: string;
  description: string;
  path: string;
  type: string;
  severity?: string;
  screenshot?: string;
  sessionId: string;
}) {
  try {
    // Validate required fields
    if (!data.title || !data.description || !data.path || !data.type || !data.sessionId) {
      throw new Error('Missing required fields');
    }

    const feedback = await prisma.feedback.create({
      data: {
        title: data.title,
        description: data.description,
        path: data.path,
        type: data.type,
        severity: data.severity || 'medium',
        screenshot: data.screenshot,
        sessionId: data.sessionId,
      },
    });

    // Revalidate the homepage to show the new feedback
    revalidatePath('/');

    return { success: true, data: feedback };
  } catch (error) {
    console.error('Error creating feedback:', error);
    return { success: false, error: 'Failed to create feedback' };
  }
}

/**
 * Get all feedback items for a specific session
 */
export async function getFeedbackBySession(sessionId: string) {
  try {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const feedbackItems = await prisma.feedback.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: feedbackItems };
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return { success: false, error: 'Failed to fetch feedback' };
  }
}

/**
 * Generate a report for a session
 */
export async function generateReport(sessionId: string, format: string = 'json') {
  try {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const feedbackItems = await prisma.feedback.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: {
        sessionId,
        generated: new Date().toISOString(),
        feedbackCount: feedbackItems.length,
        items: feedbackItems,
      }
    };
  } catch (error) {
    console.error('Error generating report:', error);
    return { success: false, error: 'Failed to generate report' };
  }
}