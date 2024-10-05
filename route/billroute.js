const express = require('express');
const { createBill , createBillByAdmin, editBill } = require('../controllers/billcontroller'); // Adjust path as needed

const router = express.Router();

// Route to create a new bill
router.post('/bills/:appointmentId', createBill);

router.post('/bills/admin', createBillByAdmin);

router.patch('/bill/edit' , editBill)

module.exports = router;
