import { PrismaClient, PlanTier } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed Plans
  await prisma.plan.upsert({
    where: { tier: PlanTier.FREE },
    update: {},
    create: {
      name: "Free",
      tier: PlanTier.FREE,
      monthlyPriceUsd: 0,
      yearlyPriceUsd: 0,
      messagesPerDay: 20,
      imagesPerDay: 0,
      fileUploadsPerDay: 2,
      maxFileSizeBytes: 5 * 1024 * 1024, // 5 MB
      maxContextTokens: 8192,
      allowedModels: ["gpt-4o-mini", "gemini-2.0-flash"],
      features: ["Basic chat", "2 file uploads/day", "8K context"],
    },
  });

  await prisma.plan.upsert({
    where: { tier: PlanTier.PRO },
    update: {},
    create: {
      name: "Pro",
      tier: PlanTier.PRO,
      monthlyPriceUsd: 19,
      yearlyPriceUsd: 190,
      messagesPerDay: 1000,
      imagesPerDay: 30,
      fileUploadsPerDay: 50,
      maxFileSizeBytes: 25 * 1024 * 1024, // 25 MB
      maxContextTokens: 128000,
      allowedModels: [
        "gpt-4o", "gpt-4o-mini", "claude-3-5-sonnet-20241022",
        "gemini-2.0-flash", "gemini-2.5-pro", "deepseek-r1", "grok-2",
      ],
      features: [
        "1000 messages/day", "30 images/day", "50 file uploads/day",
        "All AI models", "128K context", "Priority support",
      ],
    },
  });

  await prisma.plan.upsert({
    where: { tier: PlanTier.UNLIMITED },
    update: {},
    create: {
      name: "Unlimited",
      tier: PlanTier.UNLIMITED,
      monthlyPriceUsd: 49,
      yearlyPriceUsd: 490,
      messagesPerDay: -1,
      imagesPerDay: -1,
      fileUploadsPerDay: -1,
      maxFileSizeBytes: 50 * 1024 * 1024, // 50 MB
      maxContextTokens: 200000,
      allowedModels: ["*"],
      features: [
        "Unlimited messages", "Unlimited images", "Unlimited uploads",
        "All models + BYOK", "200K context", "API access", "Priority support",
      ],
    },
  });

  // Seed system prompts
  const systemPrompts = [
    {
      title: "Helpful Assistant",
      description: "A general-purpose helpful, harmless, and honest AI assistant.",
      content: "You are a helpful, harmless, and honest AI assistant. Provide accurate, clear, and concise responses.",
      category: "CUSTOM" as const,
      isSystem: true,
      isPublic: true,
    },
    {
      title: "Code Expert",
      description: "Expert software engineer who writes clean, production-ready code.",
      content: "You are an expert software engineer. Write clean, well-structured, production-ready code. Explain your decisions. Use modern best practices. Always consider edge cases and error handling.",
      category: "CODING" as const,
      isSystem: true,
      isPublic: true,
    },
    {
      title: "Creative Writer",
      description: "Creative writing assistant for stories, poems, and content.",
      content: "You are a creative writing assistant with expertise in storytelling, poetry, and engaging content creation. Be imaginative, descriptive, and help bring ideas to life with vivid language.",
      category: "CREATIVE" as const,
      isSystem: true,
      isPublic: true,
    },
    {
      title: "Data Analyst",
      description: "Data analysis and visualization expert.",
      content: "You are a data analyst expert. Help analyze data, explain statistical concepts, suggest visualizations, write data processing code (Python/SQL), and derive actionable insights from datasets.",
      category: "ANALYSIS" as const,
      isSystem: true,
      isPublic: true,
    },
    {
      title: "Business Consultant",
      description: "Strategic business and management consultant.",
      content: "You are a strategic business consultant with expertise in management, marketing, finance, and operations. Provide structured, actionable advice. Use frameworks like SWOT, Porter's Five Forces, and OKRs when relevant.",
      category: "BUSINESS" as const,
      isSystem: true,
      isPublic: true,
    },
  ];

  for (const prompt of systemPrompts) {
    await prisma.prompt.upsert({
      where: {
        id: `system-${prompt.title.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {},
      create: {
        id: `system-${prompt.title.toLowerCase().replace(/\s+/g, "-")}`,
        ...prompt,
        tags: [],
      },
    });
  }

  // Seed model configs
  const models = [
    { modelId: "gpt-4o", provider: "openai", displayName: "GPT-4o", contextWindow: 128000, maxOutputTokens: 16384, inputCostPer1k: 0.0025, outputCostPer1k: 0.01, supportsVision: true, supportsTools: true, supportsJson: true, minPlanTier: PlanTier.PRO, sortOrder: 1 },
    { modelId: "gpt-4o-mini", provider: "openai", displayName: "GPT-4o Mini", contextWindow: 128000, maxOutputTokens: 16384, inputCostPer1k: 0.00015, outputCostPer1k: 0.0006, supportsVision: true, supportsTools: true, supportsJson: true, minPlanTier: PlanTier.FREE, sortOrder: 2 },
    { modelId: "claude-3-5-sonnet-20241022", provider: "anthropic", displayName: "Claude 3.5 Sonnet", contextWindow: 200000, maxOutputTokens: 8192, inputCostPer1k: 0.003, outputCostPer1k: 0.015, supportsVision: true, supportsTools: true, supportsJson: true, minPlanTier: PlanTier.PRO, sortOrder: 3 },
    { modelId: "claude-opus-4-5", provider: "anthropic", displayName: "Claude Opus", contextWindow: 200000, maxOutputTokens: 32000, inputCostPer1k: 0.015, outputCostPer1k: 0.075, supportsVision: true, supportsTools: true, supportsJson: true, minPlanTier: PlanTier.UNLIMITED, sortOrder: 4 },
    { modelId: "gemini-2.0-flash", provider: "google", displayName: "Gemini 2.0 Flash", contextWindow: 1000000, maxOutputTokens: 8192, inputCostPer1k: 0.0001, outputCostPer1k: 0.0004, supportsVision: true, supportsTools: true, supportsJson: true, minPlanTier: PlanTier.FREE, sortOrder: 5 },
    { modelId: "gemini-2.5-pro", provider: "google", displayName: "Gemini 2.5 Pro", contextWindow: 1000000, maxOutputTokens: 65536, inputCostPer1k: 0.00125, outputCostPer1k: 0.01, supportsVision: true, supportsTools: true, supportsJson: true, minPlanTier: PlanTier.PRO, sortOrder: 6 },
    { modelId: "deepseek-r1", provider: "deepseek", displayName: "DeepSeek R1", contextWindow: 65536, maxOutputTokens: 8000, inputCostPer1k: 0.00055, outputCostPer1k: 0.00219, supportsVision: false, supportsTools: false, supportsJson: true, minPlanTier: PlanTier.PRO, sortOrder: 7 },
    { modelId: "grok-2-latest", provider: "grok", displayName: "Grok 2", contextWindow: 131072, maxOutputTokens: 131072, inputCostPer1k: 0.002, outputCostPer1k: 0.01, supportsVision: true, supportsTools: true, supportsJson: true, minPlanTier: PlanTier.PRO, sortOrder: 8 },
  ];

  for (const model of models) {
    await prisma.modelConfig.upsert({
      where: { modelId: model.modelId },
      update: {},
      create: {
        ...model,
        inputCostPer1k: model.inputCostPer1k,
        outputCostPer1k: model.outputCostPer1k,
      },
    });
  }

  console.log("✅ Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
