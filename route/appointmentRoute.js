const express = require('express');
const router = express.Router();
const { createAppointment,
        getAppointment,
        updateAppointment,
        cancelAppointment,
        deleteAppointment,
        addUnavailableTime ,
        removeUnavailableTime,
        getScheduledAppointments,
        getPreviousAppointments,
        getCanceledAppointments,
        getPendingAppointments,
    } = require('../controllers/appointmentController.js');

const {authenticateUser , authorizeRoles} = require('../middleware/authMiddleware')

// Create a new appointment
router.post('/' ,authenticateUser,authorizeRoles('Doctor' , 'patient'), createAppointment);

// Get appointment details
router.get('/:id',authenticateUser,authorizeRoles('Doctor' , 'patient'), getAppointment);

// Update appointment (patient/doctor can change time)
router.patch('/:id' ,authenticateUser,authorizeRoles('Doctor' , 'patient') , updateAppointment);

// Cancel an appointment
router.patch('/:id/cancel' ,authenticateUser,authorizeRoles('patient'), cancelAppointment);

// Delete appointment (admin only)
router.delete('/:id' ,authenticateUser,authorizeRoles('Doctor' , 'patient'), deleteAppointment);



router.post('/doctors/unavailable-times',authenticateUser,authorizeRoles('Doctor'), addUnavailableTime);


// Route for removing unavailable time
router.delete('/doctors/unavailable-times',authenticateUser,authorizeRoles('Doctor'), removeUnavailableTime);


router.get('/appointments/scheduled', getScheduledAppointments);
router.get('/appointments/previous', getPreviousAppointments);
router.get('/appointments/canceled', getCanceledAppointments);
router.get('/appointments/pending', getPendingAppointments);



module.exports = router;
