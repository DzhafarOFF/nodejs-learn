import Joi from "joi";
import { createValidator } from "express-joi-validation";
import { EPermission } from "./models/group";

const validator = createValidator();

// password from 8 to 16 characters with atleast one letter and digit

const PASSWORD_REG_EXP = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;

const requiredUserSchema = Joi.object({
  login: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().pattern(PASSWORD_REG_EXP).required(),
  age: Joi.number().integer().min(4).max(130).required(),
});

const requiredUserLoginSchema = Joi.object({
  login: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().pattern(PASSWORD_REG_EXP).required(),
});

const groupSchema = Joi.object({
  name: Joi.string().required(),
  permissions: Joi.array()
    .required()
    .items(Joi.string().valid(...Object.values(EPermission))),
});

export const validateUserBody = validator.body(requiredUserSchema);

export const validateGroupBody = validator.body(groupSchema);

export const validateUseLogin = validator.body(requiredUserLoginSchema);
