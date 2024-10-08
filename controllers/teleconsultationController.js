const Appointment = require('../models/appointmentmodel');
const twilio = require('twilio');

// Twilio credentials (environment variables recommended for security)
const accountSid = process.env.TWILIO_ACCOUNT_SID; 
const authToken = process.env.TWILIO_AUTH_TOKEN; 
const client = twilio(accountSid, authToken);

// Create a video room for the teleconsultation
const createTeleconsultation = async (req, res) => {
  const { appointmentId } = req.body;

  try {
    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Create Twilio video room
    const room = await client.video.rooms.create({
      uniqueName: `teleconsultation-${appointmentId}`,
      type: 'group',
    });

    // Update the appointment with teleconsultation link
    appointment.teleconsultationLink = room.sid; // room.sid is the unique ID for the room
    appointment.teleconsultationStatus = 'in_progress';
    await appointment.save();

    return res.status(200).json({ message: 'Teleconsultation started', roomLink: room.sid });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Join an existing teleconsultation room
const joinTeleconsultation = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (!appointment.teleconsultationLink) {
      return res.status(400).json({ message: 'Teleconsultation not started yet' });
    }

    return res.status(200).json({ message: 'Join the teleconsultation', roomLink: appointment.teleconsultationLink });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createTeleconsultation, joinTeleconsultation };
