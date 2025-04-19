import Joi from "joi";
import { JobStatus } from "@prisma/client";

// Enums in Joi can be validated as strings with `.valid(...)`
const jobStatusValues = Object.values(JobStatus);

export const createJobSchema = Joi.object({
  clientAccountId: Joi.string().uuid().required(),
  workscoutAccountId: Joi.string().uuid().required(),
  title: Joi.string().required(),
  company: Joi.string().required(),
  category: Joi.string().required(),
  status: Joi.string().valid(...jobStatusValues).required(),
  bookmarked: Joi.boolean().optional(),
  link: Joi.string().uri().optional(),
});

export const updateJobSchema = Joi.object({
  jobId: Joi.string().uuid().required(),
  title: Joi.string().optional(),
  company: Joi.string().optional(),
  workscoutId: Joi.string().uuid().optional(),
  bookmarked: Joi.boolean().optional(),
  category: Joi.string().optional(),
  link: Joi.string().uri().optional(),
  status: Joi.string().valid(...jobStatusValues).optional(),
});

export const getJobSchema = Joi.object({
  jobid: Joi.string().uuid().required(),
});

export const accountIdSchema = Joi.object({
  accountId: Joi.string().uuid().required(),
});

export const deleteJobSchema = Joi.object({
  jobid: Joi.string().uuid().required(),
  accountId: Joi.string().uuid().required(),
});
