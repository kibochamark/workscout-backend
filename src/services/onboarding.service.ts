import { prisma } from "../utils/prisma/client";



type OnboardingStatusType={
    error:string;
    data:any;
}


export async function getOnboardingStatus(kindeId: string):Promise<OnboardingStatusType> {
    try {
        // fetch user acc
        const acc = await prisma.account.findUnique({
            where: {
                kindeId
            }
        })

        if (!acc) {
            throw new Error("Account not found")
        }


        return {
            error: "",
            data: acc.isOnboarded
        }

    } catch (e: any) {
        return {
            "error": e?.message,
            data: ""
        }
    }
}



