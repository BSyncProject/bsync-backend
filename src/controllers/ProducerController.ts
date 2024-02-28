import { Request, Response } from 'express';
import { login, signUp } from '../services/ProducerServices';
import {signToken} from '../utils/tokenUtils'

import {
  signupProducerValidationSchema, 
  loginProducerValidationSchema
} from '../validations/producerValidations/AuthValidations';

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

module.exports = {
  signUpProducer,
  loginProducer,
};