import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma/client";

type ResponseType = {
    data: any;
    error: string;
    status: number
}

export const getUnreadMessages = async (kindeId: string): Promise<ResponseType> => {

    try {

        const [messages] = await prisma.$transaction(async(tx:Prisma.TransactionClient)=>{

            const acc = await tx.account.findUnique({
                where:{
                    kindeId:kindeId
                }
            })

            const roomids= await tx.chatParticipant.findMany({
                where:{
                    accountId:acc.id
                },
                select:{
                    roomId:true
                }
            })

            const messages = await tx.chatMessage.findMany({
                where:{
                    roomId:{
                        in:roomids.flatMap(room=> room.roomId)
                    },
                    read:false
                }
            })


            return messages

        })

        return {
            "error": "",
            data: messages,
            status: 200
        }
    } catch (e: any) {
        return {
            "error": e?.message,
            data: "",
            status: 400
        }
    }

}



const createConversation = async ({
    participantIds,
    title,
  }: {
    participantIds: string[]; // array of Account IDs
    title?: string; // optional, for group chats
  }) => {
    if (participantIds.length < 2) {
      throw new Error("A conversation requires at least two participants.");
    }
  
    const isGroup = participantIds.length > 2 || !!title;
  
    const conversation = await prisma.chatConversation.create({
      data: {
        title: title ?? null,
        isGroup,
        participants: {
          create: participantIds.map((accountId) => ({ accountId })),
        },
      },
      include: {
        participants: {
          include: {
            account: {
              select: {
                id: true,
                profile: { select: { name: true } },
              },
            },
          },
        },
      },
    });
  
    return conversation;
  };
  



  const sendMessage = async (
    conversationId: string,
    senderId: string,
    content: string
  ) => {
    const message = await prisma.chatNewMessage.create({
      data: {
        content,
        senderId,
        conversationId,
      },
    });
  
    return message;
  };



  const getMessages = async (conversationId: string) => {
    const messages = await prisma.chatNewMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            id: true,
            profile: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  
    return messages;
  };
  
  

      
      
  const getUserConversations = async (userId: string) => {
    const conversations = await prisma.chatConversation.findMany({
      where: {
        participants: {
          some: { accountId: userId },
        },
      },
      include: {
        participants: {
          include: {
            account: {
              select: {
                id: true,
                profile: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // Only fetch the latest message
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  
    return conversations;
  };
  