import { any } from "joi";
import { Producer } from "../models/Producer";
import ProducerRepository from "../repository/ ProducerRepository";
import { Request, Response, NextFunction } from "express";

const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');

const producerRepository = new ProducerRepository();

interface CustomRequest extends Request {
  producer?: any;
}


const producerAuth = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  
  const authHeader: string | string[] | undefined = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer')) {
    return res.status(401).json({
      status: 'failed',
      message: 'You are not Authorized!'
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      status: 'failed',
      message: 'You are not Authorized!'
    });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

    const { id } = decoded;

     const producer: Producer| null = await producerRepository.getById(id);

    if (!producer) {

      return res.status(404).json({
        status: 'failed',
        message: 'Producer Account does not exist!',
      });
    }

    req.producer = producer;
    next();

  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        status: 'expired',
        message: 'Session ended',
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
});

export default producerAuth;


module.exports = {
  producerAuth,
};