import pkg from 'nodemailer';
const { createTransport } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configured***' : 'NOT SET');
  
  const transporter = createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    
    // Send test email
    const info = await transporter.sendMail({
      from: `"Campus Placement Portal" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: 'Test Email - Password Reset',
      html: '<h1>Test Email</h1><p>Your reset code is: <strong>123456</strong></p>',
    });
    
    console.log('✅ Test email sent successfully');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error:', error.message);
    if (error.code) console.error('Error Code:', error.code);
    if (error.response) console.error('Response:', error.response);
  }
}

testEmail();
