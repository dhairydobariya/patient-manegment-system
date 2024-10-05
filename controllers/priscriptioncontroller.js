const Prescription = require('../models/priscriptionmodel');
const Appointment = require('../models/appointmentmodel');

// Create Prescription based on Appointment (appointmentId in params)
let createPrescription = async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const { medicine, doctorSignature, note, hospitalName, patientName, doctorName, doctorSpecification, gender, patientAddress, age } = req.body;
  
      // Check if appointment exists
      const appointment = await Appointment.findById(appointmentId)
        .populate('doctor')    // Populate doctor details
        .populate('patient')   // Populate patient details
        .populate('hospital'); // Populate hospital details
  
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
  
      // Ensure that a prescription doesn't already exist for this appointment
      const existingPrescription = await Prescription.findOne({ appointmentId });
      if (existingPrescription) {
        return res.status(400).json({ message: 'Prescription already exists for this appointment' });
      }
  
      // Use appointment details for the prescription
      const newPrescription = new Prescription({
        appointmentId,
        patientId: appointment.patient._id,
        doctorId: appointment.doctor._id,
        hospitalId: appointment.hospital._id,
        medicine,
        doctorSignature,
        hospitalName: appointment.hospital.name,
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        doctorName: appointment.doctor.name,
        doctorSpecification: appointment.doctor.specialtyType,
        gender: appointment.patient.gender,
        patientAddress: `${appointment.patient.address.street}, ${appointment.patient.address.city}, ${appointment.patient.address.state}, ${appointment.patient.address.country}`,
        age: appointment.patient.age,
        note,
      });
  
      // Save the prescription
      await newPrescription.save();
      res.status(201).json({ message: 'Prescription created successfully', prescription: newPrescription });
    } catch (error) {
      res.status(500).json({ message: 'Failed to create prescription', error: error.message });
    }
  };
  
  
// Get all prescriptions (optional pagination can be added)
let getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find();
    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch prescriptions', error: error.message });
  }
};

// Get Prescription by Appointment ID
let getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const prescription = await Prescription.findOne({ appointmentId });
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.status(200).json(prescription);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch prescription', error: error.message });
  }
};

// Update Prescription by Appointment ID
let updatePrescription = async (req, res) => {
    try {
      const { prescriptionId } = req.params; // Get the prescription ID from the URL
      const { medicine, doctorSignature, note } = req.body;
  
      // Find the prescription by ID
      const prescription = await Prescription.findById(prescriptionId);
  
      // Check if the prescription exists
      if (!prescription) {
        return res.status(404).json({ message: 'Prescription not found' });
      }
  
      // Check if the logged-in doctor matches the prescription's doctor
      if (prescription.doctorId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You are not authorized to update this prescription' });
      }
  
      // Create an object to hold the updated fields
      const updateData = {};
  
      // Only add fields that are provided in the request body
      if (medicine) updateData.medicine = medicine;
      if (doctorSignature) updateData.doctorSignature = doctorSignature;
      if (note) updateData.note = note;
  
      // Update the prescription using the PATCH method
      const updatedPrescription = await Prescription.findByIdAndUpdate(
        prescriptionId,
        updateData,
        { new: true, runValidators: true } // Options: return the updated document and run validation
      );
  
      res.status(200).json({ message: 'Prescription updated successfully', prescription: updatedPrescription });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update prescription', error: error.message });
    }
  };
  
// Delete Prescription by Appointment ID
let deletePrescription = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const deletedPrescription = await Prescription.findOneAndDelete({ appointmentId });

    if (!deletedPrescription) {
      return res.status(404).json({ message: 'Prescription not found for this appointment' });
    }

    res.status(200).json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete prescription', error: error.message });
  }
};


module.exports = {
    createPrescription,
    getAllPrescriptions,
    getPrescriptionByAppointment,
    updatePrescription,
    deletePrescription
}