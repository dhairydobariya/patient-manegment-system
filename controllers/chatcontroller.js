const Chat = require('../models/chatModel');

// Fetch chat between doctor and patient
exports.getChat = async (req, res) => {
  const { doctorId, patientId } = req.params;
  try {
    const chat = await Chat.findOne({ doctor: doctorId, patient: patientId })
      .populate('doctor', 'name') // Populate doctor name
      .populate('patient', 'name'); // Populate patient name

    if (!chat) {
      return res.status(404).json({ msg: 'No chat history found' });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Save new chat message
exports.saveChatMessage = async (doctorId, patientId, message, senderId, senderModel) => {
  try {
    let chat = await Chat.findOne({ doctor: doctorId, patient: patientId });

    if (!chat) {
      chat = new Chat({ doctor: doctorId, patient: patientId });
    }

    const newMessage = {
      sender: senderId,
      senderModel,
      message,
      type: 'text', // You can modify this to handle file attachments
    };

    chat.messages.push(newMessage);
    chat.lastUpdated = Date.now();
    await chat.save();

    return newMessage;
  } catch (error) {
    console.error('Error saving message:', error);
  }
};
