
import express from 'express'
const router = express.Router();
const { signUpProducer, loginProducer, postPWaste} = require('../controllers/ProducerController');

const {producerAuth} = require('../middleware/producerAuth');


router.post('/signup', signUpProducer);
router.post('/login', loginProducer);


router.use(producerAuth);
router.post('/waste', postPWaste);

module.exports = router;