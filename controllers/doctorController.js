const Doctor = require('../models/doctorModel');
const bcrypt = require('bcrypt');
const Appointment = require('../models/appointmentmodel');
const Patient = require('../models/patientModel'); 


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

const getTodaysAppointments = async (req, res) => {
    const doctorId = req.user.id; // Accessing doctor ID from req.user.id
  
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
      const appointments = await Appointment.find({
        doctor: doctorId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      }).populate('patient', 'firstName lastName'); // Populate patient fields
  
      const formattedAppointments = appointments.map((appointment) => ({
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        diseaseName: appointment.diseaseName,
        patientIssue: appointment.patientIssue,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        appointmentType: appointment.appointmentType,
      }));
  
      return res.status(200).json(formattedAppointments);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  
  // Get upcoming appointments for the logged-in doctor
  const getUpcomingAppointments = async (req, res) => {
    const doctorId = req.user.id;
  
    try {
      const appointments = await Appointment.find({
        doctor: doctorId,
        appointmentDate: { $gt: new Date() }, // Appointments in the future
      }).populate('patient', 'firstName lastName'); // Populate patient fields
  
      const formattedAppointments = appointments.map((appointment) => ({
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        diseaseName: appointment.diseaseName,
        patientIssue: appointment.patientIssue,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        appointmentType: appointment.appointmentType,
      }));
  
      return res.status(200).json(formattedAppointments);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  
  // Get previous appointments for the logged-in doctor
  const getPreviousAppointments = async (req, res) => {
    const doctorId = req.user.id;
  
    try {
      const appointments = await Appointment.find({
        doctor: doctorId,
        appointmentDate: { $lt: new Date() }, // Appointments in the past
      }).populate('patient', 'firstName lastName'); // Populate patient fields
  
      const formattedAppointments = appointments.map((appointment) => ({
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        diseaseName: appointment.diseaseName,
        patientIssue: appointment.patientIssue,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        appointmentType: appointment.appointmentType,
      }));
  
      return res.status(200).json(formattedAppointments);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  
  // Get canceled appointments for the logged-in doctor
  const getCanceledAppointments = async (req, res) => {
    const doctorId = req.user.id;
  
    try {
      const appointments = await Appointment.find({
        doctor: doctorId,
        status: 'canceled', // Appointments that are canceled
      }).populate('patient', 'firstName lastName'); // Populate patient fields
  
      const formattedAppointments = appointments.map((appointment) => ({
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        diseaseName: appointment.diseaseName,
        patientIssue: appointment.patientIssue,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        appointmentType: appointment.appointmentType,
      }));
  
      return res.status(200).json(formattedAppointments);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  const getPatientRecords = async (req, res) => {
    const { period } = req.params; // Expecting 'daily', 'weekly', or 'monthly'
    const doctorId = req.user.id; // Accessing doctor ID from the request
    const currentDate = new Date();
    let startDate;
  
    switch (period) {
      case 'daily':
        startDate = new Date(currentDate.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        startDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
        break;
      default:
        return res.status(400).json({ message: 'Invalid period' });
    }
  
    try {
      // Fetching appointments for the doctor within the specified date range
      const appointments = await Appointment.find({
        doctor: doctorId,
        appointmentDate: { $gte: startDate },
      }).populate('patient', 'firstName lastName age gender diseaseName patientIssue appointmentDate appointmentTime');
  
      // Transforming the data to include necessary details
      const patientRecords = appointments.map(appointment => ({
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        patientId:  appointment.patient,
        diseaseName: appointment.diseaseName,
        patientIssue: appointment.patientIssue,
        lastAppointmentDate: appointment.appointmentDate,
        lastAppointmentTime: appointment.appointmentTime,
        age: appointment.patient.age,
        gender: appointment.patient.gender,
      }));
  
      return res.status(200).json({ patientRecords });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };


  const getPatientDetails = async (req, res) => {
    const patientId = req.params.id; // Get patient ID from the request parameters
  
    try {
      // Fetch the patient by ID
      const patient = await Patient.findById(patientId);
      
      // Check if patient exists
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found.' });
      }
  
      // Respond with patient details
      return res.status(200).json({
        patientid:patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phoneNumber: patient.phoneNumber,
        age: patient.age,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        dateOfBirth: patient.dateOfBirth,
        address: patient.address,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };


  //prescription appointment data

  const getAppointments = async (req, res) => {
    const doctorId = req.user.id; // Get doctor ID from authenticated user
    const { date } = req.query; // Get the date from the query parameters
  
    // If no date is provided, use today's date
    const appointmentDate = date ? new Date(date) : new Date();
    appointmentDate.setHours(0, 0, 0, 0); // Set to start of the day
  
    // Set the end of the day to ensure we capture all appointments
    const nextDay = new Date(appointmentDate);
    nextDay.setDate(appointmentDate.getDate() + 1); // Move to the next day
  
    try {
      // Find appointments for the specified date range and the current doctor
      const appointments = await Appointment.find({
        doctor: doctorId,
        appointmentDate: {
          $gte: appointmentDate, // Greater than or equal to start of the day
          $lt: nextDay // Less than the start of the next day
        },
        status: { $ne: 'canceled' } // Exclude canceled appointments
      })
      .populate('patient', 'firstName lastName age gender') // Populate patient details
      .select('patient appointmentType appointmentTime patient appointment'); // Select required fields
  
      // Check if there are any appointments
      if (!appointments.length) {
        return res.status(404).json({ message: 'No appointments found for this date.' });
      }
  
      // Format the response
      const formattedAppointments = appointments.map((appointment) => ({
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        appointmentType: appointment.appointmentType,
        patientAge: appointment.patient.age,
        patientGender: appointment.patient.gender,
        appointmentTime: appointment.appointmentTime,
        patientId: appointment.patient._id,
        appointmentId: appointment._id,
      }));
  
      return res.status(200).json(formattedAppointments);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  
  

module.exports = {
    profile,
    updateProfile,
    changeDoctorPassword,
    getTodaysAppointments,
    getUpcomingAppointments,
    getPreviousAppointments,
    getCanceledAppointments,
    getPatientRecords,
    getPatientDetails,
    getAppointments,
};
