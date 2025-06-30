import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export async function authMiddleware(req: AuthenticatedRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as jwt.JwtPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    return NextResponse.next();
  } catch (error) {
    return NextResponse.json(
      { error: "غير مصرح لك بالوصول" },
      { status: 401 }
    );
  }
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async function (req: NextRequest) {
    const authResponse = await authMiddleware(req as AuthenticatedRequest);
    if (authResponse.status === 401) {
      return authResponse;
    }
    return handler(req as AuthenticatedRequest);
  };
}
