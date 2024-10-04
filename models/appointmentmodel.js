const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  specialty: {
    type: String, // Dropdown
    required: true,
  },
  country: {
    type: String, // Dropdown
    required: true,
  },
  state: {
    type: String, // Dropdown
    required: true,
  },
  city: {
    type: String, // Dropdown
    required: true,
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital', // Reference to Hospital
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor', // Reference to Doctor
    required: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient', // Reference to Patient
    required: true,
  },
  appointmentType: {
    type: String,
    enum: ['online', 'onsite'], // Dropdown
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  appointmentTime: {
    type: String, // Store time as string like '10:00 AM'
    required: true,
  },
  appointmentCancelDate: {
    type: Date,
  },
  patientIssue: {
    type: String,
  },
  diseaseName: {
    type: String,
  },
  updatedBy: {
    type: String, // Could be 'patient' or 'doctor'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'clear', 'failed'],
    default: 'pending',
  },
  doctorUnavailableTimes: [{
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    }
  }],
}, { timestamps: true });

// Custom validation for availability of the doctor
appointmentSchema.pre('save', async function (next) {
  const { doctor, appointmentDate, appointmentTime } = this;
  // Check if the doctor already has an appointment at the same time
  const existingAppointment = await mongoose.model('Appointment').findOne({
    doctor,
    appointmentDate,
    appointmentTime,
  });
  if (existingAppointment) {
    return next(new Error('Doctor already has an appointment at this time'));
  }
  
  // Check if the doctor is available at the requested time
  const doctorModel = await mongoose.model('Doctor').findById(doctor);
  if (doctorModel) {
    const unavailableTimes = doctorModel.doctorUnavailableTimes;
    for (let period of unavailableTimes) {
      if (appointmentTime >= period.startTime && appointmentTime < period.endTime) {
        return next(new Error('Doctor is unavailable during this time'));
      }
    }
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
