# Brevo API Configuration Guide

## ✅ Changes Completed

I've successfully updated the email service to use **Brevo API** (instead of SMTP) in the following files:

1. **backend/services/emailService.js** - Replaced Nodemailer with Brevo API SDK
2. **backend/scripts/setupEnv.js** - Updated default .env template
3. **README.md** - All documentation references (5 locations)
4. **package.json** - Added @getbrevo/brevo dependency

## 📝 Manual Steps Required

### 1. Update your `backend/.env` file

Replace the old SMTP configuration with Brevo API credentials:

#### ❌ Remove (Old SMTP Configuration):
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### ✅ Add (New Brevo API Configuration):
```env
# Brevo Email Service
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=your_verified_sender_email@domain.com
BREVO_SENDER_NAME=Schedulo
```

### 2. Get Your Brevo API Credentials

#### Step 1: Sign up for Brevo
- Go to: https://www.brevo.com
- Create a free account (300 emails/day free tier)
- Verify your email address

#### Step 2: Get Your API Key
1. Log in to your Brevo account
2. Go to: **Settings** → **SMTP & API**
3. Click on **API Keys** tab
4. Click **Generate a new API key**
5. Give it a name (e.g., "Schedulo Production")
6. Copy the API key (it starts with `xkeysib-...`)
7. **Important**: Save this key securely - you won't be able to see it again!

#### Step 3: Verify Your Sender Email
1. In Brevo dashboard, go to: **Settings** → **Senders & IP**
2. Click **Add a sender**
3. Enter your email address (e.g., `noreply@yourdomain.com` or your Gmail)
4. Brevo will send a verification email
5. Click the verification link in the email
6. Wait for approval (usually instant for Gmail, may take time for custom domains)

#### Step 4: Update .env File
```env
BREVO_API_KEY=xkeysib-1234567890abcdef...  # Your actual API key
BREVO_SENDER_EMAIL=noreply@yourdomain.com   # Your verified email
BREVO_SENDER_NAME=Vignan University         # Display name for emails
```

### 3. Restart Backend Server
```bash
cd backend
npm run dev
```

You should see:
```
✅ Brevo Email Service initialized successfully
```

### 4. Test Email Configuration

```bash
cd backend
node scripts/testEmail.js your_email@example.com
```

Replace `your_email@example.com` with your actual email address.

## 🎯 Why Brevo API Instead of SMTP?

| Feature | SMTP | Brevo API |
|---------|------|-----------|
| **Setup Complexity** | Medium | Simple |
| **Speed** | Slower | Faster |
| **Reliability** | Can timeout | More reliable |
| **Error Handling** | Basic | Detailed |
| **Tracking** | Limited | Full analytics |
| **Deliverability** | Good | Excellent |
| **Rate Limits** | Port-based | API-based (better) |
| **Webhooks** | No | Yes (future feature) |

## 📊 Brevo Free Tier Benefits

- ✅ **300 emails/day** (9,000/month)
- ✅ **Unlimited contacts**
- ✅ **Email templates**
- ✅ **Real-time statistics**
- ✅ **Email tracking** (opens, clicks)
- ✅ **Transactional emails**
- ✅ **API access**
- ✅ **SMTP access** (if needed)

## 🔧 Configuration Variables Explained

### BREVO_API_KEY
- **What**: Your Brevo API key (v3)
- **Format**: `xkeysib-...` (long alphanumeric string)
- **Where to get**: Brevo Dashboard → SMTP & API → API Keys
- **Security**: Keep this secret! Don't commit to Git

### BREVO_SENDER_EMAIL
- **What**: The email address that will appear as the sender
- **Format**: Valid email address
- **Requirements**: Must be verified in Brevo dashboard
- **Examples**: 
  - `noreply@vignan.edu`
  - `examcell@vignan.edu`
  - `your-gmail@gmail.com` (for testing)

### BREVO_SENDER_NAME
- **What**: Display name shown to email recipients
- **Format**: Any string (max 255 characters)
- **Examples**:
  - `Vignan University`
  - `Schedulo - Exam Cell`
  - `Exam Invigilation System`

## ⚠️ Important Notes

### 1. Sender Email Verification
- **Gmail**: Usually verified instantly
- **Custom Domain**: May require DNS configuration (SPF, DKIM)
- **Corporate Email**: Check with IT department first

### 2. Daily Limits
- **Free Tier**: 300 emails/day
- **Paid Plans**: Start at $25/month for 20,000 emails/month
- **Enterprise**: Unlimited emails with custom pricing

### 3. Email Deliverability
To improve deliverability:
1. Use a verified sender email
2. Set up SPF and DKIM records (for custom domains)
3. Avoid spam trigger words in subject lines
4. Keep email content professional
5. Monitor bounce rates in Brevo dashboard

## 🔍 Troubleshooting

### Error: "Invalid API key"
- **Cause**: Wrong API key or not set
- **Fix**: Double-check `BREVO_API_KEY` in .env file
- **Verify**: Make sure you copied the entire key (starts with `xkeysib-`)

### Error: "Sender email not verified"
- **Cause**: Email address not verified in Brevo
- **Fix**: Go to Brevo → Senders & IP → Verify your email
- **Note**: Check spam folder for verification email

### Error: "Daily limit exceeded"
- **Cause**: Sent more than 300 emails today (free tier)
- **Fix**: Wait until tomorrow or upgrade plan
- **Monitor**: Check Brevo dashboard for usage stats

### Emails Going to Spam
- **Cause**: Various factors (new sender, content, etc.)
- **Fix**: 
  1. Verify sender email
  2. Set up SPF/DKIM records
  3. Ask recipients to mark as "Not Spam"
  4. Warm up your sender reputation gradually

### No Error But Email Not Received
1. **Check Brevo Logs**:
   - Go to: Brevo Dashboard → Statistics → Logs
   - Look for your email
   - Check delivery status

2. **Check Recipient Email**:
   - Spam folder
   - Promotions tab (Gmail)
   - Email filters/rules

3. **Verify Sender Email**:
   - Make sure it's verified in Brevo
   - Check for typos in BREVO_SENDER_EMAIL

## 📞 Support & Resources

- **Brevo Documentation**: https://developers.brevo.com/docs
- **API Reference**: https://developers.brevo.com/reference
- **Brevo Support**: https://help.brevo.com/
- **Status Page**: https://status.brevo.com/

## 🚀 Next Steps

1. ✅ Get Brevo API key
2. ✅ Verify sender email
3. ✅ Update .env file
4. ✅ Restart backend server
5. ✅ Test email sending
6. ✅ Monitor Brevo dashboard for analytics

## 💡 Pro Tips

1. **Use Environment-Specific Senders**:
   - Development: `dev-noreply@yourdomain.com`
   - Production: `noreply@yourdomain.com`

2. **Monitor Email Analytics**:
   - Track open rates
   - Monitor bounce rates
   - Check click-through rates

3. **Set Up Webhooks** (Future Enhancement):
   - Get real-time delivery notifications
   - Track email events
   - Update database automatically

4. **Use Email Templates** (Future Enhancement):
   - Create templates in Brevo dashboard
   - Reuse templates via API
   - A/B test different designs

## 🔐 Security Best Practices

1. **Never commit API keys to Git**
   - Use .env file (already in .gitignore)
   - Use environment variables in production

2. **Rotate API keys periodically**
   - Generate new key every 6 months
   - Delete old keys after rotation

3. **Use different keys for different environments**
   - Development key
   - Staging key
   - Production key

4. **Monitor API usage**
   - Check for unusual activity
   - Set up alerts in Brevo dashboard
