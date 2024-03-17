
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
  walletPin: Joi.string().required(),
});

export const deleteWasteValidationSchema = Joi.object().keys({
  waste_id: Joi.string().required(),
});

export const depositValidationSchema = Joi.object().keys({
  amount: Joi.number().required(),
});

export const verifyDepositValidationSchema = Joi.object().keys({
  reference: Joi.string().required(),
  amount: Joi.number().required(),
});


export const addPickerValidationSchema = Joi.object().keys({
  name: Joi.string().required().min(3),
  phoneNumber: Joi.string().required().min(8).max(14),
  address: Joi.string().required(),
  serviceArea: Joi.string().required(),
});

export const deletePickerValidationSchema = Joi.object().keys({
  phoneNumber: Joi.string().required().min(8).max(14),
})

export const updatePickerValidationSchema = Joi.object().keys({
  phoneNumber: Joi.string().required().min(8).max(14),
  name: Joi.string()
})

export const finalizeWithdrawalValidationSchema = Joi.object().keys({
  otp: Joi.string().required(),
  transfer_code: Joi.string().required()
})


export const wasteAvailabilityValidationSchema = Joi.object().keys({
  location: Joi.string().required(),
})

export const getPickerValidationSchema = Joi.object().keys({
  location: Joi.string().required(),
})

export const setPinValidationSchema = Joi.object().keys({
  walletPin: Joi.string().required().length(4),
});

export const makePaymentValidationSchema = Joi.object().keys({
  receiverUsername: Joi.string().required(),
  walletPin: Joi.string().required(),
  amount: Joi.number().required(),
})


export const searchValidationSchema = Joi.object().keys({
  username: Joi.string().required(),
})


export const forgotPasswordValidationSchema = Joi.object().keys({
  email: Joi.string().required(),
})


export const checkUsernameValidationSchema = Joi.object().keys({
  username: Joi.string().required(),
})

export const resetPasswordValidationSchema = Joi.object().keys({
  token: Joi.string().required(),
  email: Joi.string().required(),
  newPassword: Joi.string().required(),
})


export const updateWalletPinValidationSchema = Joi.object().keys({
  oldPin: Joi.string().required(),
  newPin: Joi.string().required(),
})

export const resetWalletPinValidationSchema = Joi.object().keys({
  token: Joi.string().required(),
  newPin: Joi.string().required(),
})

export const markWasteValidationSchema = Joi.object().keys({
  wasteId: Joi.string().required(),
})
