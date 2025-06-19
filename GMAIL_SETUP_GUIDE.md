# Gmail SMTP Integration Setup Guide

## Overview
This guide explains how to configure Gmail SMTP for real email sending in the Pet Care Service backend.

## ✅ Current Configuration
Your Pet Care Service is now configured to use Gmail SMTP with the following credentials:
- **Gmail Account**: `10422110@student.vgu.edu.vn`
- **App Password**: `fyxs tgbl uvoq hkys`

## 📧 Email Features
The system can now send real emails for:
1. **Email Verification Codes** - 6-digit OTP codes during registration
2. **Welcome Emails** - Sent after successful email verification
3. **Password Reset Codes** - 6-digit OTP codes for password reset

## 🔧 Configuration Files

### 1. Environment Variables (.env)
```properties
# Gmail SMTP Configuration for Real Email Sending
GMAIL_EMAIL=10422110@student.vgu.edu.vn
GMAIL_APP_PASSWORD=fyxs tgbl uvoq hkys
```

### 2. Email Service (src/services/emailService.js)
- Uses `nodemailer` with Gmail SMTP
- Automatically detects Gmail credentials
- Falls back to development mode if credentials are missing

## 🧪 Testing

### Option 1: Direct Script Test
```bash
node test_gmail_integration.js
```

### Option 2: REST API Tests
Use the `test_gmail_email_api.rest` file with REST Client extension:
- Test connection
- Send verification emails
- Send welcome emails
- Send password reset emails

### Option 3: Full Registration Flow
1. Start the server: `npm run dev`
2. Register a new user with your email
3. Check your Gmail inbox for verification code
4. Verify the email to receive welcome email

## 📱 Email Templates

### Verification Email
- **Subject**: "Verify Your Email Address - Pet Care Service"
- **Content**: 6-digit verification code
- **Expiry**: 1 minute
- **Template**: Modern HTML with Pet Care branding

### Welcome Email
- **Subject**: "Welcome to Pet Care Service! 🐾"
- **Content**: Role-specific welcome message
- **Features**: Account type confirmation, next steps

### Password Reset
- **Subject**: "Password Reset Request - Pet Care Service"
- **Content**: 6-digit reset code with security warnings
- **Expiry**: 1 minute
- **Security**: 3 attempts limit

## 🔒 Security Features

1. **App Password Authentication** - Uses Gmail app passwords instead of account password
2. **TLS Encryption** - All emails sent over secure connection
3. **Rate Limiting** - Built-in protection against spam
4. **Code Expiry** - All verification codes expire in 1 minute
5. **Attempt Limiting** - Maximum 3 attempts for code verification

## 🚀 Production Considerations

### For Production Deployment:
1. **Use Environment Variables** - Store credentials securely
2. **Monitor Sending Limits** - Gmail has daily sending limits
3. **Error Handling** - Implement retry logic for failed sends
4. **Logging** - Monitor email sending success/failure rates

### Gmail Sending Limits:
- **Free Gmail**: 500 emails per day
- **Google Workspace**: 2000 emails per day
- **Recommendation**: Monitor usage and implement queuing if needed

## 🔍 Troubleshooting

### Common Issues:

#### 1. Authentication Error (EAUTH)
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solutions:**
- Verify app password is correct (no spaces)
- Ensure 2-Factor Authentication is enabled
- Generate new app password from Google Account settings

#### 2. Connection Error (ECONNECTION)
```
Error: Connection timeout
```
**Solutions:**
- Check internet connection
- Verify firewall settings
- Try again after a few minutes

#### 3. Rate Limiting
```
Error: 550 5.1.1 Daily sending quota exceeded
```
**Solutions:**
- Wait 24 hours for quota reset
- Consider using Google Workspace for higher limits
- Implement email queuing system

## 📊 Monitoring

### Server Logs
The system logs all email operations:
```
✅ Email verification sent via Gmail: <message-id>
✅ Welcome email sent via Gmail: <message-id>
✅ Password reset email sent via Gmail: <message-id>
```

### Development Mode
If Gmail credentials are not configured, the system falls back to console logging:
```
📧 Using development mode - emails will be logged to console
```

## 🔄 Switching Back to SendGrid (if needed)

To switch back to SendGrid:
1. Comment out Gmail credentials in `.env`
2. Uncomment SendGrid credentials
3. Update `emailService.js` to use SendGrid again

## ✨ Next Steps

1. **Test Email Sending**: Run the test scripts to verify functionality
2. **Monitor Performance**: Check email delivery rates
3. **User Feedback**: Ensure users receive emails promptly
4. **Scale Planning**: Consider email volume for production

Your Pet Care Service is now ready to send real emails via Gmail SMTP! 🎉
