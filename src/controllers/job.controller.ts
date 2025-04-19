import { Request, Response } from "express";
import { createJobApplication, deleteJob, getBookmarkedJobsByAccount, getJob, getJobs, updateJob } from "../services/job.service";


export const handleCreateJob = async (req: Request, res: Response): Promise<any> => {
  const result = await createJobApplication(req.body);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }
  res.status(result.status).json(result);
};

export const handleUpdateJob = async (req: Request, res: Response): Promise<any> => {
  const result = await updateJob(req.body);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }
  res.status(result.status).json(result);
};

export const handleGetAllJobs = async (_req: Request, res: Response) => {
  const result = await getJobs();
  res.status(result.status).json(result);
};

export const handleGetJobById = async (req: Request, res: Response): Promise<any> => {
  const { jobid } = req.params;
  const result = await getJob(jobid);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }
  res.status(result.status).json(result);
};

export const handleGetBookmarkedJobs = async (req: Request, res: Response): Promise<any> => {
  const { accountId } = req.params;
  const result = await getBookmarkedJobsByAccount(accountId);
  res.status(result.status).json(result);
};

export const handleDeleteJob = async (req: Request, res: Response): Promise<any> => {
  const { jobid, accountId } = req.params;
  const result = await deleteJob(jobid, accountId);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }
  res.status(result.status).json(result);
};
