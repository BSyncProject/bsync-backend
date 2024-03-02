import { Request, Response } from 'express';
import {
  addPickerr, 
  becomeAgent, 
  deletePickerr, 
  getCollectorWallet, 
  login, 
  makeDeposit, 
  makeWithdrawal, 
  signUpCollector, 
  updatePickerr, 
  verifyCollectorDeposit,
  getWastes,
  setWalletPin,
  makePayment,
  getCollector,

} from '../services/CollectorServices'; 
import {signToken} from '../utils/tokenUtils'

import {
  signupValidationSchema, 
  loginValidationSchema
} from '../validations/collectorValidations/AuthValidations';

import { 
  withdrawalValidationSchema,
  depositValidationSchema,
  addPickerValidationSchema,
  deletePickerValidationSchema,
  updatePickerValidationSchema,
  finalizeWithdrawalValidationSchema,
  verifyDepositValidationSchema,
  wasteAvailabilityValidationSchema,
  setPinValidationSchema,
  makePaymentValidationSchema,
  searchValidationSchema,

} from '../validations/producerValidations/servicesValidationSchema';
import { Collector } from '../models/Collector';
import { Picker } from '../models/Picker';

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

interface CustomRequest extends Request {
  collector?: Collector,
}


const collectorWithdrawal = catchAsync(async (req: CustomRequest, res: Response) => {

  try{

    const collector: Collector = checkCollectorIsProvided(req);

    const {
      amount,
      accountNumber,
      bank_code,
      name,
      walletPin,
    } = await withdrawalValidationSchema.validateAsync(req.body);

    const response = await makeWithdrawal(name, accountNumber, bank_code, amount, collector, walletPin);

    if (!response) {
      throw new Error(" An error occurred")
    }

    res.status(200).json({
      status: 'success',
      message: "withdrawal process start, check your phone for otp",
      data: response,
    });

  } catch(error:any){
    res.status(error.status).json({
      status: 'failed',
      message: 'An error occurred: ' + `${error}`,
    })
  }
})


