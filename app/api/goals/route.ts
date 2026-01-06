import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import { GoalType, Priority } from "@prisma/client";

/**
 * GET /api/goals
 * Get all goals for the current user
 */
export async function GET(request: Request) {
  try {
    const supabaseUser = await getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get optional type filter from query params
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get("type") as GoalType | null;

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const goals = await prisma.goal.findMany({
      where: {
        userId: user.id,
        ...(typeFilter && { type: typeFilter }),
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/goals
 * Create a new goal or batch create goals (for onboarding)
 */
export async function POST(request: Request) {
  try {
    const supabaseUser = await getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    // Check if batch create (array of goals from onboarding)
    if (Array.isArray(body.goals)) {
      // Get current max order
      const lastGoal = await prisma.goal.findFirst({
        where: { userId: user.id },
        orderBy: { order: "desc" },
      });

      let currentOrder = lastGoal ? lastGoal.order + 1 : 0;

      const goals = await prisma.goal.createMany({
        data: body.goals.map(
          (goal: { title: string; description?: string }) => ({
            title: goal.title,
            description: goal.description || null,
            type: GoalType.DAILY,
            priority: Priority.DEFAULT,
            userId: user.id,
            order: currentOrder++,
          })
        ),
      });

      // Fetch the created goals
      const createdGoals = await prisma.goal.findMany({
        where: { userId: user.id },
        orderBy: { order: "desc" },
        take: body.goals.length,
      });

      return NextResponse.json(createdGoals, { status: 201 });
    }

    // Single goal creation
    const { title, description, type, priority } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Get current max order
    const lastGoal = await prisma.goal.findFirst({
      where: { userId: user.id },
      orderBy: { order: "desc" },
    });

    const goal = await prisma.goal.create({
      data: {
        title,
        description: description || null,
        type: type || GoalType.DAILY,
        priority: priority || Priority.DEFAULT,
        userId: user.id,
        order: lastGoal ? lastGoal.order + 1 : 0,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
