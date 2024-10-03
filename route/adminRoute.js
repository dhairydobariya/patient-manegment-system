    const express = require('express');
    const adminController = require('../controllers/adminController');
    const doctorController = require('../controllers/doctorController');
    const {authenticateUser , authorizeRoles} = require('../middleware/authMiddleware')
    const router = express.Router();

    // Admin Registration
    router.post('/register', adminController.register);


    
    //add hospital 
    // Create a new hospital
    router.post('/hospitals',authenticateUser,authorizeRoles('admin'), adminController.createHospital);

    // Get all hospitals
    router.get('/hospitals',authenticateUser,authorizeRoles('admin'), adminController.getAllHospitals);
    
    // Get a single hospital by ID
    router.get('/hospitals/:id',authenticateUser,authorizeRoles('admin'), adminController.getHospitalById);

    // Update a hospital by ID
    router.put('/hospitals/:id',authenticateUser,authorizeRoles('admin'), adminController.updateHospitalById);

    // Delete a hospital by ID
    router.delete('/hospitals/:id',authenticateUser,authorizeRoles('admin'), adminController.deleteHospitalById);



    // create doctor
    router.post('/create-doctor',authenticateUser,authorizeRoles('admin'), adminController.createDoctor); // New route for creating a doctor
    router.delete('/doctor/:id', adminController.deleteDoctorById);




    //profile
    router.get('/profile' ,authenticateUser,authorizeRoles('admin'), adminController.getprofile )
    router.patch('/profile' ,authenticateUser,authorizeRoles('admin'), adminController.updateprofile )
    router.post('/profile/changepass' , authenticateUser,authorizeRoles('admin'), adminController.changeAdminPassword)

    module.exports = router;
