import { JobStatus, Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma/client";
import { StringLiteral } from "typescript";



type JobApplication = {
    clientAccountId: string;
    workscoutAccountId: string;
    jobName: string;
    bookmarked?: boolean
    company: string;
    status: JobStatus;
    category: string;
    appliedDate:  string;
    deadlineDate: string;
}




type UpdateJob = {
    jobId: string;
    jobName: string;
    bookmarked?: boolean
    company?: string;
    status?: JobStatus;
    category?: string;
    deadlineDate?: string;

}

type ResponseType = {
    data: any;
    error: string;
    status: number
}


export async function createJobApplication(jobData: JobApplication): Promise<ResponseType> {
    try {

        const [jobapplication] = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            let jobapplication = await tx.jobApplication.create({
                data:{
                    jobName:jobData.jobName,
                    category:jobData.category,
                    clientId:jobData.clientAccountId,
                    workscoutId:jobData.workscoutAccountId,
                    status:jobData.status,
                    company:jobData.company,
                    appliedDate:new Date(jobData.appliedDate),
                    deadlineDate:new Date(jobData.deadlineDate),
                    bookmarked:jobData.bookmarked
                }
            })

  
            return [jobapplication]
        })


        return {
            error: "",
            data: { jobapplication},
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

        const updatedjob = await prisma.jobApplication.update({
            where: {
                id: jobData.jobId
            },
            data: {
                jobName: jobData.jobName,
                company: jobData.company,
                bookmarked: jobData.bookmarked,
                category:jobData.category.toUpperCase(),
                status: jobData.status,
                deadlineDate:new Date(jobData.deadlineDate),
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

        const jobs = await prisma.jobApplication.findMany({
            include:{
                workscout:{
                    select:{
                        email:true
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

        const job = await prisma.jobApplication.findUnique({
            where: {
                id: jobid
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


export async function getBookmarkedJobsByAccount(accountId: string, bookmarked:boolean): Promise<ResponseType> {
    try {

        const [bookmarkedjob] = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            let bookmarkedjob = await tx.jobApplication.findMany({
                where: {
                    clientId: accountId,
                    bookmarked:bookmarked
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



export async function deleteJob(jobid: string): Promise<ResponseType> {
    try {

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            
            await tx.jobApplication.delete({
                where: {
                    id: jobid
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