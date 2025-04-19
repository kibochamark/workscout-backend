import { JobStatus, Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma/client";
import { StringLiteral } from "typescript";



type JobApplication = {
    clientAccountId: string;
    workscoutAccountId: string;
    title: string;
    bookmarked?: boolean
    company: string;
    status: JobStatus;
    category: string;
    link?: string;
}

type UpdateJob = {
    jobId: string;
    title?: string;
    company?: string;
    bookmarked?: boolean;
    category?: string;
    link?: string;
    status?: JobStatus;
    workscoutId?: string

}

type ResponseType = {
    data: any;
    error: string;
    status: number
}


export async function createJobApplication(jobData: JobApplication): Promise<ResponseType> {
    try {

        const [jostrore, job] = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            let jobstore = await tx.jobApplicationDataStore.findFirst({
                where: {
                    accountId: jobData.clientAccountId
                }
            })

  
            if (!jobstore) {

                // we create a job store for the client
                jobstore = await tx.jobApplicationDataStore.create({
                    data: {
                        accountId: jobData.clientAccountId
                    }
                })



            }
            // we then link the store to a job
            const job = await tx.job.create({
                data: {
                    title: jobData.title,
                    company: jobData.company,
                    jobAppDataStoreId: jobstore.id,
                    workscoutId: jobData.workscoutAccountId,
                    bookmarked: jobData.bookmarked,
                    link: jobData.link,
                    category: jobData.category.toUpperCase(),
                    status: jobData.status
                }
            })


            return [jobstore, job]
        })


        return {
            error: "",
            data: { job, jostrore },
            status: 201
        }

    } catch (e: any) {
        return {
            "error": e?.message,
            data: "",
            status: 400
        }
    }
}


export async function updateJob(jobData: UpdateJob): Promise<ResponseType> {
    try {

        const updatedjob = await prisma.job.update({
            where: {
                id: jobData.jobId
            },
            data: {
                title: jobData.title,
                company: jobData.company,
                workscoutId: jobData.workscoutId,
                bookmarked: jobData.bookmarked,
                link: jobData.link,
                category:jobData.category.toUpperCase(),
                status: jobData.status
            }
        })


        return {
            error: "",
            data: updatedjob,
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

export async function getJobs(): Promise<ResponseType> {
    try {

        const jobs = await prisma.job.findMany({
            include: {
                jobApplicationStore: {
                    select:{
                        account:{
                            select:{
                                email:true
                            }
                        }
                    }
                }
            }
        })


        return {
            error: "",
            data: jobs,
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



export async function getJob(jobid: string): Promise<ResponseType> {
    try {

        const job = await prisma.job.findUnique({
            where: {
                id: jobid
            },
            include: {
                jobApplicationStore: true
            }
        })


        return {
            error: "",
            data: job,
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


export async function getBookmarkedJobsByAccount(accountId: string): Promise<ResponseType> {
    try {

        const [bookmarkedjob] = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            let jobstore = await tx.jobApplicationDataStore.findFirst({
                where: {
                    accountId: accountId
                }
            })

            let bookmarkedjob = await tx.job.findMany({
                where: {
                    jobAppDataStoreId: jobstore.id,
                    bookmarked: true
                }
            })

            return bookmarkedjob
        })




        return {
            error: "",
            data: bookmarkedjob,
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



export async function deleteJob(jobid: string, accountId: string): Promise<ResponseType> {
    try {

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            let job = await tx.job.findUnique({
                where: {
                    id: jobid
                }
            })

            const jobAppDataStoreId = job.jobAppDataStoreId

            await tx.job.delete({
                where: {
                    id: jobid
                }
            })

            await tx.jobApplicationDataStore.delete({
                where: {
                    id: jobAppDataStoreId
                }
            })

        })

        return {
            error: "",
            data: "deleted sucessfully",
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