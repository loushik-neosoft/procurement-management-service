import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local' });

const envConfig = {
    JWT_SECRET: process.env.JWT_SECRET || 'supersceterjwtkey',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    DATABASE_URL: process.env.DATABASE_URL || '',
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
};

export default envConfig;
