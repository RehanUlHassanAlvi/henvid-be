import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const SENDER_EMAIL = process.env.SENDGRID_SENDER_EMAIL || 'noreply@henvid.com';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const msg = {
        to: options.to,
        from: SENDER_EMAIL,
        subject: options.subject,
        text: options.text || '',
        html: options.html,
      };

      await sgMail.send(msg);
      console.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  static async sendVerificationEmail(
    email: string, 
    firstName: string, 
    verificationCode: string
  ): Promise<boolean> {
    const subject = 'Verify your Henvid account';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Account</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #e11d48; }
          .verification-box { 
            background: #f8f9fa; 
            border: 2px dashed #e11d48; 
            padding: 20px; 
            text-align: center; 
            margin: 20px 0; 
            border-radius: 8px;
          }
          .verification-code { 
            font-size: 32px; 
            font-weight: bold; 
            color: #e11d48; 
            letter-spacing: 4px; 
            margin: 10px 0;
          }
          .button { 
            display: inline-block; 
            background: #e11d48; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0;
          }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Henvid</div>
            <h1>Verify Your Account</h1>
          </div>
          
          <p>Hi ${firstName},</p>
          
          <p>Welcome to Henvid! To complete your registration, please verify your email address by entering the verification code below:</p>
          
          <div class="verification-box">
            <p><strong>Your verification code is:</strong></p>
            <div class="verification-code">${verificationCode}</div>
            <p><small>This code will expire in 15 minutes</small></p>
          </div>
          
          <p>Enter this code on the verification page to activate your account and start using Henvid.</p>
          
          <p>If you didn't create an account with Henvid, you can safely ignore this email.</p>
          
          <div class="footer">
            <p>Best regards,<br>The Henvid Team</p>
            <p><small>This is an automated email, please do not reply.</small></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Hi ${firstName},
      
      Welcome to Henvid! To complete your registration, please verify your email address.
      
      Your verification code is: ${verificationCode}
      
      This code will expire in 15 minutes.
      
      Enter this code on the verification page to activate your account.
      
      If you didn't create an account with Henvid, you can safely ignore this email.
      
      Best regards,
      The Henvid Team
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text
    });
  }

  static async sendPasswordResetEmail(
    email: string, 
    firstName: string, 
    resetToken: string
  ): Promise<boolean> {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    const subject = 'Reset your Henvid password';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #e11d48; }
          .button { 
            display: inline-block; 
            background: #e11d48; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0;
            text-align: center;
          }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Henvid</div>
            <h1>Reset Your Password</h1>
          </div>
          
          <p>Hi ${firstName},</p>
          
          <p>We received a request to reset your password for your Henvid account.</p>
          
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          
          <p>This link will expire in 1 hour for security reasons.</p>
          
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          
          <div class="footer">
            <p>Best regards,<br>The Henvid Team</p>
            <p><small>This is an automated email, please do not reply.</small></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Hi ${firstName},
      
      We received a request to reset your password for your Henvid account.
      
      Please click the following link to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request a password reset, you can safely ignore this email.
      
      Best regards,
      The Henvid Team
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text
    });
  }
}

// Utility function to generate verification code
export function generateVerificationCode(): string {
  return Math.random().toString().slice(2, 8);
} 