import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma/client";

/**
 * Create or retrieve an existing chat room between two participants
 * @route POST /api/v1/chat/create-room
 * @body participantAId, participantBId (both Account IDs)
 */
export const createChatRoom = async (req: Request, res: Response): Promise<void> => {
    const { participantAId, participantBId } = req.body;
  
    console.log("Incoming request to create room:");
    console.log("participantAId:", participantAId);
    console.log("participantBId:", participantBId);
  
    if (!participantAId || !participantBId) {
      console.warn("Missing participant IDs in request body");
      res.status(400).json({ error: "Missing participant IDs." });
      return;
    }
  
    try {
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Look up actual Account records from kindeId
        const accountA = await tx.account.findUnique({ where: { kindeId: participantAId } });
        const accountB = await tx.account.findUnique({ where: { kindeId: participantBId } });
  
        if (!accountA || !accountB) {
          throw new Error("One or both accounts not found.");
        }
  
        console.log("Found accounts:", accountA.id, accountB.id);
  
        // Check if a room already exists between these two account IDs
        const existingRoom = await tx.chatRoom.findFirst({
          where: {
            participants: {
              every: {
                accountId: { in: [accountA.id, accountB.id] },
              },
            },
          },
          include: { participants: true },
        });
  
        if (existingRoom) {
          console.log("Existing room found:", existingRoom.id);
          return { room: existingRoom, created: false };
        }
  
        console.log("Creating new chat room...");
        const newRoom = await tx.chatRoom.create({
          data: {
            participants: {
              create: [
                { accountId: accountA.id },
                { accountId: accountB.id },
              ],
            },
          },
          include: { participants: true },
        });
  
        return { room: newRoom, created: true };
      });
  
      res.status(result.created ? 201 : 200).json({
        roomId: result.room.id,
        participants: result.room.participants,
        created: result.created,
      });
  
      console.log(`Responded with room ID: ${result.room.id} | Created: ${result.created}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creating chat room:", error.message);
        res.status(500).json({ error: error.message || "Something went wrong." });
      } else {
        console.error("Unexpected error:", error);
        res.status(500).json({ error: "Unexpected error occurred." });
      }
    }
  };
  
