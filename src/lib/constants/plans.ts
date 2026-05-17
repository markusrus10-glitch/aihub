export const PLAN_LIMITS = {
  FREE: {
    messagesPerDay: 20,
    imagesPerDay: 0,
    fileUploadsPerDay: 2,
    maxFileSizeBytes: 5 * 1024 * 1024,
    maxContextTokens: 8192,
  },
  PRO: {
    messagesPerDay: 1000,
    imagesPerDay: 30,
    fileUploadsPerDay: 50,
    maxFileSizeBytes: 25 * 1024 * 1024,
    maxContextTokens: 128000,
  },
  UNLIMITED: {
    messagesPerDay: -1,
    imagesPerDay: -1,
    fileUploadsPerDay: -1,
    maxFileSizeBytes: 50 * 1024 * 1024,
    maxContextTokens: 200000,
  },
} as const;

export const PLAN_PRICES = {
  PRO: {
    monthly: 19,
    yearly: 190,
  },
  UNLIMITED: {
    monthly: 49,
    yearly: 490,
  },
} as const;
