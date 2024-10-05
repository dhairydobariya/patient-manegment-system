const mongoose = require('mongoose');

// Schema for dynamic fields
const fieldSchema = new mongoose.Schema({
  fieldType: {
    type: String,
    enum: ['text', 'dropdown'], // Specify the types: text, dropdown, etc.
    required: true
  },
  label: { type: String, required: true }, // Field label (e.g., Name, Email, etc.)
  options: {
    type: [String], // Array of dropdown options
    required: function() {
      return this.fieldType === 'dropdown'; // Only required if it's a dropdown
    }
  },
  value: { type: mongoose.Schema.Types.Mixed }, // Store the value, can be string, number, etc.
});

// Bill schema for the patient management system
const billSchema = new mongoose.Schema({
  hospitalId: { 
    type: mongoose.Schema.Types.ObjectId, // Reference to the Hospital model
    ref: 'Hospital', 
    required: true 
  },
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, // Reference to the Doctor model
    ref: 'Doctor', 
    required: true 
  },
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, // Reference to the Patient model
    ref: 'Patient', 
    required: true 
  },
  appointmentId: { 
    type: mongoose.Schema.Types.ObjectId, // Reference to the Appointment model
    ref: 'Appointment', // Required for appointment-based billing
  },
  description: { 
    type: String, // Description of the services or items billed
    required: true 
  },
  items: [
    {
      description: { 
        type: String, // Description of the item/service
        required: true 
      },
      amount: { 
        type: Number, // Amount for the specific item/service
        required: true 
      },
    }
  ],
  totalAmount: { 
    type: Number, // Total amount of the bill, sum of all item amounts
    required: true 
  },
  billDate: { 
    type: Date, // Date of the bill
    required: true 
  },
  billTime: { 
    type: String // Optional field for bill time
  },
  dynamicFields: [fieldSchema], // Array for additional fields created by admin
}, { timestamps: true });

const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
