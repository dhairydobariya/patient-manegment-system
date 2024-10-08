const twilio = require('twilio');

// Twilio credentials
const accountSid = 'your_account_sid';
const authToken = 'your_auth_token';
const client = twilio(accountSid, authToken);

// Create a video session link using Twilio
exports.createTeleconsultationLink = async (appointmentId) => {
  try {
    // Twilio video room creation logic
    const room = await client.video.rooms.create({ uniqueName: appointmentId });

    // Return the video room URL (You may customize this further)
    return `https://video.twilio.com/${room.sid}`;
  } catch (error) {
    throw new Error('Error creating teleconsultation link');
  }
};
