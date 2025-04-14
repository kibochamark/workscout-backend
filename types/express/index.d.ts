// types/express/index.d.ts
import { Request } from "express";
import {Account } from "@prisma/client"

declare global {
  namespace Express {
    interface Request {
      // kindeId?: string;
      user?: Account;
    }
  }
}
