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

  email: Joi.string().email().required()
});

export const updateSubscriptionSchema = Joi.object({
  plan: Joi.string().valid("FREE", "BASIC", "PRO", "STANDARD").required(),
  stripecustomerId: Joi.string().required(),
  email:Joi.string().required(),
  active:Joi.boolean().optional()
});

export const getSubscriptionStatusSchema = Joi.object({
  kindeId: Joi.string().required()
});
