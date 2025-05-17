// create a room

import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma/client";

type ResponseType = {
    data?: any,
    status: number,
    error?: any
}


export const createroom = async (): Promise<ResponseType> => {
    try {
        const room = await prisma.chatRoom.create({
            data: {
                createdAt: new Date(),
            },
            select: {
                id: true,
                createdAt: true,
            }
        })

        return {
            data: room,
            status: 201
        }
    } catch (err) {
        console.error("Error creating room:", err);
        return {
            data: null,
            status: 500,
            error: err
        }
    }
}



// create a new message
export const sendMessage = async (roomId: string, content: string, senderId: string, receiverId: string): Promise<ResponseType> => {
    try {
        const [message, notification] = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const message = await tx.message.create({
                data: {
                    content,
                    sender: { connect: { id: senderId } },
                    room: { connect: { id: roomId } },
                    receiver: { connect: { id: receiverId } }
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            profile: {
                                select: { name: true, email: true },
                            },
                        },
                    },
                    receiver: {
                        select: {
                            id: true,
                            profile: {
                                select: { name: true, email: true },
                            },
                        },
                    }
                },
            });

            const notification = await tx.notification.create({
                data: {
                    messageId: message.id,
                    receiverId: receiverId,
                    content: message.content
                }
            })

            return [message, notification]
        })

        return {
            data: message,
            status: 201
        }
    } catch (e) {
        console.error("Error sending message:", e);
        return {
            data: null,
            status: 500,
            error: e
        }
    }
}



// get all messages in a room
export const getMessages = async (roomId: string): Promise<ResponseType> => {
    try {
        const messages = await prisma.message.findMany({
            where: {
                roomId: roomId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        profile: {
                            select: { name: true, email: true },
                        },
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        profile: {
                            select: { name: true, email: true },
                        },
                    },
                }
            }
        })

        return {
            data: messages,
            status: 200
        }
    } catch (e) {
        console.error("Error getting messages:", e);
        return {
            data: null,
            status: 500,
            error: e
        }
    }
}

// get a specific message
export const getMessage = async (messageId: string): Promise<ResponseType> => {
    try {
        const message = await prisma.message.findUnique({
            where: {
                id: messageId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        profile: {
                            select: { name: true, email: true },
                        },
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        profile: {
                            select: { name: true, email: true },
                        },
                    },
                }
            }
        })

        return {
            data: message,
            status: 200
        }
    }
    catch (e) {
        console.error("Error getting message:", e);
        return {
            data: null,
            status: 500,
            error: e
        }
    }
}
// get all rooms
export const getRooms = async (): Promise<ResponseType> => {
    try {
        const rooms = await prisma.chatRoom.findMany({

        })

        return {
            data: rooms,
            status: 200
        }
    } catch (e) {
        console.error("Error getting rooms:", e);
        return {
            data: null,
            status: 500,
            error: e
        }
    }
}


// get notifications of a specific user
export const getNotifications = async (userId: string): Promise<ResponseType> => {
    try {

        const [notificationsCount, notifications] = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const notificationsCount = await tx.notification.count({
                where: {
                    receiverId: userId,
                    deleted: false
                }
            })
            const notifications = await tx.notification.findMany({
                where: {
                    receiverId: userId,
                    deleted: false
                }
            })

            return [notificationsCount, notifications]
        })


        return {
            data: { notifications, notificationsCount },
            status: 200
        }
    } catch (e) {
        console.error("Error getting notifications:", e);
        return {
            data: null,
            status: 500,
            error: e
        }
    }
}



// delete a notification - this is acts as reading a notification
export const deleteNotification = async (notificationId: string): Promise<ResponseType> => {
    try {
        const notification = await prisma.notification.update({
            where: {
                id: notificationId
            },
            data: {
                deleted: true
            }
        })

        const message = await prisma.message.update({
            where: {
                id: notification.messageId
            },
            data: {
                read: true
            }
        })

        return {
            data: notification,
            status: 200
        }
    } catch (e) {
        console.error("Error deleting notification:", e);
        return {
            data: null,
            status: 500,
            error: e
        }
    }
}


// delete a message
export const deleteMessage = async (messageId: string): Promise<ResponseType> => {
    try {
        const message = await prisma.message.delete({
            where: {
                id: messageId
            }
        })

        return {
            data: message,
            status: 200
        }
    } catch (e) {
        console.error("Error deleting message:", e);
        return {
            data: null,
            status: 500,
            error: e
        }
    }
}
// delete a room
export const deleteRoom = async (roomId: string): Promise<ResponseType> => {
    try {
        // delete room, messages and notifications in a transaction
        const [room] = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const room = await tx.chatRoom.delete({
                where: {
                    id: roomId
                }
            })

            // First, get all message IDs in the room
            const messages = await tx.message.findMany({
                where: {
                    roomId: roomId
                },
                select: { id: true }
            });
            const messageIds = messages.map((message: { id: string }) => message.id);

            // Delete notifications related to those messages
            await tx.notification.deleteMany({
                where: {
                    messageId: { in: messageIds }
                }
            });

            // Delete the messages themselves
            await tx.message.deleteMany({
                where: {
                    roomId: roomId
                }
            });

            return [room]
        })

        return {
            data: room,
            status: 200
        }
    } catch (e) {
        console.error("Error deleting room:", e);
        return {
            data: null,
            status: 500,
            error: e
        }
    }
}

// delete manay notifications
export const deleteManyNotifications = async (notificationIds: string[]): Promise<ResponseType> => {
    try {
        const availableNotifications = await prisma.notification.findMany({
            where: {
                id: { in: notificationIds }
            }
        })
        const availableNotificationsMessageIds = availableNotifications.map((notification: { messageId: string }) => notification.messageId);

        const notifications = await prisma.notification.updateMany({
            where: {
                id: { in: notificationIds }
            },
            data: {
                deleted: true
            }
        })
      
        const messages = await prisma.message.updateMany({
            where: {
                id: { in: availableNotificationsMessageIds }
            },
            data: {
                read: true
            }
        })

        return {
            data: notifications,
            status: 200
        }
    } catch (e) {
        console.error("Error deleting notifications:", e);
        return {
            data: null,
            status: 500,
            error: e
        }
    }
}





// get a all messages
export const getAllMessages = async (userid:string): Promise<ResponseType> => {
    try {
        const messages = await prisma.message.findMany({  
            where:{
                receiverId:userid
            },
            select: {
                id: true,
                content: true,
                createdAt: true,
                roomId:true,
                sender: {
                    select: {
                        id: true,
                        profile: {
                            select: { name: true, email: true },
                        },
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        profile: {
                            select: { name: true, email: true },
                        },
                    },
                },
                read: true,
            },
            orderBy: {
                id: 'desc',
            },
            take: 1,
        })

        return {
            data: messages,
            status: 200
        }
    }
    catch (e) {
        console.error("Error getting message:", e);
        return {
            data: null,
            status: 500,
            error: e
        }
    }
}