const express = require('express');
const patientController = require('../controllers/patientController');
const passwordController = require('../controllers/passwordController'); // Assuming you have a password controller for reset/forget functionalities
const {authenticateUser , authorizeRoles} = require('../middleware/authMiddleware')

const router = express.Router();

// Patient Registration
router.post('/register', patientController.register);



// Get Patient Profile
router.get('/profile', authenticateUser,authorizeRoles("patient") ,patientController.getPatientProfile);

// Update Patient Profile
router.patch('/profile', authenticateUser,authorizeRoles("patient"), patientController.updatePatientProfile);

module.exports = router;
