import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const plans = await db.pricingPlan.findMany({
    orderBy: { price: "asc" },
  });

  if (plans.length === 0) {
    return NextResponse.json([
      {
        id: "free",
        name: "Free",
        price: 0,
        period: "month",
        description: "Get started with basic AI practice",
        features: [
          "30 minutes of practice per day",
          "450 minutes per month",
          "15 min max session length",
          "Basic grammar corrections",
          "All conversation topics",
          "Community support",
        ],
        cta: "Start Free",
        dailyLimitMinutes: 30,
        monthlyLimitMinutes: 450,
        maxSessionMinutes: 15,
      },
      {
        id: "pro",
        name: "Pro",
        price: 250,
        period: "month",
        description: "Accelerate your English learning",
        features: [
          "60 minutes of practice per day",
          "1,500 minutes per month",
          "30 min max session length",
          "Advanced grammar & pronunciation",
          "Full vocabulary suggestions",
          "Progress analytics",
          "Priority support",
          "Custom voice selection",
          "Accent training",
        ],
        highlighted: true,
        cta: "Upgrade to Pro",
        dailyLimitMinutes: 60,
        monthlyLimitMinutes: 1500,
        maxSessionMinutes: 30,
      },
      {
        id: "premium",
        name: "Premium",
        price: 450,
        period: "month",
        description: "Unlimited English mastery",
        features: [
          "120 minutes of practice per day",
          "3,000 minutes per month",
          "45 min max session length",
          "Everything in Pro",
          "Team dashboard",
          "Custom AI personas",
          "API access",
          "Dedicated support",
          "Custom integrations",
        ],
        cta: "Upgrade to Premium",
        dailyLimitMinutes: 120,
        monthlyLimitMinutes: 3000,
        maxSessionMinutes: 45,
      },
    ]);
  }

  return NextResponse.json(plans);
}
