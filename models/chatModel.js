const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel', required: true },
  senderModel: { type: String, required: true, enum: ['Doctor', 'Patient'] },
  message: { type: String, required: true },
  type: { type: String, default: 'text' }, // You can extend this to support file attachments
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  messages: [messageSchema],
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
