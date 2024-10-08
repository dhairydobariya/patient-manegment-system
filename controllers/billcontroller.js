const Bill = require('../models/billmodel');
const Appointment = require('../models/appointmentmodel');

// Create bill from appointment details
exports.createBillFromAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Find the appointment, along with related patient, doctor, and hospital
    const appointment = await Appointment.findById(appointmentId)
      .populate('patient')  // Populate patient details
      .populate('doctor')   // Populate doctor details
      .populate('hospital'); // Populate hospital details

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const patient = appointment.patient;
    const doctor = appointment.doctor;
    const hospital = appointment.hospital;

    // Validate if the description exists in the request body
    if (!req.body.description || !Array.isArray(req.body.description)) {
      return res.status(400).json({ message: 'Invalid or missing description in request body' });
    }

    // Check if each item in the description array has the necessary fields
    const items = req.body.description.map(item => {
      if (!item.name || !item.amount || !item.qty) {
        throw new Error('Each item must have a name, amount, and qty');
      }

      return {
        name: item.name,
        amount: item.amount,
        qty: item.qty,
        total: item.amount * item.qty,
      };
    });

    const totalAmount = items.reduce((acc, item) => acc + item.total, 0);

    // Generate bill number (this could be customized as needed)
    const billNo = `BILL-${Date.now()}`;
    console.log('Generated Bill No:', billNo);  // Debugging to ensure billNo is created

    // Get the current time for billTime
    const billTime = new Date().toLocaleTimeString();

    // Create the bill based on appointment details
    const bill = new Bill({
      doctorName: doctor.name,
      doctorId: doctor._id, // Adding doctor ID
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientId: patient._id, // Adding patient ID
      hospitalId: hospital._id, // Adding hospital ID
      appointmentId: appointment._id, // Adding appointment ID
      gender: patient.gender,
      age: patient.age,
      address: `${patient.address.street}, ${patient.address.city}, ${patient.address.state}`,
      diseaseName: appointment.diseaseName,
      phoneNumber: patient.phoneNumber,
      paymentType: req.body.paymentType,
      description: items,
      amount: totalAmount,
      discount: totalAmount * 0.05, // 5% discount
      tax: totalAmount * 0.12, // 12% tax
      totalAmount: totalAmount - totalAmount * 0.05 + totalAmount * 0.12,
      email: patient.email,
      billNo: billNo, // Adding generated bill number
      billTime: billTime, // Adding generated bill time
      billDate: new Date(), // Set the current date
    });

    await bill.save();
    res.status(201).json({ message: 'Bill created successfully', bill });
  } catch (error) {
    console.error('Error creating bill:', error);  // Log detailed error
    res.status(500).json({ message: 'Error creating bill', error: error.message || error });
  }
};


// Manual bill creation by admin
exports.manualCreateBill = async (req, res) => {
  try {
    const { doctorId, patientId, hospitalId, description, paymentType } = req.body;

    // Calculate total amount from description
    const items = description.map(item => ({
      name: item.name,
      amount: item.amount,
      qty: item.qty,
      total: item.amount * item.qty,
    }));
    const totalAmount = items.reduce((acc, item) => acc + item.total, 0);

    // Create the manual bill
    const bill = new Bill({
      doctorId, // Directly use provided doctorId
      patientId, // Directly use provided patientId
      hospitalId, // Directly use provided hospitalId
      doctorName: req.body.doctorName, // Add doctor name
      patientName: req.body.patientName, // Add patient name
      billNo: `BILL-${Date.now()}`, // Unique bill number
      gender: req.body.gender,
      age: req.body.age,
      address: req.body.address,
      diseaseName: req.body.diseaseName,
      phoneNumber: req.body.phoneNumber,
      paymentType,
      description: items,
      amount: totalAmount,
      discount: totalAmount * 0.05, // 5% discount
      tax: totalAmount * 0.12, // 12% tax
      totalAmount: totalAmount - totalAmount * 0.05 + totalAmount * 0.12,
      email: req.body.email,
    });

    await bill.save();
    res.status(201).json({ message: 'Bill created successfully', bill });
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ message: 'Error creating bill', error: error.message || error });
  }
};



// Update bill function
exports.updateBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const updates = req.body;

    const updatedBill = await Bill.findByIdAndUpdate(billId, updates, { new: true });

    if (!updatedBill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.status(200).json({ message: 'Bill updated successfully', updatedBill });
  } catch (error) {
    res.status(500).json({ message: 'Error updating bill', error });
  }
};
