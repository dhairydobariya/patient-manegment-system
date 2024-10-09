const Doctor = require('../models/doctorModel');
const bcrypt = require('bcrypt');


// Doctor Profile Function
let profile = async (req, res) => {
    try {
        // Get the doctor ID from the authenticated user (req.user.id)
        const doctorId = req.user.id; // Assuming req.user contains the decoded user info

        // Find the doctor by ID
        const doctor = await Doctor.findById(doctorId).populate('currentHospital', 'name'); // Populate to get hospital name

        // Check if doctor exists
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Create a response object with only the necessary fields
        const doctorProfile = {
            firstName: doctor.name.split(' ')[0], // Assuming name format "First Last"
            lastName: doctor.name.split(' ')[1],  // Assuming name format "First Last"
            email: doctor.email,
            phoneNumber: doctor.phoneNumber,
            hospitalName: doctor.currentHospital ? doctor.currentHospital.name : 'N/A', // Check if hospital exists
            gender: doctor.gender,
            country: doctor.address.country,
            state: doctor.address.state,
            city: doctor.address.city,
        };

        // Send the doctor profile as a response
        res.status(200).json(doctorProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

let updateProfile = async (req, res) => {
    const { firstName, lastName, phoneNumber, hospitalName, gender, country, state, city } = req.body;
    
    try {
        // Get the doctor ID from the authenticated user (req.user.id)
        const doctorId = req.user.id;

        // Prepare the update object
        const updateData = {};

        // Update name (if firstName or lastName is provided)
        if (firstName || lastName) {
            const doctor = await Doctor.findById(doctorId);
            const fullName = `${firstName || doctor.name.split(' ')[0]} ${lastName || doctor.name.split(' ')[1] || ''}`;
            updateData.name = fullName.trim();
        }

        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (hospitalName) updateData.currentHospital = hospitalName; // Adjust this if hospital ID is provided
        if (gender) updateData.gender = gender;

        // Update address fields properly
        if (country || state || city) {
            updateData.address = {}; // Initialize address object
            if (country) updateData.address.country = country;
            if (state) updateData.address.state = state;
            if (city) updateData.address.city = city;
        }

        // Update the doctor's profile
        const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, updateData, { new: true });

        // Check if doctor was found and updated
        if (!updatedDoctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Create a response object with only the necessary fields
        const doctorProfile = {
            firstName: updatedDoctor.name.split(' ')[0],
            lastName: updatedDoctor.name.split(' ')[1] || '',
            email: updatedDoctor.email,
            phoneNumber: updatedDoctor.phoneNumber,
            hospitalName: updatedDoctor.currentHospital ? updatedDoctor.currentHospital.name : 'N/A',
            gender: updatedDoctor.gender,
            country: updatedDoctor.address.country,
            state: updatedDoctor.address.state,
            city: updatedDoctor.address.city,
        };

        // Send the updated doctor profile as a response
        res.status(200).json(doctorProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const changeDoctorPassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    try {
        const doctor = await Doctor.findById(userId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Compare current password
        const isMatch = await bcrypt.compare(currentPassword, doctor.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Check if new password and confirm password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New password and confirm password do not match' });
        }

        // Hash and update new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        doctor.password = hashedNewPassword;

        await doctor.save();
        res.status(200).json({ message: 'Doctor password changed successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};


module.exports = {
    profile,
    updateProfile,
    changeDoctorPassword
};
