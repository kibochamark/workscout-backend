import { Prisma, Subscription } from "@prisma/client";
import { prisma } from "../utils/prisma/client";




type AccountType = {
    error: string;
    data: any;
}


export async function getaccountSubscriptionStatus(kindeId: string): Promise<AccountType> {
    try {
        // fetch user acc
        const acc = await prisma.account.findUnique({
            where: {
                kindeId
            },
            select: {
                subscription: {
                    select: {
                        active: true
                    }
                }
            }
        })

        if (!acc) {
            throw new Error("Account not found")
        }




        return {
            error: "",
            data: acc.subscription.active ? true : false
        }

    } catch (e: any) {
        return {
            "error": e?.message,
            data: ""
        }
    }
}


export async function createaccountSubscription(subscriptionData: {
    plan: "FREE" | "BASIC" | "PRO" | "STANDARD";
    stripecustomerId?: string;
    email: string;
}): Promise<AccountType> {
    try {
        // perform a transaction to ensure ACID when data is affected in two tables

        const [subscription, account] = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const subscription = await tx.subscription.create({
                data: {
                    plan: subscriptionData.plan,
                    stripecustomerId: subscriptionData.stripecustomerId
                }
            })

            const account = await tx.account.update({
                where: {
                    email: subscriptionData.email
                },
                data: {
                    subscriptionId: subscription.id
                }
            })

            return [subscription, account]
        })



        if (!subscription && !account) {
            throw new Error("Unable to create account subscription- acc may not be found")
        }




        return {
            error: "",
            data: {
                subscription,
                account
            }
        }

    } catch (e: any) {
        return {
            "error": e?.message,
            data: ""
        }
    }
}


export async function getaccountbyemail(email: string): Promise<AccountType> {
    try {
        // fetch user acc
        const acc = await prisma.account.findUnique({
            where: {
                email
            }
        })

        if (!acc) {
            throw new Error("Account not found")
        }




        return {
            error: "",
            data: acc
        }

    } catch (e: any) {
        return {
            "error": e?.message,
            data: ""
        }
    }
}


export async function getaccountbycustomerId(customerId: string): Promise<AccountType> {
    try {
        // fetch user acc
        const acc = await prisma.account.findFirst({
            where: {
                subscription: {
                    stripecustomerId: customerId
                }
            }
        })

        if (!acc) {
            throw new Error("Account not found")
        }




        return {
            error: "",
            data: acc
        }

    } catch (e: any) {
        return {
            "error": e?.message,
            data: ""
        }
    }
}



export async function getupdateAccountSubscription(subscriptionData: {
    plan?: "FREE" | "BASIC" | "PRO" | "STANDARD";
    stripecustomerId?: string
    active?:boolean
}, email: string): Promise<AccountType> {
    try {
        // fetch user acc
        const acc = await prisma.account.findUnique({
            where: {
                email
            },
            select: {
                subscriptionId: true
            }
        })

        if (!acc) {
            throw new Error("subscription for the acc is not found")
        }


        const [updatedsub, accountupdated] = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            let updatedsub
            if (acc.subscriptionId) {
                updatedsub = await tx.subscription.upsert({
                    where: {
                        id: acc.subscriptionId
                    },
                    create: {
                        ...subscriptionData
                    },
                    update: {
                        ...subscriptionData
                    },
                })
            }else{
                updatedsub=await tx.subscription.create({
                    data:{
                        ...subscriptionData
                    }
                })
            }


            const accountupdated = await tx.account.update({
                where: {
                    email
                },
                data: {
                    subscriptionId: updatedsub.id,
                    isOnboarded:true
                }
            })

            return [updatedsub, accountupdated]
        })





        return {
            error: "",
            data: updatedsub
        }

    } catch (e: any) {
        return {
            "error": e?.message,
            data: ""
        }
    }
}
