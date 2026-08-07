import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const topics = await db.practiceTopic.findMany();

  if (topics.length === 0) {
    return NextResponse.json([
      { id: "1", title: "Travel & Culture", icon: "plane", level: "All Levels" },
      { id: "2", title: "Business Meetings", icon: "briefcase", level: "Intermediate" },
      { id: "3", title: "Job Interviews", icon: "users", level: "Intermediate" },
      { id: "4", title: "Daily Conversations", icon: "message-circle", level: "Beginner" },
      { id: "5", title: "Academic Discussions", icon: "graduation-cap", level: "Advanced" },
      { id: "6", title: "Technology", icon: "cpu", level: "Intermediate" },
      { id: "7", title: "Health & Wellness", icon: "heart", level: "All Levels" },
      { id: "8", title: "Entertainment", icon: "film", level: "All Levels" },
    ]);
  }

  return NextResponse.json(topics);
}
