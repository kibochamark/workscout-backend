import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { prisma } from "../../utils/prisma/client";



// Setup JWKS client
const client = jwksClient({
    jwksUri: "https://workscoutuk.kinde.com/.well-known/jwks.json",
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
    if (!header.kid) return callback(new Error("No 'kid' in token header"));
    client.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err);
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
    });
}

interface KindeTokenPayload {
    sub: string; // kindeId
    email: string;
    name:string;
}

export const requireAuthAndEnsureAccount = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing Authorization header" });
        return;
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, getKey, {}, async (err, decoded) => {
        if (err || typeof decoded !== "object") {
            console.error("JWT verification failed:", err);
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { sub: kindeId, email, name } = decoded as KindeTokenPayload;


        if (!kindeId || !email) {
            res.status(400).json({ error: "Invalid token payload" });
            return;
        }

        try {
            let account = await prisma.account.findUnique({ where: { kindeId } });

        
            (req as any).user = account;
            next(); // ✅ Done
        } catch (dbErr) {
            console.error("Database error:", dbErr);
            return res.status(500).json({ error: "Internal server error" });
        }
    });
};