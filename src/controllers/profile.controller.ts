import { Request, Response } from "express";

import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma/client";

export const createProfile = async (req: Request, res: Response): Promise<void> => {
  
  const { name, bio, document, kindeId } = req.body;




  const file = req.file

  if (!file) {
    res.status(400).json({ error: "No file uploaded" })
    return
  }

  try {
    // Start a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create the Document
      const newDocument = await tx.document.create({
        data: {
          name: file.originalname,
          contentType: file.mimetype,
          data: file.buffer,
        },
      });
    
      // 2. Find the account by kindeId
      const account = await tx.account.findUnique({
        where: { kindeId },
      });
    
      if (!account) {
        throw new Error("Account not found.");
      }
    
      // 3. Upsert the Profile
      const profile = await tx.profile.upsert({
        where: { accountId: account.id },
        update: {
          name,
          bio,
          email: account.email,
          gender: "", // You can allow gender/location update if needed
          location: "",
          salary: "",
          jobtitle: "",
          documentId: newDocument.id, // Update with the new document
        },
        create: {
          name,
          bio,
          email: account.email,
          gender: "",
          location: "",
          salary: "",
          jobtitle: "",
          documentId: newDocument.id,
          accountId: account.id,
        },
      });
    
      return { profile, newDocument };
    });
    

    // Return the created profile
    res.status(201).json(result.profile);
  } catch (error: unknown) {  // Explicitly typing the error as 'unknown'
    if (error instanceof Error) {
      console.error(error.message);  // Accessing the error message if it is an instance of Error
      res.status(500).json({ error: error.message || "Something went wrong." });
    } else {
      console.error("Unexpected error:", error); // Handle unexpected errors
      res.status(500).json({ error: "Something went wrong." });
    }
  }
};
