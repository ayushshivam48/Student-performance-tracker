import jwt from 'jsonwebtoken';
import { type Request, type Response, type NextFunction } from 'express';
import type { JWTPayload, UserRole } from '../utils/roles.js';

declare global {
	namespace Express {
		interface Request {
			user?: JWTPayload;
		}
	}
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
	const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

	if (!token) {
		console.log('❌ Authentication failed: No token provided');
		return res.status(401).json({ message: 'Access token is required' });
	}

	// Check if JWT_SECRET is configured
	if (!process.env.JWT_SECRET) {
		console.error('❌ JWT_SECRET environment variable is not set');
		return res.status(500).json({ message: 'Server configuration error' });
	}

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
		req.user = payload;
		console.log(`✅ User authenticated: ${payload.userId} (${payload.role})`);
		return next();
	} catch (error) {
		console.error('❌ Token verification failed:', error instanceof Error ? error.message : 'Unknown error');

		if (error instanceof jwt.TokenExpiredError) {
			return res.status(401).json({ message: 'Token has expired' });
		} else if (error instanceof jwt.JsonWebTokenError) {
			return res.status(401).json({ message: 'Invalid token format' });
		} else {
			return res.status(401).json({ message: 'Token verification failed' });
		}
	}
}

export function authorize(...allowed: UserRole[]) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
		if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
		return next();
	};
}