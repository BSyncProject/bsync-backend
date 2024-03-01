import { Request, Response } from 'express';
import { 
  login, 
  signUp,
  postWaste,
  deleteWaste,
  makeWithdrawal,
  makeDeposit,
  verifyProducerDeposit,

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

} from '../validations/producerValidations/servicesValidationSchema';
import { Producer } from '../models/Producer';

const catchAsync = require('../utils/catchAsync');


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

    return res.status(201).json(newProducer);

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

    res.status(error.status).json({
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
    res.status(error.status).json({
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
    } = await withdrawalValidationSchema.validateAsync(req.body);

    const response = await makeWithdrawal(name, accountNumber, bank_code, amount, req.producer);

    if (!response) {
      throw new Error(" An error occurred")
    }

    res.status(200).json({
      status: 'success',
      message: "withdrawal in queue",
      data: response,
    });

  } catch(error:any){
    res.status(error.status).json({
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
      email,
    } = await depositValidationSchema.validateAsync(req.body);

    const response = await makeDeposit(amount, email);

    if (!response) {
      throw new Error(" An error occurred");
    }

    res.status(200).json({
      status: 'success',
      message: response,
    });

  } catch(error:any){
    res.status(error.status).json({
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
    } = await depositValidationSchema.validateAsync(req.body);

    const response = await verifyProducerDeposit(reference, producer)

    if (!response) {
      throw new Error(" An error occurred");
    }

    res.status(200).json({
      status: 'success',
      message: response,
    });

  } catch(error:any){
    res.status(error.status).json({
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

module.exports = {
  signUpProducer,
  loginProducer,
  postPWaste,
  deleteWastes,
  withdrawMoney, //See adeola at palace, ask samuel sola.
  depositMoney,
  verifyDeposit,
  
};


