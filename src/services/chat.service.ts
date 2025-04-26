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