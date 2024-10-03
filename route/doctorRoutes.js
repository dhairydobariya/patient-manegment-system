const express = require('express');
const doctorController = require('../controllers/doctorController');
const {authenticateUser , authorizeRoles} = require('../middleware/authMiddleware')

const router = express.Router();

router.get('/profile' ,authenticateUser,authorizeRoles('Doctor'), doctorController.profile)
router.patch('/profile', authenticateUser,authorizeRoles('Doctor'), doctorController.updateProfile);
router.patch('/profile/changepass', authenticateUser,authorizeRoles('Doctor'), doctorController.changeDoctorPassword);


module.exports = router;
