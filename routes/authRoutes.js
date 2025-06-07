// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { loginUser, findUserByPhone } = require('../controllers/authController');
const { addContact } = require('../controllers/authController');

router.post('/login', loginUser);
router.get('/find/:phone', findUserByPhone);
router.post('/add-contact', addContact);


module.exports = router;
