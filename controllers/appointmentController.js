const Appointment = require('../models/appointmentmodel');
const Doctor = require('../models/doctorModel');

const createAppointment = async (req, res) => {
  try {
    const { hospital, doctor, patient, appointmentType, appointmentDate, appointmentTime, patientIssue, diseaseName } = req.body;

    // Check if doctor is available at the requested time
    const conflictingAppointments = await Appointment.find({
      doctor,
      appointmentDate: new Date(appointmentDate),
      appointmentTime
    });

    if (conflictingAppointments.length > 0) {
      return res.status(400).json({ error: 'Doctor is already booked at this time.' });
    }

    // Check doctor's availability for the time period
    const doctorDetails = await Doctor.findById(doctor);
    // Assuming `doctorDetails.unavailableTimes` contains a list of unavailable periods (start and end times)
    const isDoctorUnavailable = doctorDetails.unavailableTimes.some((unavailableTime) => {
      const [start, end] = unavailableTime.split('-');
      return appointmentTime >= start && appointmentTime < end;
    });

    if (isDoctorUnavailable) {
      return res.status(400).json({ error: 'Doctor is unavailable during this time.' });
    }

    const newAppointment = new Appointment({
      hospital,
      doctor,
      patient,
      appointmentType,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      patientIssue,
      diseaseName
    });

    await newAppointment.save();
    res.status(201).json({ message: 'Appointment successfully created.', appointment: newAppointment });
  } catch (error) {
    res.status(500).json({ error: 'Server error while creating appointment.' });
  }
};

const getAppointment = async (req, res) => {
    try {
      const appointment = await Appointment.findById(req.params.id).populate('hospital doctor patient');
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found.' });
      }
      res.status(200).json(appointment);
    } catch (error) {
      res.status(500).json({ error: 'Server error while fetching appointment.' });
    }
  };

  const updateAppointment = async (req, res) => {
    try {
      const { appointmentDate, appointmentTime } = req.body;
      const appointment = await Appointment.findById(req.params.id);
      
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found.' });
      }
  
      // Check if doctor is available at the new time
      const conflictingAppointments = await Appointment.find({
        doctor: appointment.doctor,
        appointmentDate: new Date(appointmentDate),
        appointmentTime
      });
  
      if (conflictingAppointments.length > 0) {
        return res.status(400).json({ error: 'Doctor is already booked at this new time.' });
      }
  
      // Update the appointment
      appointment.appointmentDate = new Date(appointmentDate);
      appointment.appointmentTime = appointmentTime;
      await appointment.save();
  
      res.status(200).json({ message: 'Appointment successfully updated.', appointment });
    } catch (error) {
      res.status(500).json({ error: 'Server error while updating appointment.' });
    }
  };

  const cancelAppointment = async (req, res) => {
    try {
      const appointment = await Appointment.findById(req.params.id);
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found.' });
      }
  
      // Set the appointment as canceled
      appointment.appointmentCancelDate = new Date();
      await appointment.save();
  
      res.status(200).json({ message: 'Appointment successfully canceled.', appointment });
    } catch (error) {
      res.status(500).json({ error: 'Server error while canceling appointment.' });
    }
  };

  const deleteAppointment = async (req, res) => {
    try {
      const appointment = await Appointment.findById(req.params.id);
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found.' });
      }
  
      await appointment.remove();
      res.status(200).json({ message: 'Appointment successfully deleted.' });
    } catch (error) {
      res.status(500).json({ error: 'Server error while deleting appointment.' });
    }
  };
  

  module.exports = {
    createAppointment,
    getAppointment,
    updateAppointment,
    cancelAppointment,
    deleteAppointment
  }