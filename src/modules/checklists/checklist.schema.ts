import { z } from 'zod';

export const questionTypeSchema = z.enum([
    'BOOLEAN',
    'DROPDOWN',
    'MULTI_SELECT',
    'TEXT',
    'IMAGE_UPLOAD'
]);

export const questionSchema = z.object({
    key: z.string(),
    label: z.string(),
    type: questionTypeSchema,
    required: z.boolean().default(true),
    options: z.array(z.string()).optional(), // For DROPDOWN and MULTI_SELECT
    orderIndex: z.number().int().nonnegative(),
});

export type Question = z.infer<typeof questionSchema>;

export const createChecklistTemplateSchema = z.object({
    name: z.string().min(3),
    clientId: z.uuid().optional(),
    source: z.enum(['DEFAULT', 'CLIENT']).default('DEFAULT'),
    questions: z.array(questionSchema).min(3),
});

export type CreateChecklistTemplateType = z.infer<typeof createChecklistTemplateSchema>;

export const updateChecklistTemplateSchema = createChecklistTemplateSchema.partial();

export type UpdateChecklistTemplateType = z.infer<typeof updateChecklistTemplateSchema>;
