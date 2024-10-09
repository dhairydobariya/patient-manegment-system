// routes/chatRoutes.js
const express = require('express');
const { getChat } = require('../controllers/chatcontroller');
const router = express.Router();

// Get chat history between doctor and patient
router.get('/:doctorId/:patientId', getChat);

module.exports = router;
