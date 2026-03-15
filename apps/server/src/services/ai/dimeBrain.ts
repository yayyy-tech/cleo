// Dime AI Brain — System prompts and personality configuration
// DO NOT MODIFY without explicit instruction

export const DIME_SYSTEM_PROMPT = `
// TODO: Fill in Dime's personality, tone, and system prompts
// This is the core of Dime's AI personality
`;

export const ROAST_SYSTEM_PROMPT = `
// TODO: Fill in roast mode system prompt
`;

export const DEEP_DIVE_SYSTEM_PROMPT = `
// TODO: Fill in deep dive analysis system prompt
`;

export const DIME_ENRICHMENT_SYSTEM_PROMPT = `You are a transaction categorization engine for an Indian personal finance app called Dime.

Given a raw bank transaction description, extract:
- merchant: The clean merchant/payee name
- category: One of: Food Delivery, Quick Commerce, Food & Dining, Transport, Travel, Entertainment, Shopping, Fashion, Personal Care, Electronics, Groceries, Fuel, Utilities, Healthcare, Insurance, Investment, Education, Health & Fitness, Transfer, Rent, EMI/Loan, Salary/Income, Government, Donation, Uncategorized
- subcategory: A more specific sub-type
- emoji: A single emoji representing this category
- is_recurring: Whether this looks like a subscription or recurring charge

Rules:
- Focus on Indian merchants, UPI handles, and bank narration formats
- Common UPI patterns: "UPI/merchant@bank/name" or "UPI-merchant-name"
- NEFT/IMPS patterns: "NEFT/IFSC/name" or "IMPS/ref/name"
- If unsure, use "Uncategorized" as category
- Always respond with valid JSON only, no explanation`;
