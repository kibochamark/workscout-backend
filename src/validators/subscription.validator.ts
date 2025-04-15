import Joi from "joi";

export const getAccountByEmailSchema = Joi.object({
  email: Joi.string().email().required()
});

export const getAccountByCustomerIdSchema = Joi.object({
  customerId: Joi.string().required()
});

export const createAccountSubscriptionSchema = Joi.object({
  plan: Joi.string().valid("FREE", "BASIC", "PRO", "STANDARD").required(),
  stripecustomerId: Joi.string().optional(),
  startedAt: Joi.date().required(),
  expiresAt: Joi.date().required(),
  email: Joi.string().email().required()
});

export const updateSubscriptionSchema = Joi.object({
  plan: Joi.string().valid("FREE", "BASIC", "PRO", "STANDARD").optional(),
  stripecustomerId: Joi.string().required(),
  startedAt: Joi.date().optional(),
  expiresAt: Joi.date().optional(),
  email:Joi.string().required()
});

export const getSubscriptionStatusSchema = Joi.object({
  kindeId: Joi.string().required()
});
