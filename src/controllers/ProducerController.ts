import { Request, Response } from 'express';
import { 
  login, 
  signUp,
  postWaste,
  deleteWaste,
  makeWithdrawal,
  makeDeposit,
  verifyProducerDeposit,
  getProducerWallet,
  makePayment,
  setWalletPin,
  getProducer,
  getAllP,
  getMyWastes,  
  updateProducerWalletPin,
  resetWalletPinProducer,
  forgotWalletPinProducer,

 } from '../services/ProducerServices';
import {signToken} from '../utils/tokenUtils'

import {
  signupProducerValidationSchema, 
  loginProducerValidationSchema, 
} from '../validations/producerValidations/AuthValidations';

import { 
  postWasteValidationSchema,
  withdrawalValidationSchema,
  deleteWasteValidationSchema,
  depositValidationSchema,
  verifyDepositValidationSchema,
  setPinValidationSchema,
  makePaymentValidationSchema,
  searchValidationSchema,
  getPickerValidationSchema,
  checkUsernameValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
  updatePickerValidationSchema,
  resetWalletPinValidationSchema,

} from '../validations/producerValidations/servicesValidationSchema';
import { Producer } from '../models/Producer';
import UserService from '../services/UserServices';

const catchAsync = require('../utils/catchAsync');
const userService = new UserService();


const signUpProducer = catchAsync(async (req: Request, res: Response) => {
  try {
    const {
      username, 
      password, 
      email, 
      phoneNumber, 
      name, 
      address, 
      wallet
    } = await signupProducerValidationSchema.validateAsync(req.body);

    const signUpData = {
      username, 
      password, 
      email, 
      phoneNumber, 
      name, 
      address, 
      wallet
    };

    const newProducer = await signUp(signUpData);

    const token = signToken(newProducer.id);
    return res.status(201).json({
      data: newProducer,
      token: token
    });

  } catch (error: any) {
    return res.status(500).json({ error: `Signup failed: ${error.message}` });
  }
});


const loginProducer = catchAsync(async (req: Request, res: Response) => {

  const {
    username,
    password,
  } = await loginProducerValidationSchema.validateAsync(req.body);

  const producer = await login({ username, password });

  if (producer) {
    const token = signToken(producer.id);

    res.status(200).json({
      status: 'success',
      message: "You have successfully signed in",
      token,
    });

  } else {
    res.status(404).json({
      status: 'failed',
      message: 'Wrong credentials'
    });
  }
});

interface CustomRequest extends Request {
  producer?: any;
}

const postPWaste = catchAsync(async(req: CustomRequest, res: Response) => {

  try {

    if(!req.producer){
      throw new Error("User not Authorized");
    }
  
    const { 
      quantity,
      location,
      majority,
      imageLink,
      
    } = await postWasteValidationSchema.validateAsync(req.body);
  
    const waste = await postWaste({quantity, majority, location, imageLink}, req.producer);
  
    if (waste) {
  
      res.status(200).json({
        status: 'success',
        message: "waste post successfully",
        data: waste,
        
      });

    } 
    
  } catch(error: any) {

    res.status(500).json({
      status: 'failed',
      message: 'An error occurred: ' + `${error.message}`
    });

  }
  
})

const deleteWastes = catchAsync(async(req: CustomRequest, res: Response) => {

  try{
    const producer: Producer = checkProducerIsProvided(req);

    const {
      waste_id,
    } = await deleteWasteValidationSchema.validateAsync(req.body);

    const waste = await deleteWaste(waste_id, producer);
  
    if (waste) {
      res.status(200).json({
        status: 'success',
        message: waste,        
      });
    }

  } catch (error: any){
    res.status(400).json({
      status: 'failed',
      message: 'An error occurred: ' + `${error}`,
    })
  }

})


const withdrawMoney = catchAsync(async (req: CustomRequest, res: Response) => {

  try{

    checkProducerIsProvided(req);

    const {
      amount,
      accountNumber,
      bank_code,
      name,
      walletPin,
    } = await withdrawalValidationSchema.validateAsync(req.body);

    const response = await makeWithdrawal(name, accountNumber, bank_code, amount, req.producer, walletPin);

    if (!response) {
      throw new Error(" An error occurred")
    }

    res.status(200).json({
      status: 'success',
      message: "withdrawal Successful",
      data: response,
    });

  } catch(error:any){
    res.status(500).json({
      status: 'failed',
      message: 'An error occurred: ' + `${error}`,
    })
  }
})


