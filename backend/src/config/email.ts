import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

export const sendEmail = async (
  to: string | string[],
  subject: string,
  html: string
): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Online Quiz System" <${process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email đã gửi đến: ${to}`);
  } catch (error: any) {
    console.error('❌ Lỗi gửi email:', error.message);
    throw error;
  }
};

export default sendEmail;