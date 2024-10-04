const express = require('express');
const router = express.Router();
const { createAppointment, getAppointment, updateAppointment, cancelAppointment, deleteAppointment } = require('../controllers/appointmentController.js');

// Create a new appointment
router.post('/', createAppointment);

// Get appointment details
router.get('/:id', getAppointment);

// Update appointment (patient/doctor can change time)
router.patch('/:id', updateAppointment);

// Cancel an appointment
router.patch('/:id/cancel', cancelAppointment);

// Delete appointment (admin only)
router.delete('/:id', deleteAppointment);

module.exports = router;
