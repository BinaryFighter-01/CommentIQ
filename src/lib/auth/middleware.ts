// src/lib/auth/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './jwt';
import { logger } from '../logging';

export interface AuthenticatedRequest extends NextRequest {
     userId: string;
     email: string;
}

/**
 * Middleware to authenticate requests
 */
export async function withAuth(
     handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
     return async (req: NextRequest) => {
          try {
               const token = extractTokenFromHeader(req.headers.get('authorization'));

               if (!token) {
                    return NextResponse.json(
                         { error: 'Missing authentication token' },
                         { status: 401 }
                    );
               }

               const payload = verifyToken(token);
               if (!payload) {
                    return NextResponse.json(
                         { error: 'Invalid or expired token' },
                         { status: 401 }
                    );
               }

               // Add user info to request (type assertion needed)
               const authedReq = req as unknown as AuthenticatedRequest;
               authedReq.userId = payload.userId;
               authedReq.email = payload.email;

               return handler(authedReq);
          } catch (error) {
               logger.error('Authentication middleware error', { error });
               return NextResponse.json(
                    { error: 'Internal server error' },
                    { status: 500 }
               );
          }
     };
}
