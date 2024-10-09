const { body, validationResult } = require('express-validator');
const usermodel = require('../models/adminModel');
const Doctor = require('../models/doctorModel');
const Hospital = require('../models/hospitalModel');
const Patient = require('../models/patientModel');
const Appointment = require('../models/appointmentmodel');
const Admin = require('../models/adminModel');
const Bill = require('../models/billmodel');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
// Default route
const defaults = (req, res) => {
    res.send("It's default routes");
};

// User Registration with validation
const register = async (req, res) => {
    // Validation checks
    await body('firstName').notEmpty().withMessage('First name is required').run(req);
    await body('lastName').notEmpty().withMessage('Last name is required').run(req);
    await body('email').isEmail().withMessage('Invalid email format').run(req);
    await body('phoneNumber').notEmpty().withMessage('Phone number is required').run(req);
    await body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').run(req);
    await body('country').notEmpty().withMessage('Country is required').run(req);
    await body('state').notEmpty().withMessage('State is required').run(req);
    await body('city').notEmpty().withMessage('City is required').run(req);
    await body('hospital').notEmpty().withMessage('Hospital is required').run(req);
    await body('role').notEmpty().withMessage('Role is required').run(req);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, phoneNumber, password, country, state, city, hospital, role, profileImage } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await usermodel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const userdata = new usermodel({
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword,
            country,
            state,
            city,
            hospital,
            role,
            profileImage
        });

        // Save the user to the database
        await userdata.save();
        res.status(201).json({ message: "User successfully registered", user: userdata });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
const createDoctor = async (req, res) => {
    // Validation checks
    await body('name').notEmpty().withMessage('Name is required').run(req);
    await body('email').isEmail().withMessage('Invalid email format').run(req);
    await body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').run(req);
    await body('specialtyType').notEmpty().withMessage('Specialty Type is required').run(req);
    await body('phoneNumber').notEmpty().withMessage('Phone number is required').run(req);
    await body('age').isInt({ min: 18 }).withMessage('Age must be at least 18').run(req);
    await body('onlineConsultationRate').isNumeric().withMessage('Consultation rate must be a number').run(req);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        name, qualification, specialtyType, gender, experience, checkupTime, workon, workingTime,
        breakTime, phoneNumber, email, password, age, address, onlineConsultationRate, 
        hospitalWebsite, emergencyContactNumber, doctorAddress, description, signature
    } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Get the logged-in admin's ID (assuming req.user is populated via authentication middleware)
        const adminId = req.user.id;

        // Find the admin by ID to get their associated hospital ID
        const admin = await usermodel.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Ensure the admin is associated with a hospital
        const hospitalId = admin.hospital; // Retrieve the hospital ID from the admin's data
        if (!hospitalId) {
            return res.status(400).json({ message: 'Admin is not associated with a hospital' });
        }

        // Find the hospital by ID to ensure it exists
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        // Create a new doctor and automatically assign the admin's hospital ID
        const newDoctor = new Doctor({
            name,
            qualification,
            specialtyType,
            gender,
            experience,
            checkupTime,
            workon,
            workingTime,
            breakTime,
            phoneNumber,
            email,
            password: hashedPassword,
            age,
            address,
            onlineConsultationRate,
            currentHospital: hospital._id, // Automatically attach the hospital ID from the admin
            hospitalWebsite,
            emergencyContactNumber,
            doctorAddress,
            description,
            signature,
        });

        // Save doctor to the database
        await newDoctor.save();
        res.status(201).json({ message: "Doctor successfully created", doctor: newDoctor });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



const deleteDoctorById = async (req, res) => {
    try {
        // Find the doctor by ID and delete
        const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);
        
        // If no doctor is found, return a 404
        if (!deletedDoctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Successfully deleted
        res.status(200).json({ message: 'Doctor deleted successfully' });
    } catch (error) {
        // Server error handling
        res.status(500).json({ message: 'Error deleting doctor', error: error.message });
    }
};

// Create a new hospital with validation
const createHospital = async (req, res) => {
    await body('name').notEmpty().withMessage('Hospital name is required').run(req);
    await body('address.country').notEmpty().withMessage('Country is required').run(req);
    await body('address.state').notEmpty().withMessage('State is required').run(req);
    await body('address.city').notEmpty().withMessage('City is required').run(req);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const hospital = new Hospital(req.body);
        const savedHospital = await hospital.save();
        res.status(201).json({ message: 'Hospital created successfully', hospital: savedHospital });
    } catch (error) {
        res.status(500).json({ message: 'Error creating hospital', error: error.message });
    }
};

// Get all hospitals with error handling
const getAllHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find();
        res.status(200).json(hospitals);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hospitals', error: error.message });
    }
};

// Get hospital by ID with error handling
const getHospitalById = async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        res.status(200).json(hospital);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hospital', error: error.message });
    }
};

// Update hospital by ID with error handling
const updateHospitalById = async (req, res) => {
    try {
        const updatedHospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedHospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        res.status(200).json(updatedHospital);
    } catch (error) {
        res.status(500).json({ message: 'Error updating hospital', error: error.message });
    }
};

