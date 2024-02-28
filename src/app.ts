import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose, {ConnectOptions} from 'mongoose';
import cors from 'cors';
import {DATABASE_URL} from './config/db.config';

const collectorRouter = require(`${__dirname}/routes/collector.routes`);
const producerRouter = require(`${__dirname}/routes/producer.routes`)

dotenv.config();

const app = express();



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Mount Routes
app.use('/api/collector', collectorRouter);
app.use('/api/producer', producerRouter);

app.use(cors({
  origin: '*', 
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
  credentials: true,            
}));

app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 3000;


mongoose.connect(DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as ConnectOptions)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

