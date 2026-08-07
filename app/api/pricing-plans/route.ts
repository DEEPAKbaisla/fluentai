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
          "5 minutes of practice per day",
          "Basic grammar corrections",
          "Limited vocabulary suggestions",
          "3 conversation topics",
          "Community support",
        ],
        cta: "Start Free",
      },
      {
        id: "pro",
        name: "Pro",
        price: 19,
        period: "month",
        description: "Unlock your full potential",
        features: [
          "Unlimited practice time",
          "Advanced grammar & pronunciation",
          "Full vocabulary suggestions",
          "All conversation topics",
          "Progress analytics",
          "Priority support",
          "Custom voice selection",
          "Accent training",
        ],
        cta: "Start Pro Trial",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: 49,
        period: "month",
        description: "For teams and organizations",
        features: [
          "Everything in Pro",
          "Team dashboard",
          "Custom AI personas",
          "API access",
          "Dedicated account manager",
          "SSO authentication",
          "Custom integrations",
          "SLA guarantee",
        ],
        cta: "Contact Sales",
      },
    ]);
  }

  return NextResponse.json(plans);
}