const collectorDeposit = catchAsync(async (req: CustomRequest, res: Response) => {

  try{

    const collector: Collector = checkCollectorIsProvided(req);

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



const verifyCollDeposit = catchAsync(async (req: CustomRequest, res: Response) => {

  try{

    const collector: Collector = checkCollectorIsProvided(req);

    const {
      reference,
      walletPin
    } = await verifyDepositValidationSchema.validateAsync(req.body);

    const response = await verifyCollectorDeposit(reference, collector, walletPin)

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

const setPin = catchAsync(async (req: CustomRequest, res: Response) => {

  try{

    const collector: Collector = checkCollectorIsProvided(req);

    const {
      walletPin,
    } = await setPinValidationSchema.validateAsync(req.body);

    const response = await setWalletPin(walletPin, collector);

    if (!response) {
      throw new Error("An Error occurred");
    }

    res.status(200).json({
      status: 'success',
      message: "Pin set successfully",
      data: response,
    });

  } catch(error:any){
    res.status(error.status).json({
      status: 'failed',
      message: 'An error occurred: ' + `${error}`,
    })
  }
})

function checkCollectorIsProvided(req: CustomRequest): Collector{
  if(!req.collector){
    throw new Error("No authorized user provided");
  }

  return req.collector
}



const becomeAgentPermission = catchAsync(async (req: CustomRequest, res: Response) => {

  try{

    const collector: Collector = checkCollectorIsProvided(req);

    const response = await becomeAgent(collector);

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
 

const addPicker = catchAsync(async (req: CustomRequest, res: Response) => {

  try{

    const collector: Collector = checkCollectorIsProvided(req);
    const {
      name,
      address,
      phoneNumber,
      serviceArea,
    } = await addPickerValidationSchema.validateAsync(req.body)

    const pickerData: Partial<Picker> = {
      name: name,
      address: address,
      phoneNumber: phoneNumber,
      serviceArea: serviceArea,
    }
    const picker = await addPickerr(pickerData, collector);

    if (!picker) {
      throw new Error(" An error occurred");
    }

    res.status(200).json({
      status: 'success',
      message: "Picker Added Successfully",
      data: picker,
    });

  } catch(error:any){
    res.status(error.status).json({
      status: 'failed',
      message: 'An error occurred: ' + `${error}`,
    })
  }
})

const deletePicker = catchAsync(async (req: CustomRequest, res: Response) => {

  try{

    const collector: Collector = checkCollectorIsProvided(req);
    const {
      phoneNumber,
    } = await deletePickerValidationSchema.validateAsync(req.body)

    const response = await deletePickerr(phoneNumber, collector)

    if (!response) {
      throw new Error(" An error occurred, try again");
    }

    res.status(200).json({
      status: 'success',
      message: "Picker deleted Successfully",
    });

  } catch(error:any){
    res.status(error.status).json({
      status: 'failed',
      message: 'An error occurred: ' + `${error}`,
    })
  }
})

const updatePicker = catchAsync(async(req: CustomRequest, res: Response) => {
  try{

    const collector: Collector = checkCollectorIsProvided(req);
    const {
      phoneNumber,
      name,
      address,
      serviceArea

    } = await updatePickerValidationSchema.validateAsync(req.body);

    const pickerData: Partial<Picker> = {
      name: name,
      address: address,
      phoneNumber: phoneNumber,
      serviceArea: serviceArea,
    }

    const picker = await updatePickerr(phoneNumber, pickerData, collector);

    if (!picker) {
      throw new Error(" An error occurred, try again");
    }

    res.status(200).json({
      status: 'success',
      message: "Picker Updated Successfully",
      data: picker,
    });

  } catch(error:any){
    res.status(error.status).json({
      status: 'failed',
      message: 'An error occurred: ' + `${error}`,
    })
  }
})

const getWallet = catchAsync(async (req: CustomRequest, res: Response) => {

  try{

    const collector: Collector = checkCollectorIsProvided(req);

    const wallet = await getCollectorWallet(collector);

    res.status(200).json({
      status: 'success',
      message: "wallet found",
      data: wallet,
    });

  } catch(error:any){
    res.status(500).json({
      status: 'failed',
      message: 'An error occurred: ' + `${error}`,
    })
  }
})


const getAvailableWaste = catchAsync(async (req: CustomRequest, res: Response) => {

  try{
    
    const collector: Collector = checkCollectorIsProvided(req);
    
    const { location } = await wasteAvailabilityValidationSchema.validateAsync(req.params.location);

    const listOfAvailableWastes = await getWastes(location);

    res.status(200).json({
      status: 'success',
      message: "all waste found",
      data: listOfAvailableWastes,
    });

  } catch(error:any){
    res.status(500).json({
      status: 'failed',
      message: 'An error occurred: ' + `${error}`,
    })
  }
})

const makePaymentC = catchAsync(async (req: CustomRequest, res: Response) => {

  try{

    const collector: Collector = checkCollectorIsProvided(req);

    const {
      receiverUsername,
      amount,
      walletPin,
    } = await makePaymentValidationSchema.validateAsync(req.body);

    const response = await makePayment(collector, receiverUsername, amount,walletPin);

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

const findCollector = catchAsync(async (req: CustomRequest, res: Response) => {

  try{

    const collector: Collector = checkCollectorIsProvided(req);

    const {
      username,
    } = await searchValidationSchema.validateAsync(req.body);

    const foundCollector = await getCollector(username);


    if (!foundCollector) {
      throw new Error(" An error occurred")
    }

    res.status(200).json({
      status: 'success',
      message: "Producer found",
      data: foundCollector,
    });

  } catch(error:any){
    res.status(error.status).json({
      status: 'failed',
      message: 'An error occurred: ' + `${error}`,
    })
  }
})



module.exports = {
  signUp,
  loginCollector,
  collectorDeposit,
  collectorWithdrawal,
  verifyCollDeposit,
  becomeAgentPermission,
  addPicker,
  deletePicker,
  updatePicker,
  getWallet,
  getAvailableWaste,
  setPin,
  makePaymentC,
  findCollector,
}
