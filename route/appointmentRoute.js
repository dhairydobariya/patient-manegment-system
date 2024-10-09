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
        getAppointmentsByDoctor,
        getAppointmentsByPatient,
    } = require('../controllers/appointmentController.js');

const {authenticateUser , authorizeRoles} = require('../middleware/authMiddleware')

router.get('/doctor',authenticateUser,authorizeRoles('Doctor'), getAppointmentsByDoctor);
router.get('/patient',authenticateUser,authorizeRoles('patient'), getAppointmentsByPatient);
router.get('/scheduled',authenticateUser,authorizeRoles('Doctor'), getScheduledAppointments);
router.get('/previous',authenticateUser,authorizeRoles('Doctor'), getPreviousAppointments);
router.get('/canceled',authenticateUser,authorizeRoles('Doctor'), getCanceledAppointments);
router.get('/pending',authenticateUser,authorizeRoles('Doctor'), getPendingAppointments);


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





module.exports = router;
