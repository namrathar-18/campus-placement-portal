import nodemailer from 'nodemailer';

// Nodemailer transporter (Gmail app password or any SMTP provider).
// Email is optional: if credentials are not configured the app keeps working
// and simply skips sending, so deployments never fail because of email.
let transporter = null;

const emailEnabled = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

if (emailEnabled) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

const statusCopy = {
  placed: {
    subject: '🎉 Congratulations! You have been placed',
    heading: 'You have been placed!',
    body: 'Congratulations! You have been selected and marked as placed for',
    tone: '#16a34a',
  },
  ongoing: {
    subject: 'Your application is progressing',
    heading: 'Application shortlisted',
    body: 'Good news! Your application has moved to the next round for',
    tone: '#2563eb',
  },
  rejected: {
    subject: 'Update on your application',
    heading: 'Application update',
    body: 'Thank you for applying. Unfortunately your application was not selected for',
    tone: '#dc2626',
  },
  pending: {
    subject: 'Application received',
    heading: 'Application received',
    body: 'We have received your application for',
    tone: '#64748b',
  },
};

const buildHtml = ({ name, companyName, status }) => {
  const copy = statusCopy[status] || statusCopy.pending;
  return `
  <div style="font-family:Segoe UI,Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#1B3C53,#234C6A);color:#fff;padding:28px;border-radius:12px 12px 0 0;">
      <h1 style="margin:0;font-size:20px;">Christ University Placement Portal</h1>
    </div>
    <div style="background:#f8fafc;padding:28px;border-radius:0 0 12px 12px;color:#1e293b;">
      <p>Hi ${name || 'Student'},</p>
      <h2 style="color:${copy.tone};margin:16px 0 8px;">${copy.heading}</h2>
      <p>${copy.body} <strong>${companyName}</strong>.</p>
      <p style="margin-top:20px;">Log in to the portal to view full details and next steps.</p>
      <p style="margin-top:24px;color:#64748b;font-size:13px;">— Placement Cell, Christ University</p>
    </div>
  </div>`;
};

/**
 * Send an application status-update email to a student.
 * Safe no-op when email is not configured.
 */
export const sendApplicationStatusEmail = async ({ to, name, companyName, status }) => {
  if (!emailEnabled || !to) return { success: false, skipped: true };

  const copy = statusCopy[status] || statusCopy.pending;
  try {
    await transporter.sendMail({
      from: `"Christ Placement Cell" <${process.env.EMAIL_USER}>`,
      to,
      subject: copy.subject,
      html: buildHtml({ name, companyName, status }),
    });
    return { success: true };
  } catch (error) {
    console.error('Email send failed:', error.message);
    return { success: false, error: error.message };
  }
};

export default { sendApplicationStatusEmail };
