const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  qualification: {
    type: String,
    required: true,
  },
  specialtyType: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  experience: {
    type: Number, // years of experience
    required: true,
  },
  checkupTime: {
    type: String, // you can adjust this to a date/time format if needed
    required: true,
  },
  workon: {
    type: String, // working hours or shift details
    enum: ['online', 'onsite', 'both'],
    required: true,
  },
  workingTime: {
    type: String, // working hours or shift details
    required: true,
  },
  breakTime: {
    type: String, // break time details
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },    
  age: {
    type: Number,
    required: true,
  },
  address: {
    country: String,
    state: String,
    city: String,
    zipCode: String,
    street: String,
  },
  onlineConsultationRate: {
    type: Number,
    required: true,
  },
  currentHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital', // Reference to Hospital model
  },
  hospitalWebsite: {
    type: String,
  },
  emergencyContactNumber: {
    type: String,
  },
  doctorAddress: {
    type: String,
  },
  description: {
    type: String,
  },
  signature: {
    type: String, // URL or file path to signature image
  },
  patientsHandled: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', // Reference to Patient model
  }],
  role: { type: String, default: "Doctor" },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);



// work on 