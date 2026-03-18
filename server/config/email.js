
import postmark from "postmark";

const client = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);

// Send password reset email using Postmark
export const sendPasswordResetEmail = async (email, resetCode) => {
  await client.sendEmail({
    From: "your_verified_sender@email.com", // Use a verified sender from Postmark
    To: email,
    Subject: "Password Reset Code - Campus Placement Portal",
    HtmlBody: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 20px 0; border-radius: 5px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You have requested to reset your password for the Campus Placement Portal. Use the code below to reset your password:</p>
              <div class="code">${resetCode}</div>
              <p>This code will expire in <strong>10 minutes</strong>.</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you did not request this password reset, please ignore this email and ensure your account is secure.
              </div>
              <p>Best regards,<br>Campus Placement Team<br>Christ University</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    TextBody: `
Password Reset Request

You have requested to reset your password for the Campus Placement Portal.

Your reset code is: ${resetCode}

This code will expire in 10 minutes.

If you did not request this password reset, please ignore this email and ensure your account is secure.

Best regards,
Campus Placement Team
Christ University
    `,
  });
  return { success: true };
};

export default { sendPasswordResetEmail };
