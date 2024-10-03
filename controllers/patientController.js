const Patient = require('../models/patientModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Patient Registration
const register = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, age, height, weight, gender, bloodGroup, dateOfBirth, address, password } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !age || !height || !weight || !gender || !bloodGroup || !dateOfBirth || !address || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newPatient = new Patient({
            firstName, lastName, email, phoneNumber, age, height, weight,
            gender, bloodGroup, dateOfBirth, address, password: hashedPassword
        });
        await newPatient.save();
        res.json({ message: "Patient successfully registered", patient: newPatient });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



// Get Patient Profile
const getPatientProfile = async (req, res) => {
    try {
        const patientId = req.user.id; // Assuming user ID is stored in req.user by authentication middleware
        const patient = await Patient.findById(patientId).select('-password'); // Exclude password from response
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.status(200).json(patient);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update Patient Profile
const updatePatientProfile = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, age, height, weight, gender, bloodGroup, address } = req.body;

    try {
        const patientId = req.user.id; // Get the patient ID from the authenticated user
        const patient = await Patient.findByIdAndUpdate(patientId, {
            firstName,
            lastName,
            email,
            phoneNumber,
            age,
            height,
            weight,
            gender,
            bloodGroup,
            address,
        }, { new: true, runValidators: true }); // Return the updated document

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully', patient });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};





module.exports = {
    register,
    getPatientProfile,
    updatePatientProfile,
}