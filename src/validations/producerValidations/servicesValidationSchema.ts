
const Joi = require('joi')

export const postWasteValidationSchema = Joi.object().keys({
  quantity: Joi.string().required(),
  location: Joi.string().required(),
  imageLink: Joi.string(),
  majority: Joi.string().required(),
});

export const withdrawalValidationSchema = Joi.object().keys({
  amount: Joi.number().required(),
  accountNumber: Joi.string().required(),
  name: Joi.string().required(),
  bank_code: Joi.string().required(),
});

export const deleteWasteValidationSchema = Joi.object().keys({
  waste_id: Joi.string().required(),
});

export const depositValidationSchema = Joi.object().keys({
  amount: Joi.number().required(),
  accountNumber: Joi.string().required(),
  name: Joi.string().required(),
  bank_code: Joi.string().required(),
});

export const addPickerValidationSchema = Joi.object().keys({
  name: Joi.number().required().min(3),
  phoneNumber: Joi.string().required().min(8).max(14),
  address: Joi.string().required(),
  serviceArea: Joi.string().required(),
});

export const deletePickerValidationSchema = Joi.object().keys({
  phoneNumber: Joi.string().required().min(8).max(14),
})