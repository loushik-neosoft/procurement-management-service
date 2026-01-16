import dotenv from 'dotenv';
import z from 'zod';

dotenv.config();
dotenv.config({ path: '.env.local' });

const envConfig = {
    JWT_SECRET: process.env.JWT_SECRET || 'supersceterjwtkey',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    DATABASE_URL: process.env.DATABASE_URL || '',
    PORT: parseInt(process.env.PORT || '8000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
};


const envSchema = z.object({
    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    PORT: z.number().int().min(1),
    NODE_ENV: z.enum(['development', 'staging', 'production']),
});

const validateEnv = (envCfg: typeof envConfig) => {
    const parsedEnv = envSchema.safeParse(envCfg);
    if (!parsedEnv.success) {
        throw new Error(`Invalid environment variables: ${parsedEnv.error.issues.map(issue => issue.path.join('.') + ': ' + issue.message).join(', ')}`);
    }
    return parsedEnv.data;
};

validateEnv(envConfig);

export default envConfig;
