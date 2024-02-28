
import express from 'express'
const router = express.Router();
const { signUpProducer, loginProducer} = require('../controllers/ProducerController');


router.post('/signup', signUpProducer);
router.post('/login', loginProducer);

module.exports = router;