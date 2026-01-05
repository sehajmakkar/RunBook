import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import { GoalType, Priority } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/goals/[id]
 * Get a specific goal by ID
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const supabaseUser = await getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error fetching goal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/goals/[id]
 * Update a specific goal
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const supabaseUser = await getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify ownership
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, type, priority, completed, order } = body;

    // Build update data
    const updateData: {
      title?: string;
      description?: string | null;
      type?: GoalType;
      priority?: Priority;
      completed?: boolean;
      order?: number;
    } = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (priority !== undefined) updateData.priority = priority;
    if (completed !== undefined) updateData.completed = completed;
    if (order !== undefined) updateData.order = order;

    const goal = await prisma.goal.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/goals/[id]
 * Delete a specific goal
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const supabaseUser = await getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify ownership
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    await prisma.goal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
