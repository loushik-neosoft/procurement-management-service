import { z } from 'zod';

export const checklistAnswerSchema = z.record(z.string(), z.any()); // Simplest form: key-value

// More strict validation based on question type will be done in service
export const submitChecklistSchema = z.object({
    orderId: z.uuid(),
    answers: checklistAnswerSchema,
    isFinal: z.boolean().default(false),
});

export type SubmitChecklistDto = z.infer<typeof submitChecklistSchema>;
