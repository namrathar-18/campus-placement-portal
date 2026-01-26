# 📧 Email Setup Guide for Password Reset Feature

## Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/security
2. Under "Signing in to Google", select "2-Step Verification"
3. Follow the steps to enable it if not already enabled

### Step 2: Generate App Password
1. Visit: https://myaccount.google.com/apppasswords
2. Select "Mail" as the app and your device
3. Click "Generate"
4. Copy the 16-character password (it will look like: `xxxx xxxx xxxx xxxx`)

### Step 3: Update .env File
1. Open `server/.env`
2. Replace the values:
   ```
   EMAIL_USER=your-actual-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```
   **Important:** Remove spaces from the app password!

### Step 4: Restart Server
After updating `.env`, restart your backend server:
```bash
cd server
npm run dev
```

## Testing

1. Click "Forgot Password?" on the login page
2. Enter your registered email
3. Check your inbox for an email with the 6-digit code
4. Enter the code and reset your password

## Development Mode

If you don't configure email credentials:
- The system will still work
- Reset codes will be shown in the toast notification
- Codes will also be logged in the server console

## Alternative Email Services

### Using Outlook/Hotmail
Update `server/config/email.js`:
```javascript
service: 'hotmail',
```

### Using Custom SMTP
Replace the service with host/port:
```javascript
host: 'smtp.your-provider.com',
port: 587,
secure: false,
```

## Troubleshooting

**Error: "Invalid login"**
- Make sure you're using an App Password, not your regular Gmail password
- Verify 2FA is enabled on your Google account

**Emails not arriving**
- Check spam/junk folder
- Verify EMAIL_USER is correct
- Ensure no spaces in EMAIL_PASSWORD

**Still having issues?**
- Check server console for error messages
- The reset code will be displayed in development mode as a fallback
