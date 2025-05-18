import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";
import { z } from "zod";

const shareSchema = z.object({
  feedbackId: z.string(),
  email: z.string().email(),
  canEdit: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { feedbackId, email, canEdit } = shareSchema.parse(body);

    // Find the user to share with
    const userToShareWith = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToShareWith) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if the feedback exists and belongs to the current user
    const feedback = await prisma.feedback.findFirst({
      where: {
        id: feedbackId,
        userId: session.user.id,
      },
    });

    if (!feedback) {
      return new NextResponse("Feedback not found", { status: 404 });
    }

    // Create the share
    const share = await prisma.sharedFeedback.create({
      data: {
        feedbackId,
        sharedById: session.user.id,
        sharedWithId: userToShareWith.id,
        canEdit,
      },
    });

    return NextResponse.json(share);
  } catch (error) {
    console.log("[SHARE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}