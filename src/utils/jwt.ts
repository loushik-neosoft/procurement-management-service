import jwt from 'jsonwebtoken';
import envConfig from '@config/env';

const JWT_SECRET = envConfig.JWT_SECRET;
const JWT_EXPIRES_IN = envConfig.JWT_EXPIRES_IN;

export interface TokenPayload {
    userId: string;
    role: string;
}

export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
};

export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
