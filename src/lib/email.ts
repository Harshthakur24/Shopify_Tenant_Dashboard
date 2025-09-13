import nodemailer from 'nodemailer';

// Create transporter lazily to avoid issues in edge environments
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

export interface PasswordResetEmailOptions {
  to: string;
  resetUrl: string;
  userName?: string;
}

export async function sendPasswordResetEmail({ to, resetUrl, userName }: PasswordResetEmailOptions) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: 'Reset your password - Xeno Assignment',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f8fafc;
          }
          .email-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
          .header {
            background: white;
            padding: 40px 30px 30px;
            text-align: center;
            border-bottom: 3px solid #f1f5f9;
          }
          .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            background: white;
            padding: 40px 30px;
          }
          .title {
            color: #1e293b;
            margin-bottom: 20px;
            font-size: 28px;
            font-weight: 700;
            text-align: center;
          }
          .message {
            color: #64748b;
            margin-bottom: 30px;
            font-size: 16px;
            line-height: 1.6;
          }
          .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            margin: 20px auto;
            display: block;
            width: fit-content;
          }
          .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
          }
          .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
          }
          .warning {
            background: #fef3cd;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            color: #92400e;
            font-size: 14px;
          }
          .security-info {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            color: #0c4a6e;
            font-size: 14px;
          }
          @media only screen and (max-width: 600px) {
            body { padding: 10px; }
            .content, .header, .footer { padding: 20px; }
            .title { font-size: 24px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo">X</div>
            <h1 style="margin: 0; color: #1e293b; font-size: 24px;">Password Reset Request</h1>
          </div>
          
          <div class="content">
            <h2 class="title">Reset Your Password</h2>
            
            <div class="message">
              ${userName ? `Hello ${userName},` : 'Hello,'}
              <br><br>
              We received a request to reset your password for your Xeno Assignment account. If you didn't make this request, you can safely ignore this email.
            </div>

            <div class="security-info">
              <strong>🔒 Security Information:</strong><br>
              This reset link will expire in 1 hour for security purposes. If you need a new link after it expires, please request another password reset.
            </div>

            <a href="${resetUrl}" class="reset-button">Reset My Password</a>

            <div class="warning">
              <strong>⚠️ Important:</strong> This link will only work once and expires in 1 hour. If you didn't request this password reset, please ignore this email or contact support if you have concerns.
            </div>

            <div class="message">
              If the button above doesn't work, you can copy and paste this link into your browser:
              <br><br>
              <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
            </div>
          </div>

          <div class="footer">
            <p>This email was sent from Xeno Assignment Platform</p>
            <p>© ${new Date().getFullYear()} Xeno Assignment. All rights reserved.</p>
            <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
              If you're having trouble with the button above, copy and paste the URL into your web browser.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Reset Your Password - Xeno Assignment
      
      ${userName ? `Hello ${userName},` : 'Hello,'}
      
      We received a request to reset your password for your Xeno Assignment account.
      
      Click the following link to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour for security purposes.
      
      If you didn't request this password reset, please ignore this email.
      
      ---
      Xeno Assignment Platform
      © ${new Date().getFullYear()} Xeno Assignment. All rights reserved.
    `,
  };

  try {
    const emailTransporter = getTransporter();
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

export async function verifyEmailConfiguration() {
  try {
    const emailTransporter = getTransporter();
    await emailTransporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}
