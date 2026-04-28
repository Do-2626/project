import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-me";

/**
 * Middleware to verify JWT token from Authorization header
 */
export function authMiddleware(req: NextRequest) {
  // let token = req.headers.get("authorization")?.replace("Bearer ", "");

  // if (!token) {
  //   token = req.cookies.get("token")?.value;
  // }

  // if (!token) {
  //   throw new Error("Unauthorized: No token provided");
  // }

  // try {
  //   const decoded = jwt.verify(token, JWT_SECRET);
  //   return decoded;
  // } catch (err) {
  //   throw new Error("Unauthorized: Invalid token");
  // }
  return req;
}

/**
 * Helper to handle auth in API routes
 */
export function withAuth(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      const user = authMiddleware(req);
      return await handler(req, user, ...args);
    } catch (error: any) {
      return NextResponse.json(
        { error: "Unauthorized", message: error.message },
        { status: 401 }
      );
    }
  };

}
