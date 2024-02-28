
const Joi = require('joi')

export const postWasteValidationSchema = Joi.object().keys({
  quantity: Joi.string().required(),
  location: Joi.string().required(),
  imageLink: Joi.string(),
  majority: Joi.string().required(),

});