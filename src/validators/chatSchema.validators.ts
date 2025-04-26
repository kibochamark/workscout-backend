import Joi from "joi";



export const messageSchema = Joi.object({
  kindeId: Joi.string().uuid().required(),
});