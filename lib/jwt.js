import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function generateToken(payload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  return token;
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return { valid: true, payload };
  } catch (error) {
    console.error('JWT verification error:', error);
    return { valid: false, payload: null };
  }
}

export async function verifyAuth(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { valid: false, userId: null, email: null, role: null };
    }

    const result = await verifyToken(token);

    if (!result.valid) {
      return { valid: false, userId: null, email: null, role: null };
    }

    return {
      valid: true,
      userId: result.payload.userId,
      email: result.payload.email,
      role: result.payload.role,
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { valid: false, userId: null, email: null, role: null };
  }
}