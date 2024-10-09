const mongoose = require('mongoose');

// Schema for bill
const billSchema = new mongoose.Schema({
  doctorName: { type: String, required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }, // Add doctor ID
  patientName: { type: String, required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true }, // Add patient ID
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true }, // Add hospital ID
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true }, // Add appointment ID
  billNo: { type: String, required: true, unique: true },
  billDate: { type: Date, default: Date.now },
  billTime: { type: String, required: true },
  gender: { type: String, required: true },
  age: { type: Number, required: true },
  address: { type: String, required: true },
  diseaseName: { type: String },
  phoneNumber: { type: String, required: true },
  paymentType: { type: String, enum: ['insurance', 'online', 'cash'], required: true },
  description: [
    {
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      qty: { type: Number, required: true },
      total: { type: Number, required: true },
    }
  ],
  amount: { type: Number, required: true }, // Total of all descriptions
  discount: { type: Number }, // Default 5%
  tax: { type: Number }, // Default 12%
  totalAmount: { type: Number, required: true }, // Final total
  email: { type: String, required: true },
}, { timestamps: true });

// Pre-save hook to calculate discount, tax, and totalAmount
billSchema.pre('save', function (next) {
  // Apply discount and tax based on the amount
  const discount = this.amount * 0.05; // 5% discount
  const tax = this.amount * 0.12; // 12% tax
  this.discount = discount;
  this.tax = tax;

  // Calculate the total amount after discount and adding tax
  this.totalAmount = this.amount - discount + tax;

  next();
});

const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
