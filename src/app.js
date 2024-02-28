"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const collectorRouter = require(`${__dirname}/routes/collector.routes`);
const producerRouter = require(`${__dirname}/routes/producer.routes`);
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
//Mount Routes
app.use('/api/collector', collectorRouter);
app.use('/api/producer', producerRouter);
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
}));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URI || "";
console.log(PORT);
console.log(DATABASE_URL);
mongoose_1.default.connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
