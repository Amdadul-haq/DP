// lib/auth.ts
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import pool from './db';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export interface CustomJWTPayload {
  userId: number;
  iat?: number;
  exp?: number;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  bmdc_reg: string;
  specialty: string | null;
  role: string;
  doctor_id?: number;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(':');
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = scryptSync(password, salt, 64) as Buffer;
  return timingSafeEqual(keyBuffer, derivedKey);
}

export async function createJWT(payload: CustomJWTPayload): Promise<string> {
  // Convert our CustomJWTPayload to a format compatible with jose
  const josePayload: { [key: string]: string | number | undefined } = {
    userId: payload.userId.toString(),
  };
  
  if (payload.iat) josePayload.iat = payload.iat;
  if (payload.exp) josePayload.exp = payload.exp;

  return new SignJWT(josePayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<CustomJWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Convert the jose JWTPayload to our CustomJWTPayload
    const userId = payload.userId as string;
    const customPayload: CustomJWTPayload = {
      userId: parseInt(userId, 10),
    };
    
    if (payload.iat) customPayload.iat = Number(payload.iat);
    if (payload.exp) customPayload.exp = Number(payload.exp);
    
    return customPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function getUserFromSession(token: string): Promise<User | null> {
  try {
    const payload = await verifyJWT(token);
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, bmdc_reg, specialty, role, doctor_id FROM users WHERE id = $1',
      [payload.userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    return null;
  }
}