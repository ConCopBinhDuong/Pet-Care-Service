# Gmail Email Integration Setup Guide

## 📧 Real Gmail Email Sending Implementation Complete!

The Pet Care Service backend now supports **real Gmail email sending** instead of just console logging. Here's how to set it up and test it.

## 🚀 **What's New**

### **Email Service Updates**
- ✅ **Gmail SMTP Support**: Direct integration with Gmail using App Passwords
- ✅ **Fallback Support**: Still supports other SMTP providers and development mode
- ✅ **Smart Detection**: Automatically detects Gmail credentials and switches to real email sending
- ✅ **Enhanced Logging**: Better feedback for email sending status
- ✅ **Connection Testing**: Built-in method to test email connectivity

### **Priority Order**
1. **Gmail SMTP** (if `GMAIL_EMAIL` and `GMAIL_APP_PASSWORD` are set)
2. **Production SMTP** (if `NODE_ENV=production` and SMTP credentials are set)
3. **Development Mode** (console logging only)

## 🔧 **Setup Instructions**

### **Step 1: Enable Gmail App Passwords**

1. **Go to your Google Account settings**: https://myaccount.google.com/
2. **Security** → **2-Step Verification** (must be enabled first)
3. **App passwords** → **Generate new app password**
4. **Select app**: "Mail" or "Custom name" (e.g., "Pet Care Service")
5. **Copy the 16-digit password** (it will look like: `abcd efgh ijkl mnop`)

### **Step 2: Update .env File**

Open `/Users/thanh_X.X/Documents/Pet_care_service_backend/.env` and uncomment/configure:

```bash
# Uncomment and replace with your actual Gmail credentials:
GMAIL_EMAIL=your.email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

**⚠️ Important**: 
- Use your actual Gmail address for `GMAIL_EMAIL`
- Use the 16-digit app password (no spaces) for `GMAIL_APP_PASSWORD`
- Never commit real credentials to version control

### **Step 3: Test the Integration**

Choose one of these testing methods:

#### **Option A: Quick Test (Recommended)**
```bash
cd /Users/thanh_X.X/Documents/Pet_care_service_backend
node -e "
import emailService from './src/services/emailService.js';
await emailService.testConnection();
await emailService.sendEmailVerification('your.test@email.com', '123456', 'Test User');
"
```

#### **Option B: Full Server Test**
1. Start the server: `npm run dev`
2. Use the registration API to trigger verification emails
3. Check both console logs and your email inbox

## 📋 **Email Types Supported**

The system sends **3 types of emails**:

### **1. Email Verification**
- **Trigger**: User registration
- **Subject**: "Verify Your Email Address - Pet Care Service"
- **Contains**: 6-digit verification code
- **Expires**: 1 minute

### **2. Welcome Email**
- **Trigger**: Successful account creation
- **Subject**: "Welcome to Pet Care Service! 🐾"
- **Contains**: Welcome message with role-specific content

### **3. Password Reset**
- **Trigger**: Forgot password request
- **Subject**: "Password Reset Request - Pet Care Service"
- **Contains**: 6-digit reset code
- **Expires**: 1 minute

## 🔍 **How to Test Real Email Sending**

### **Method 1: Registration Flow Test**
```bash
# Start the server
npm run dev

# Use this REST request (replace with your email):
POST https://localhost:8443/api/auth/start-verification
Content-Type: application/json

{
    "username": "Test User",
    "email": "your.real.email@gmail.com",
    "password": "TestPass123",
    "gender": "Male",
    "role": "Pet owner"
}
```

### **Method 2: Connection Test**
```bash
# Test email connection
node -e "
import emailService from './src/services/emailService.js';
const result = await emailService.testConnection();
console.log('Connection test result:', result);
"
```

## 📊 **Console Output Examples**

### **Gmail Configured (Real Emails)**
```
📧 Configuring Gmail SMTP for email sending...
✅ Gmail SMTP connection verified
✅ Email verification sent: 1AB2C3D4E5F6G7H8
```

### **Development Mode (Console Only)**
```
📧 Using development mode - emails will be logged to console
📧 Development mode - no real email connection to test

📧 Email Verification Code (Development Mode)
===============================================
To: test@example.com
From: your.email@gmail.com
Subject: Verify Your Email Address - Pet Care Service
Verification Code: 123456
===============================================
```

## 🚨 **Troubleshooting**

### **Common Issues & Solutions**

#### **"Invalid credentials" Error**
- ✅ Make sure 2-Step Verification is enabled on your Google account
- ✅ Generate a new App Password specifically for this application
- ✅ Use the 16-digit App Password, not your regular Gmail password
- ✅ Remove any spaces from the App Password

#### **"Connection timeout" Error**
- ✅ Check your internet connection
- ✅ Verify firewall settings aren't blocking SMTP (port 587)
- ✅ Try using a different network (some corporate networks block SMTP)

#### **Emails not arriving**
- ✅ Check spam/junk folder
- ✅ Verify the recipient email address is correct
- ✅ Check if Gmail has any sending limits enabled
- ✅ Look at the console logs for error messages

#### **"App Password not working"**
- ✅ Regenerate the App Password
- ✅ Make sure you're using the email account that generated the App Password
- ✅ Copy the App Password exactly (no extra characters)

## 🔒 **Security Best Practices**

1. **Never commit credentials**: Keep `.env` in `.gitignore`
2. **Use App Passwords**: Never use your main Gmail password
3. **Rotate passwords**: Generate new App Passwords periodically
4. **Monitor usage**: Check Google Account activity for unusual email sending
5. **Limit scope**: Only use App Passwords for necessary applications

## 🧪 **Testing Commands**

### **Test Email Service Only**
```bash
cd /Users/thanh_X.X/Documents/Pet_care_service_backend
node test_gmail_integration.js
```

### **Test Full Registration Flow**
```bash
# Start server
npm run dev

# Test registration (in another terminal)
curl -k -X POST https://localhost:8443/api/auth/start-verification \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Test User",
    "email": "your.email@gmail.com",
    "password": "TestPass123",
    "gender": "Male",
    "role": "Pet owner"
  }'
```

## 📈 **Benefits of Real Email Integration**

✅ **Professional appearance**: Real emails from your Gmail account
✅ **Better deliverability**: Gmail's reputation ensures emails reach inbox
✅ **User trust**: Users receive actual verification emails
✅ **Production ready**: Seamless transition from development to production
✅ **Cost effective**: Free for reasonable usage volumes
✅ **Easy setup**: No complex SMTP configuration required

## 🔄 **Next Steps**

1. **Set up Gmail App Password** following Step 1 above
2. **Configure .env file** with your credentials
3. **Test the integration** using the methods above
4. **Deploy to production** with environment-specific credentials

## 📞 **Support**

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify your Gmail App Password setup
3. Test with a simple email first
4. Check server logs for detailed error messages

---

**🎉 The email integration is now ready for production use!**
