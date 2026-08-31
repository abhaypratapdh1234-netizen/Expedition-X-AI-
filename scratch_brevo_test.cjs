const nodemailer = require('nodemailer');
require('dotenv').config({ path: 'c:/Users/Abhay Pratap/OneDrive/Desktop/Expedition X AI/.env' });

async function checkBrevo() {
  console.log('Testing Brevo SMTP connection...');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  try {
    const success = await transporter.verify();
    if (success) {
      console.log('✅ SUCCESS: Brevo SMTP API Key is 1000% WORKING!');
    }
  } catch (error) {
    console.error('❌ FAILURE: Brevo SMTP connection failed.');
    console.error(error.message);
  }
}

checkBrevo();