const depositMoney = catchAsync(async (req: CustomRequest, res: Response) => {

  try{

    const producer: Producer = checkProducerIsProvided(req);

    const {
      amount,
    } = await depositValidationSchema.validateAsync(req.body);

    const response = await makeDeposit(amount, producer.email);

    if (!response) {
      throw new Error(" An error occurred");
    }

    res.status(200).json({
      status: 'success',
      message: response,
    });

  } catch(error:any){
    res.status(500).json({
      status: 'failed',
      message: 'An error occurred: ' + `${error}`,
    })
  }
})



const verifyDeposit = catchAsync(async (req: CustomRequest, res: Response) => {

  try{

    const producer: Producer = checkProducerIsProvided(req);

    const {
      reference,
      walletPin
    } = await verifyDepositValidationSchema.validateAsync(req.body);

    const response = await verifyProducerDeposit(reference, producer, walletPin)

    if (!response) {
      throw new Error(" An error occurred");
    }

    res.status(200).json({
      status: 'success',
      message: response,
    });

  } catch(error:any){
    res.status(500).json({
      status: 'failed',
      message: 'An error occurred: ' + `${error}`,
    })
  }
})

function checkProducerIsProvided(req: CustomRequest): Producer {
  if (!req.producer) {
    throw new Error("User not Authorized");
  }
  return req.producer;
}

const getWallet = catchAsync(async (req: CustomRequest, res: Response) => {

  try{

    const producer: Producer = checkProducerIsProvided(req);
    const wallet = await getProducerWallet(producer);

    res.status(200).json({
      status: 'success',
      message: "Wallet found",
      data: wallet,
    });

  } catch(error:any){
    res.status(500).json({
      status: 'failed',
      message: 'An error occurred: ' + `${error}`,
    })
  }
})


const setPin = catchAsync(async (req: CustomRequest, res: Response) => {

  try{

    const producer: Producer = checkProducerIsProvided(req);

    const {
      walletPin
    } = await setPinValidationSchema.validateAsync(req.body);

    const wallet = await setWalletPin(walletPin, producer);

    res.status(200).json({
      status: 'success',
      message: "Wallet pin set successfully",
      data: wallet,
    });

  } catch(error:any){
    res.status(500).json({
      status: 'failed',
      message: 'An error occurred: ' + `${error}`,
    })
  }
})

const makePaymentP = catchAsync(async (req: CustomRequest, res: Response) => {

  try{

    const producer: Producer = checkProducerIsProvided(req);

    const {
      receiverUsername,
      amount,
      walletPin,
    } = await makePaymentValidationSchema.validateAsync(req.body);

    const response = await makePayment(producer, receiverUsername, amount,walletPin);

    if (!response) {
      throw new Error(" An error occurred")
    }

    res.status(200).json({
      status: 'success',
      message: "Transfer Successful",
      data: response,
    });

  } catch(error:any){
    res.status(error.status).json({
      status: 'failed',
      message: 'An error occurred: ' + `${error}`,
    })
  }
})

const findProducer = catchAsync(async (req: CustomRequest, res: Response) => {

  try{

    const producer: Producer = checkProducerIsProvided(req);

    const {
      username,
    } = await searchValidationSchema.validateAsync(req.params.username);

    const foundProducer = await getProducer(username);


    if (!foundProducer) {
      throw new Error(" An error occurred")
    }

    res.status(200).json({
      status: 'success',
      message: "Producer found",
      data: foundProducer,
    });

  } catch(error:any){
    res.status(error.status).json({
      status: 'failed',
      message: 'An error occurred: ' + `${error}`,
    })
  }
})

