# CA-Signed SSL Certificate Setup Guide

## 🔐 Overview

Your Pet Care Service now **requires CA-signed SSL certificates** from trusted Certificate Authorities. Self-signed certificates are no longer accepted for enhanced security.

## 🏆 Recommended Certificate Authorities

### **Free Options**
1. **Let's Encrypt** (Recommended) - https://letsencrypt.org/
   - Free, automated, and widely trusted
   - 90-day certificates with auto-renewal
   - Perfect for most applications

### **Paid Options**
2. **DigiCert** - https://www.digicert.com/
   - Premium certificates with extended validation
   - Excellent for enterprise applications

3. **GlobalSign** - https://www.globalsign.com/
   - International coverage and recognition
   - Various validation levels available

4. **Sectigo (formerly Comodo)** - https://sectigo.com/
   - Cost-effective with good browser support
   - Multiple certificate types

5. **GoDaddy** - https://www.godaddy.com/
   - Popular choice with easy management interface

## 🚀 Quick Setup with Let's Encrypt (Recommended)

### **Prerequisites**
- Domain name pointing to your server
- Root/sudo access to the server
- Port 80 available (for verification)

### **Installation Steps**

#### **1. Install Certbot**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install certbot

# CentOS/RHEL
sudo yum install certbot

# macOS (for development/testing)
brew install certbot
```

#### **2. Obtain Certificate (Standalone Method)**
```bash
# Replace 'yourdomain.com' with your actual domain
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# For multiple domains
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

#### **3. Set Environment Variables**
```bash
# Add to your .env file or environment
export SSL_KEY_PATH="/etc/letsencrypt/live/yourdomain.com/privkey.pem"
export SSL_CERT_PATH="/etc/letsencrypt/live/yourdomain.com/fullchain.pem"
export SSL_CA_PATH="/etc/letsencrypt/live/yourdomain.com/chain.pem"
```

#### **4. Set Up Auto-Renewal**
```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab for automatic renewal
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🌐 Alternative Setup with Webroot (If you have existing web server)

```bash
# If you have a web server already running
sudo certbot certonly --webroot -w /var/www/html -d yourdomain.com -d www.yourdomain.com
```

## 🏢 Production Environment Variables

Create a `.env` file or set system environment variables:

```bash
# Required
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem

# Optional but recommended
SSL_CA_PATH=/etc/letsencrypt/live/yourdomain.com/chain.pem

# Server configuration
NODE_ENV=production
HTTPS_PORT=443
PORT=80
```

## 🔧 Manual Certificate Installation (Paid CAs)

### **1. Generate Private Key**
```bash
openssl genrsa -out private.key 2048
```

### **2. Generate Certificate Signing Request (CSR)**
```bash
openssl req -new -key private.key -out certificate.csr
```

### **3. Submit CSR to your chosen CA**
- Upload the CSR to your CA's website
- Complete domain validation
- Download the issued certificate and CA bundle

### **4. Set Environment Variables**
```bash
export SSL_KEY_PATH="/path/to/your/private.key"
export SSL_CERT_PATH="/path/to/your/certificate.crt"
export SSL_CA_PATH="/path/to/your/ca-bundle.crt"
```

## 🧪 Testing Your Setup

### **1. Start the server**
```bash
node src/server.js
```

### **2. Test HTTPS connection**
```bash
# Test with curl
curl -v https://yourdomain.com/health

# Check certificate details
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### **3. Online SSL Testing**
- SSL Labs Test: https://www.ssllabs.com/ssltest/
- SSL Checker: https://www.sslshopper.com/ssl-checker.html

## 🛡️ Security Features Enabled

With CA-signed certificates, your server now provides:

- ✅ **Trusted Encryption**: Browsers won't show security warnings
- ✅ **Enhanced Validation**: Certificate authority verification
- ✅ **Automatic Rejection**: Unauthorized certificates blocked
- ✅ **Professional Appearance**: Green lock icon in browsers
- ✅ **SEO Benefits**: Search engines prefer HTTPS sites

## 🚨 Common Issues and Solutions

### **Issue: Certificate not found**
```bash
# Check file permissions
ls -la /etc/letsencrypt/live/yourdomain.com/
sudo chmod 644 /etc/letsencrypt/live/yourdomain.com/*.pem
```

### **Issue: Domain validation failed**
- Ensure your domain points to the server IP
- Check that port 80 is open and available
- Verify DNS propagation: `nslookup yourdomain.com`

### **Issue: Permission denied**
- Run certbot with sudo
- Ensure proper file ownership and permissions

## 📅 Certificate Maintenance

### **Monitoring Certificate Expiration**
```bash
# Check expiration date
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout | grep "Not After"

# Set up monitoring alerts (recommended)
# Use services like UptimeRobot or create custom monitoring
```

### **Renewal Process**
```bash
# Manual renewal (Let's Encrypt)
sudo certbot renew

# Check renewal status
sudo certbot certificates

# Test renewal without actually renewing
sudo certbot renew --dry-run
```

## 🎯 Next Steps

1. **Obtain your CA-signed certificate** using one of the methods above
2. **Set the environment variables** for your certificate paths
3. **Restart your server** to load the new certificates
4. **Test the HTTPS connection** to ensure everything works
5. **Set up monitoring** for certificate expiration
6. **Configure auto-renewal** to avoid service interruption

## 📞 Support

- **Let's Encrypt**: https://letsencrypt.org/docs/
- **Certbot**: https://certbot.eff.org/instructions/
- **SSL/TLS Best Practices**: https://ssl-config.mozilla.org/

---

**Status**: 🔐 **CA-SIGNED CERTIFICATES REQUIRED**  
**Security Level**: 🛡️ **ENTERPRISE GRADE**  
**Browser Compatibility**: ✅ **FULL SUPPORT**  
**Ready for**: 🚀 **PRODUCTION DEPLOYMENT**
