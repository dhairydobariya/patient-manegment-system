const Bill = require('../models/billmodel'); // Adjust path as needed
const Appointment = require('../models/appointmentmodel'); // Adjust path as needed

// Function to create a new bill based on appointment
const createBill = async (req, res) => {
  const { appointmentId } = req.params; // Get appointmentId from request parameters
  const { description, items, dynamicFields } = req.body; // Extract bill details from request body

  try {
    // Find the appointment by ID
    const appointment = await Appointment.findById(appointmentId)
      .populate('hospitalId') // Assuming these are ObjectId references
      .populate('doctorId')
      .populate('patientId');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Create the bill based on the appointment details
    const bill = new Bill({
      hospitalId: appointment.hospitalId,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      appointmentId: appointmentId,
      description: description,
      items: items, // This should be an array of item objects with description and amount
      dynamicFields: dynamicFields, // Any additional fields if necessary
      totalAmount: items.reduce((total, item) => total + item.amount, 0), // Calculate total amount from items
    });

    await bill.save(); // Save the bill to the database

    return res.status(201).json(bill); // Return the created bill
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

// Function to create a new bill by admin
const createBillByAdmin = async (req, res) => {
  const { hospitalId, doctorId, patientId, description, items, dynamicFields } = req.body; // Extract bill details from request body

  try {
    // Create the bill directly with provided information
    const bill = new Bill({
      hospitalId: hospitalId,
      doctorId: doctorId,
      patientId: patientId,
      description: description,
      items: items, // This should be an array of item objects with description and amount
      dynamicFields: dynamicFields, // Any additional fields if necessary
      totalAmount: items.reduce((total, item) => total + item.amount, 0), // Calculate total amount from items
    });

    await bill.save(); // Save the bill to the database

    return res.status(201).json(bill); // Return the created bill
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

// Edit Bill Function
let editBill = async (req, res) => {
  try {
    const billId = req.params.id; // Get the bill ID from the URL parameters
    const { dynamicFieldsToAdd, dynamicFieldsToRemove, ...updatedData } = req.body; // Get updated data from the request body

    // Find the bill by ID
    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Update static fields
    Object.assign(bill, updatedData); // Merge updated fields into the bill

    // Add new dynamic fields
    if (dynamicFieldsToAdd && Array.isArray(dynamicFieldsToAdd)) {
      bill.dynamicFields.push(...dynamicFieldsToAdd);
    }

    // Remove specified dynamic fields
    if (dynamicFieldsToRemove && Array.isArray(dynamicFieldsToRemove)) {
      bill.dynamicFields = bill.dynamicFields.filter(field => !dynamicFieldsToRemove.includes(field._id.toString()));
    }

    // Save the updated bill
    const updatedBill = await bill.save();

    return res.status(200).json({ message: 'Bill updated successfully', bill: updatedBill });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating bill', error: error.message });
  }
};


module.exports = { createBill, createBillByAdmin , editBill };