const getPickers = catchAsync(async (req: CustomRequest, res: Response) => {

  try{

    const producer: Producer = checkProducerIsProvided(req);

    const {
      location,
    } = await getPickerValidationSchema.validateAsync(req.params.location);

    const foundPickers = await getAllP(location);


    if (!foundPickers) {
      throw new Error(" An error occurred")
    }

    res.status(200).json({
      status: 'success',
      message: "Pickers found",
      data: foundPickers,
    });

  } catch(error:any){
    res.status(error.status).json({
      status: 'failed',
      message: 'An error occurred: ' + `${error}`,
    })
  }
})

const getWastes = catchAsync(async (req: CustomRequest, res: Response) => {

  try{

    const producer: Producer = checkProducerIsProvided(req);

    const foundPickers = await getMyWastes(producer);


    if (!foundPickers) {
      throw new Error(" An error occurred")
    }

    res.status(200).json({
      status: 'success',
      message: "Pickers found",
      data: foundPickers,
    });

  } catch(error:any){
    res.status(error.status).json({
      status: 'failed',
      message: 'An error occurred: ' + `${error}`,
    })
  }
})

const checkUsername = catchAsync(async(req: Request, res: Response) => {
  
  const response = await userService.checkUsername('producer');

  if (!response) {
    throw new Error(" An error occurred")
  }

  res.status(200).json({
    status: 'success',
    message: response,
  });

})

const forgotPassword = catchAsync(async(req: Request, res: Response) => {

  try{

    const {
      email,
    } = await forgotPasswordValidationSchema.validateAsync(req.body);
    const response = await userService.forgotPassword(email, "producer");


    if (!response) {
      throw new Error(" An error occurred")
    }

    res.status(200).json({
      status: 'success',
      message: "Check your email for password reset otp",
    });

  } catch(error:any){
    res.status(500).json({
      status: 'failed',
      message: `${error}`,
    })
  }
})

const resetPassword = catchAsync(async(req: Request, res: Response) => {

  const {
    token, email, newPassword,
  } = await resetPasswordValidationSchema.validateAsync(req.body);
  const response = await userService.resetPassword(email, token, newPassword, 'producer', );

  if (!response) {
    throw new Error(" An error occurred")
  }

  res.status(200).json({
    status: 'success',
    message: "Password reset successful",
  });
  
})


const updateWalletPin = catchAsync(async(req: CustomRequest, res: Response) => {
  
  try{
    const producer: Producer = checkProducerIsProvided(req);

    const {
      oldPin, newPin,
    } = await updatePickerValidationSchema.validateAsync(req.body);
  
    const response = await updateProducerWalletPin(producer, oldPin, newPin);
  
    if(!response) {throw new Error("An error occurred");}
  
    res.status(200).json({
      status: "success",
      message: response,
    })
  } catch(error: any){
    res.status(500).json({
      status: "failed",
      message: `${error.message}`,
    })
  }
  
})


const forgotWalletPin = catchAsync(async(req: CustomRequest, res: Response) => {
  try {

    const producer: Producer = checkProducerIsProvided(req);

    const response = await forgotWalletPinProducer(producer);
    if(!response) {throw new Error("An error occurred");}
    
    res.status(200).json({
      status: "success",
      message: "Check your email for a wallet reset token",
    })

  } catch(error: any){
    res.status(500).json({
      status: 'failed',
      message: `${error.message}`,
    })
  }
})

const resetWalletPin = catchAsync(async(req: CustomRequest, res: Response) => {
  try {

    const producer: Producer = checkProducerIsProvided(req);

    const {
      token, 
      newPin,
    } = await resetWalletPinValidationSchema.validateAsync(req.body)
    const response = await resetWalletPinProducer(producer, token, newPin);

    if(!response) {throw new Error("An error occurred");}
    
    res.status(200).json({
      status: "success",
      message: response,
    })

  } catch(error: any){
    res.status(500).json({
      status: 'failed',
      message: `${error.message}`,
    })
  }
})


module.exports = {
  signUpProducer,
  loginProducer,
  postPWaste,
  deleteWastes,
  withdrawMoney,
  depositMoney,
  verifyDeposit,
  getWallet,
  setPin,
  makePaymentP,
  findProducer,  
  getPickers,
  getWastes,
  forgotPassword,
  checkUsername,
  resetPassword,
  updateWalletPin,
  resetWalletPin,
  forgotWalletPin,

};


