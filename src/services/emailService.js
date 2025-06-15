import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

class EmailService {
    constructor() {
        // Configure SendGrid or fallback to development mode
        this.initializeSendGrid();
    }

    initializeSendGrid() {
        // Check if SendGrid API key is provided
        if (process.env.SENDGRID_API_KEY) {
            console.log('📧 Configuring SendGrid for email sending...');
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            this.emailService = 'sendgrid';
        } 
        // Development mode - log emails to console
        else {
            console.log('📧 Using development mode - emails will be logged to console');
            this.emailService = 'development';
        }
    }

    generateVerificationCode() {
        // Generate a 6-digit verification code
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendEmailVerification(email, code, userName) {
        const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@petcare.com';
        const mailOptions = {
            from: fromEmail,
            to: email,
            subject: 'Verify Your Email Address - Pet Care Service',
            html: this.getEmailVerificationTemplate(code, userName)
        };

        try {
            // If SendGrid is configured, send real email
            if (this.emailService === 'sendgrid') {
                const result = await sgMail.send(mailOptions);
                console.log('✅ Email verification sent via SendGrid:', result[0].statusCode);
                return { success: true, messageId: result[0].headers['x-message-id'] || 'sendgrid-success' };
            } else {
                // Development mode - log to console
                console.log('\n📧 Email Verification Code (Development Mode)');
                console.log('===============================================');
                console.log(`To: ${email}`);
                console.log(`From: ${fromEmail}`);
                console.log(`Subject: ${mailOptions.subject}`);
                console.log(`Verification Code: ${code}`);
                console.log('===============================================\n');
                return { success: true, messageId: 'dev-mode-email' };
            }
        } catch (error) {
            console.error('❌ Email sending failed:', error);
            return { success: false, error: error.message };
        }
    }

    getEmailVerificationTemplate(code, userName) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Email Verification</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .code { font-size: 24px; font-weight: bold; color: #4CAF50; background: #e8f5e8; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px; }
                .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
                .warning { color: #ff6b6b; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🐾 Pet Care Service</h1>
                    <h2>Email Verification Required</h2>
                </div>
                <div class="content">
                    <h3>Hello ${userName}!</h3>
                    <p>Thank you for registering with Pet Care Service. To complete your registration, please verify your email address.</p>
                    
                    <p>Your verification code is:</p>
                    <div class="code">${code}</div>
                    
                    <p>Please enter this code in the verification form to activate your account.</p>
                    
                    <p class="warning">⚠️ This code will expire in 1 minute for security reasons.</p>
                    
                    <p>If you didn't request this verification, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>© 2025 Pet Care Service. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    async sendWelcomeEmail(email, userName, userRole) {
        const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@petcare.com';
        const mailOptions = {
            from: fromEmail,
            to: email,
            subject: 'Welcome to Pet Care Service! 🐾',
            html: this.getWelcomeEmailTemplate(userName, userRole)
        };

        try {
            // If SendGrid is configured, send real email
            if (this.emailService === 'sendgrid') {
                const result = await sgMail.send(mailOptions);
                console.log('✅ Welcome email sent via SendGrid:', result[0].statusCode);
                return { success: true, messageId: result[0].headers['x-message-id'] || 'sendgrid-success' };
            } else {
                console.log('\n🎉 Welcome Email (Development Mode)');
                console.log('===================================');
                console.log(`To: ${email}`);
                console.log(`From: ${fromEmail}`);
                console.log(`Subject: ${mailOptions.subject}`);
                console.log(`User: ${userName} (${userRole})`);
                console.log('===================================\n');
                return { success: true, messageId: 'dev-mode-welcome' };
            }
        } catch (error) {
            console.error('❌ Welcome email sending failed:', error);
            return { success: false, error: error.message };
        }
    }

    getWelcomeEmailTemplate(userName, userRole) {
        const roleSpecificContent = userRole === 'Pet owner' 
            ? 'You can now register your pets, book services, and manage your pet care schedule.'
            : 'You can now set up your services, manage bookings, and connect with pet owners.';

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Welcome to Pet Care Service</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .features { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
                .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🐾 Welcome to Pet Care Service!</h1>
                </div>
                <div class="content">
                    <h3>Hello ${userName}!</h3>
                    <p>Welcome to Pet Care Service! Your account has been successfully verified and activated.</p>
                    
                    <p><strong>Account Type:</strong> ${userRole}</p>
                    
                    <div class="features">
                        <h4>🎯 What you can do now:</h4>
                        <p>${roleSpecificContent}</p>
                        
                        <ul>
                            ${userRole === 'Pet owner' ? `
                                <li>Register and manage your pets</li>
                                <li>Browse and book services</li>
                                <li>Track your bookings</li>
                                <li>Manage pet schedules and activities</li>
                            ` : `
                                <li>Set up your business profile</li>
                                <li>Add your services and pricing</li>
                                <li>Manage customer bookings</li>
                                <li>Communicate with pet owners</li>
                            `}
                        </ul>
                    </div>
                    
                    <p>Thank you for choosing Pet Care Service. We're excited to help you on your pet care journey!</p>
                </div>
                <div class="footer">
                    <p>© 2025 Pet Care Service. All rights reserved.</p>
                    <p>Need help? Contact our support team anytime!</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    async sendPasswordResetVerification(email, code, userName) {
        const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@petcare.com';
        const mailOptions = {
            from: fromEmail,
            to: email,
            subject: 'Password Reset Request - Pet Care Service',
            html: this.getPasswordResetTemplate(code, userName)
        };

        try {
            // If SendGrid is configured, send real email
            if (this.emailService === 'sendgrid') {
                const result = await sgMail.send(mailOptions);
                console.log('✅ Password reset email sent via SendGrid:', result[0].statusCode);
                return { success: true, messageId: result[0].headers['x-message-id'] || 'sendgrid-success' };
            } else {
                // Development mode - log to console
                console.log('\n🔐 Password Reset Verification Code (Development Mode)');
                console.log('=====================================================');
                console.log(`To: ${email}`);
                console.log(`From: ${fromEmail}`);
                console.log(`Subject: ${mailOptions.subject}`);
                console.log(`User: ${userName}`);
                console.log(`Verification Code: ${code}`);
                console.log('=====================================================\n');
                return { success: true, messageId: 'dev-mode-password-reset' };
            }
        } catch (error) {
            console.error('❌ Password reset email sending failed:', error);
            return { success: false, error: error.message };
        }
    }

    getPasswordResetTemplate(code, userName) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Password Reset Request - Pet Care Service</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #ff6b35; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .code-box { 
                    background: white; 
                    padding: 20px; 
                    margin: 20px 0; 
                    border-radius: 5px; 
                    text-align: center;
                    border: 2px solid #ff6b35;
                }
                .code { 
                    font-size: 32px; 
                    font-weight: bold; 
                    color: #ff6b35; 
                    letter-spacing: 5px;
                    font-family: 'Courier New', monospace;
                }
                .warning { 
                    background: #fff3cd; 
                    border: 1px solid #ffeaa7; 
                    padding: 15px; 
                    margin: 20px 0; 
                    border-radius: 5px;
                    color: #856404;
                }
                .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Password Reset Request</h1>
                </div>
                <div class="content">
                    <h3>Hello ${userName}!</h3>
                    <p>We received a request to reset your password for your Pet Care Service account.</p>
                    
                    <div class="code-box">
                        <p><strong>Your verification code is:</strong></p>
                        <div class="code">${code}</div>
                        <p style="margin-top: 15px; color: #666;">This code expires in <strong>1 minute</strong></p>
                    </div>
                    
                    <div class="warning">
                        <h4>⚠️ Security Notice:</h4>
                        <ul style="margin: 10px 0;">
                            <li>This code is valid for only <strong>1 minute</strong></li>
                            <li>You have <strong>3 attempts</strong> to enter the code correctly</li>
                            <li>If you didn't request this reset, please ignore this email</li>
                            <li>Never share this code with anyone</li>
                        </ul>
                    </div>
                    
                    <p>Enter this code in the password reset form to verify your identity and set a new password.</p>
                    
                    <p><strong>What happens next?</strong></p>
                    <ol>
                        <li>Enter the verification code above</li>
                        <li>Create a new secure password</li>
                        <li>Log in with your new password</li>
                    </ol>
                </div>
                <div class="footer">
                    <p>© 2025 Pet Care Service. All rights reserved.</p>
                    <p>If you didn't request this password reset, please contact our support team immediately.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Test SendGrid connection (useful for debugging)
     */
    async testConnection() {
        try {
            if (this.emailService === 'sendgrid') {
                // SendGrid doesn't have a direct connection test, so we'll just verify API key is set
                console.log('✅ SendGrid API key is configured');
                return { success: true, message: 'SendGrid API key configured successfully' };
            } else {
                console.log('📧 Development mode - no real email connection to test');
                return { success: true, message: 'Development mode - console logging enabled' };
            }
        } catch (error) {
            console.error('❌ SendGrid connection test failed:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new EmailService();
