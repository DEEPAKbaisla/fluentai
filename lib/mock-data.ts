export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: "free" | "pro" | "enterprise";
  joinedAt: string;
  streak: number;
}

export interface Conversation {
  id: string;
  date: string;
  duration: number;
  overallScore: number;
  grammarScore: number;
  pronunciationScore: number;
  vocabularyScore: number;
  fluencyScore: number;
  topic: string;
  messages: Message[];
}

export interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
  corrections?: Correction[];
}

export interface Correction {
  type: "grammar" | "vocabulary" | "pronunciation" | "fluency";
  original: string;
  corrected: string;
  explanation: string;
}

export interface ScoreCard {
  label: string;
  score: number;
  change: number;
  icon: string;
}

export interface WeeklyData {
  day: string;
  score: number;
  minutes: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  target: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: "month" | "year";
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export const currentUser: User = {
  id: "1",
  name: "Alex Chen",
  email: "alex@example.com",
  avatar: "/avatars/alex.png",
  plan: "pro",
  joinedAt: "2024-01-15",
  streak: 12,
};

export const recentConversations: Conversation[] = [
  {
    id: "1",
    date: "2025-01-15T10:30:00Z",
    duration: 840,
    overallScore: 87,
    grammarScore: 92,
    pronunciationScore: 85,
    vocabularyScore: 88,
    fluencyScore: 83,
    topic: "Travel Experiences",
    messages: [
      {
        id: "m1",
        role: "ai",
        content:
          "Hello! I'd love to hear about your most memorable travel experience. Where did you go?",
        timestamp: "2025-01-15T10:30:00Z",
      },
      {
        id: "m2",
        role: "user",
        content:
          "Last summer I went to Japan. It was amazing! The food were delicious and the people was very friendly.",
        timestamp: "2025-01-15T10:30:15Z",
        corrections: [
          {
            type: "grammar",
            original: "The food were delicious",
            corrected: "The food was delicious",
            explanation:
              "'Food' is an uncountable noun and takes a singular verb.",
          },
          {
            type: "grammar",
            original: "the people was very friendly",
            corrected: "the people were very friendly",
            explanation:
              "'People' is a plural noun and takes a plural verb.",
          },
        ],
      },
      {
        id: "m3",
        role: "ai",
        content:
          "Japan sounds wonderful! I'm glad you enjoyed it. Could you tell me more about the specific dishes you tried? Try using some descriptive vocabulary!",
        timestamp: "2025-01-15T10:30:30Z",
      },
      {
        id: "m4",
        role: "user",
        content:
          "I tried ramen, sushi, and tempura. The ramen was very testy. I also eat some wagyu beef which was absolutely delicous.",
        timestamp: "2025-01-15T10:30:50Z",
        corrections: [
          {
            type: "vocabulary",
            original: "very testy",
            corrected: "very tasty",
            explanation:
              "'Testy' means irritable. 'Tasty' means delicious.",
          },
          {
            type: "grammar",
            original: "I also eat",
            corrected: "I also ate",
            explanation:
              "Use past tense 'ate' when describing a past event.",
          },
          {
            type: "vocabulary",
            original: "delicous",
            corrected: "delicious",
            explanation: "Spelling correction: delicious.",
          },
        ],
      },
    ],
  },
  {
    id: "2",
    date: "2025-01-14T15:00:00Z",
    duration: 600,
    overallScore: 79,
    grammarScore: 75,
    pronunciationScore: 82,
    vocabularyScore: 80,
    fluencyScore: 78,
    topic: "Technology Trends",
    messages: [],
  },
  {
    id: "3",
    date: "2025-01-13T09:15:00Z",
    duration: 1020,
    overallScore: 91,
    grammarScore: 94,
    pronunciationScore: 88,
    vocabularyScore: 93,
    fluencyScore: 90,
    topic: "Business Communication",
    messages: [],
  },
  {
    id: "4",
    date: "2025-01-12T14:45:00Z",
    duration: 480,
    overallScore: 72,
    grammarScore: 68,
    pronunciationScore: 75,
    vocabularyScore: 74,
    fluencyScore: 71,
    topic: "Daily Routines",
    messages: [],
  },
  {
    id: "5",
    date: "2025-01-11T11:00:00Z",
    duration: 720,
    overallScore: 85,
    grammarScore: 88,
    pronunciationScore: 83,
    vocabularyScore: 86,
    fluencyScore: 84,
    topic: "Environmental Issues",
    messages: [],
  },
];

export const weeklyData: WeeklyData[] = [
  { day: "Mon", score: 78, minutes: 15 },
  { day: "Tue", score: 82, minutes: 20 },
  { day: "Wed", score: 85, minutes: 25 },
  { day: "Thu", score: 81, minutes: 18 },
  { day: "Fri", score: 88, minutes: 30 },
  { day: "Sat", score: 91, minutes: 35 },
  { day: "Sun", score: 87, minutes: 22 },
];

export const monthlyData = Array.from({ length: 30 }, (_, i) => ({
  date: `Jan ${i + 1}`,
  grammar: 70 + Math.random() * 25,
  pronunciation: 65 + Math.random() * 30,
  vocabulary: 72 + Math.random() * 23,
  fluency: 68 + Math.random() * 27,
}));

export const achievements: Achievement[] = [
  {
    id: "1",
    title: "First Conversation",
    description: "Complete your first practice session",
    icon: "mic",
    unlockedAt: "2024-01-15",
    progress: 1,
    target: 1,
  },
  {
    id: "2",
    title: "7-Day Streak",
    description: "Practice for 7 consecutive days",
    icon: "flame",
    unlockedAt: "2024-01-22",
    progress: 7,
    target: 7,
  },
  {
    id: "3",
    title: "Grammar Master",
    description: "Score 90%+ on grammar 10 times",
    icon: "book",
    progress: 8,
    target: 10,
  },
  {
    id: "4",
    title: "Vocabulary Builder",
    description: "Learn 100 new words",
    icon: "brain",
    progress: 67,
    target: 100,
  },
  {
    id: "5",
    title: "Perfect Score",
    description: "Get 100% on any metric",
    icon: "star",
    progress: 0,
    target: 1,
  },
  {
    id: "6",
    title: "Marathon Speaker",
    description: "Practice for 60 minutes in one session",
    icon: "timer",
    progress: 42,
    target: 60,
  },
];

export const pricingPlans: PricingPlan[] = [
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
    highlighted: true,
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
];

export const faqItems = [
  {
    question: "How does the AI pronunciation feedback work?",
    answer:
      "Our AI analyzes your speech in real-time using advanced speech recognition models. It compares your pronunciation against native speaker patterns and provides specific feedback on individual sounds, stress patterns, and intonation.",
  },
  {
    question: "What languages do you support?",
    answer:
      "Currently, we focus on helping non-native English speakers improve their English. We support speakers of 20+ native languages including Spanish, French, German, Chinese, Japanese, Korean, Arabic, and more.",
  },
  {
    question: "Can I practice specific topics?",
    answer:
      "Yes! You can choose from dozens of conversation topics including business communication, travel, technology, daily life, academic discussions, and more. Pro users can also create custom topics.",
  },
  {
    question: "Is my conversation data private?",
    answer:
      "Absolutely. Your conversations are encrypted end-to-end and we never share your data with third parties. You can delete your conversation history at any time from your settings.",
  },
  {
    question: "How is this different from ChatGPT?",
    answer:
      "FluentAI is specifically designed for language learning. While ChatGPT is a general AI assistant, our platform focuses on pronunciation analysis, real-time corrections, progress tracking, and structured learning paths tailored to your skill level.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period. No questions asked.",
  },
];

export const testimonials = [
  {
    id: "1",
    name: "Sarah Kim",
    role: "Software Engineer at Google",
    content:
      "FluentAI helped me improve my English from B2 to C1 in just 3 months. The real-time feedback on pronunciation is incredibly accurate.",
    avatar: "SK",
    rating: 5,
  },
  {
    id: "2",
    name: "Marco Rossi",
    role: "Product Manager at Stripe",
    content:
      "As an Italian speaker, I struggled with English pronunciation for years. The AI feedback is like having a personal tutor available 24/7.",
    avatar: "MR",
    rating: 5,
  },
  {
    id: "3",
    name: "Yuki Tanaka",
    role: "Data Scientist at Meta",
    content:
      "The progress analytics are amazing. I can see exactly where I'm improving and what areas need more work. Highly recommend!",
    avatar: "YT",
    rating: 5,
  },
  {
    id: "4",
    name: "Ahmed Hassan",
    role: "UX Designer at Figma",
    content:
      "The conversation topics are relevant and engaging. I practice during my commute and it feels natural, not like studying.",
    avatar: "AH",
    rating: 5,
  },
];

export const practiceTopics = [
  { id: "1", title: "Travel & Culture", icon: "plane", level: "All Levels" },
  { id: "2", title: "Business Meetings", icon: "briefcase", level: "Intermediate" },
  { id: "3", title: "Job Interviews", icon: "users", level: "Intermediate" },
  { id: "4", title: "Daily Conversations", icon: "message-circle", level: "Beginner" },
  { id: "5", title: "Academic Discussions", icon: "graduation-cap", level: "Advanced" },
  { id: "6", title: "Technology", icon: "cpu", level: "Intermediate" },
  { id: "7", title: "Health & Wellness", icon: "heart", level: "All Levels" },
  { id: "8", title: "Entertainment", icon: "film", level: "All Levels" },
];

export const conversationHistory = [
  {
    id: "1",
    topic: "Travel Experiences",
    date: "2025-01-15",
    duration: 840,
    overallScore: 87,
    grammarScore: 92,
    pronunciationScore: 85,
  },
  {
    id: "2",
    topic: "Technology Trends",
    date: "2025-01-14",
    duration: 600,
    overallScore: 79,
    grammarScore: 75,
    pronunciationScore: 82,
  },
  {
    id: "3",
    topic: "Business Communication",
    date: "2025-01-13",
    duration: 1020,
    overallScore: 91,
    grammarScore: 94,
    pronunciationScore: 88,
  },
  {
    id: "4",
    topic: "Daily Routines",
    date: "2025-01-12",
    duration: 480,
    overallScore: 72,
    grammarScore: 68,
    pronunciationScore: 75,
  },
  {
    id: "5",
    topic: "Environmental Issues",
    date: "2025-01-11",
    duration: 720,
    overallScore: 85,
    grammarScore: 88,
    pronunciationScore: 83,
  },
  {
    id: "6",
    topic: "Job Interviews",
    date: "2025-01-10",
    duration: 960,
    overallScore: 82,
    grammarScore: 80,
    pronunciationScore: 84,
  },
];

export const weakestWords = [
  { word: "entrepreneur", attempts: 12, accuracy: 45 },
  { word: "particularly", attempts: 8, accuracy: 52 },
  { word: "hierarchy", attempts: 6, accuracy: 38 },
  { word: "colonel", attempts: 4, accuracy: 25 },
  { word: "mischievous", attempts: 5, accuracy: 40 },
  { word: "rural", attempts: 9, accuracy: 55 },
  { word: "algorithm", attempts: 7, accuracy: 60 },
  { word: "comfortable", attempts: 11, accuracy: 62 },
];

export const repeatedMistakes = [
  {
    mistake: "Using 'was' instead of 'were' with 'they'",
    count: 15,
    type: "grammar",
  },
  {
    mistake: "Omitting articles (a/an/the)",
    count: 12,
    type: "grammar",
  },
  {
    mistake: "Stress on wrong syllable",
    count: 10,
    type: "pronunciation",
  },
  {
    mistake: "Using present tense for past events",
    count: 8,
    type: "grammar",
  },
  {
    mistake: "Confusing 'their' and 'there'",
    count: 7,
    type: "grammar",
  },
];