// Delete hospital by ID with error handling
const deleteHospitalById = async (req, res) => {
    try {
        const deletedHospital = await Hospital.findByIdAndDelete(req.params.id);
        if (!deletedHospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        res.status(200).json({ message: 'Hospital deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting hospital', error: error.message });
    }
};


let getprofile = async (req, res) => {
    const adminId = req.user.id; // Get the admin ID from the authenticated user's token

    try {
        const adminProfile = await usermodel.findById(adminId).select('-password'); // Fetch the admin profile and exclude the password field

        if (!adminProfile) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json({ adminProfile });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin Profile Update
let updateprofile = async (req, res) => {
    const adminId = req.user.id; // Get the admin ID from the authenticated user's token
    const { firstName, lastName, email, phoneNumber, country, state, city, hospital } = req.body; // Destructure the necessary fields from the request body

    try {
        const updatedAdmin = await usermodel.findByIdAndUpdate(
            adminId,
            { firstName, lastName, email, phoneNumber, country, state, city, hospital }, // Update fields
            { new: true, runValidators: true } // Returns the updated document and runs validators
        );

        if (!updatedAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully', updatedAdmin });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const changeAdminPassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    try {
        const admin = await usermodel.findById(userId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Compare current password
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Check if new password and confirm password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New password and confirm password do not match' });
        }

        // Hash and update new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        admin.password = hashedNewPassword;

        await admin.save();
        res.status(200).json({ message: 'Admin password changed successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin Dashboard API with Search Functionality
const getAdminDashboardData = async (req, res) => {
    try {
      const adminId = req.user.id;  // Extracted from JWT or session
      const admin = await Admin.findById(adminId).populate('hospital');
      const hospitalId = admin.hospital._id;
        
      const { searchQuery, filterBy } = req.query; // Get search query and filter from frontend
    
      let searchResults = [];
  
      if (filterBy === 'all') {
        // 1. Search in both Doctors and Patients
        const doctors = await Doctor.find({
          hospital: hospitalId,
          name: { $regex: searchQuery, $options: 'i' }, // Case-insensitive match
        });
  
        const patients = await Patient.find({
          hospital: hospitalId,
          name: { $regex: searchQuery, $options: 'i' }, // Case-insensitive match
        });
  
        if (doctors.length > 0) {
          // If matched with a doctor, return all patients associated with this doctor
          const doctorIds = doctors.map(doctor => doctor._id);
          const patientAppointments = await Appointment.find({
            doctor: { $in: doctorIds },
            hospital: hospitalId
          }).populate('patient doctor');
  
          searchResults = patientAppointments.map(appointment => ({
            patientName: appointment.patient.name,
            patientIssue: appointment.patient.issue,
            doctorName: appointment.doctor.name,
            diseaseName: appointment.patient.diseaseName,
            appointmentTime: appointment.appointmentDate,
            appointmentType: appointment.appointmentType
          }));
        }
  
        if (patients.length > 0) {
          // If matched with a patient, return patient data
          const patientAppointments = await Appointment.find({
            patient: { $in: patients.map(patient => patient._id) },
            hospital: hospitalId
          }).populate('patient doctor');
  
          searchResults.push(...patientAppointments.map(appointment => ({
            patientName: appointment.patient.name,
            patientIssue: appointment.patient.issue,
            doctorName: appointment.doctor.name,
            diseaseName: appointment.patient.diseaseName,
            appointmentTime: appointment.appointmentDate,
            appointmentType: appointment.appointmentType
          })));
        }
  
      } else if (filterBy === 'doctor') {
        // 2. Search in Doctors only
        const doctors = await Doctor.find({
          hospital: hospitalId,
          name: { $regex: searchQuery, $options: 'i' }, // Case-insensitive match
        });
  
        searchResults = doctors.map(doctor => ({
          doctorName: doctor.name,
          gender: doctor.gender,
          qualification: doctor.qualification,
          specialty: doctor.specialty,
          workingTime: doctor.workingTime,
          patientCheckupTime: doctor.checkupTime,
          breakTime: doctor.breakTime,
        }));
  
      } else if (filterBy === 'patient') {
        // 3. Search in Patients only
        const patients = await Patient.find({
          hospital: hospitalId,
          name: { $regex: searchQuery, $options: 'i' }, // Case-insensitive match
        });
  
        const patientAppointments = await Appointment.find({
          patient: { $in: patients.map(patient => patient._id) },
          hospital: hospitalId
        }).populate('patient doctor');
  
        searchResults = patientAppointments.map(appointment => ({
          patientName: appointment.patient.name,
          patientIssue: appointment.patient.issue,
          doctorName: appointment.doctor.name,
          diseaseName: appointment.patient.diseaseName,
          appointmentTime: appointment.appointmentDate,
          appointmentType: appointment.appointmentType
        }));
      }
  
      return res.status(200).json({ searchResults });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server Error', error });
    }
  };

// Helper function to calculate patient statistics
const getPatientStatistics = async (hospitalId) => {
  const now = new Date();

  // For the past year
  const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
  const yearlyPatients = await Patient.countDocuments({
    hospital: hospitalId,
    createdAt: { $gte: oneYearAgo },
  });

  // For the past month
  const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
  const monthlyPatients = await Patient.countDocuments({
    hospital: hospitalId,
    createdAt: { $gte: oneMonthAgo },
  });

  // For the past week
  const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
  const weeklyPatients = await Patient.countDocuments({
    hospital: hospitalId,
    createdAt: { $gte: oneWeekAgo },
  });

  return { yearlyPatients, monthlyPatients, weeklyPatients };
};


  


module.exports = {
    defaults,
    register,
    createDoctor,
    createHospital,
    getAllHospitals,
    getHospitalById,
    updateHospitalById,
    deleteHospitalById,
    deleteDoctorById,
    getprofile,
    updateprofile,
    changeAdminPassword,
    getAdminDashboardData,
};
