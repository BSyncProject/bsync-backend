import { Request, Response } from 'express';
import {login, signUpCollector} from '../services/CollectorServices'; 
import {signToken} from '../utils/tokenUtils'
import {
  signupValidationSchema, 
  loginValidationSchema
} from '../validations/collectorValidations/AuthValidations';

const catchAsync = require('../utils/catchAsync');

const signUp = catchAsync(async (req: Request, res: Response) => {
  try {
    const {
      username, 
      password, 
      email, 
      phoneNumber, 
      name, 
      serviceArea,
      address,
      wallet,

    } = await signupValidationSchema.validateAsync(req.body);

    const signUpData = {
      username, 
      password, 
      email, 
      phoneNumber, 
      name, 
      serviceArea,
      address, 
      wallet,
    }; 

    
    const newCollector = await signUpCollector(signUpData);

    return res.status(201).json(newCollector);
  } catch (error: any) {
    return res.status(500).json({ error: `Signup failed: ${error.message}` });
  }
});


const loginCollector = catchAsync(async (req: Request, res: Response) => {

  const {
    username,
    password,
  } = await loginValidationSchema.validateAsync(req.body);

  const collector = await login({ username, password });

  if (collector) {
    const token = signToken(collector.id);

    res.status(200).json({
      status: 'success',
      message: "You have successfully logged in",
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
  signUp,
  loginCollector,
}