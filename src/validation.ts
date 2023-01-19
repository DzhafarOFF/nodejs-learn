import Joi from "joi";
import { createValidator } from "express-joi-validation";

const validator = createValidator();

// password from 8 to 16 characters with atleast one letter and digit

const PASSWORD_REG_EXP = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;

const requiredSchema = Joi.object({
  login: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().pattern(PASSWORD_REG_EXP).required(),
  age: Joi.number().integer().min(4).max(130).required(),
});

export const validateBody = validator.body(requiredSchema);
