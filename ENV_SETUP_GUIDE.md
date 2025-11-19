# Environment Variables Setup Guide

This guide explains how to securely manage environment variables for PeerIQ without committing them to the repository.

## Overview

Environment variables contain sensitive information like Firebase credentials. They should **NEVER** be pushed to Git.

## Local Development Setup

### 1. Create a `.env.local` file

In the project root directory, create a `.env.local` file:

```bash
# Copy .env.example to .env.local
cp .env.example .env.local
```

Then fill in your Firebase credentials:

```
REACT_APP_FIREBASE_API_KEY=your_actual_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_actual_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
REACT_APP_FIREBASE_APP_ID=your_actual_app_id
```

### 2. Get Your Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your PeerIQ project
3. Click **Project Settings** (gear icon)
4. Copy the configuration under "Your apps" section
5. Paste the values into `.env.local`

### 3. Start Development Server

```bash
npm start
```

The app will automatically read variables from `.env.local`.

## Vercel Deployment Setup

### Step 1: Add Environment Variables in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **PeerIQ** project
3. Click **Settings**
4. Navigate to **Environment Variables**
5. Add each variable:

| Key | Value |
|-----|-------|
| REACT_APP_FIREBASE_API_KEY | your_api_key |
| REACT_APP_FIREBASE_AUTH_DOMAIN | your_project.firebaseapp.com |
| REACT_APP_FIREBASE_PROJECT_ID | your_project_id |
| REACT_APP_FIREBASE_STORAGE_BUCKET | your_project.appspot.com |
| REACT_APP_FIREBASE_MESSAGING_SENDER_ID | your_sender_id |
| REACT_APP_FIREBASE_APP_ID | your_app_id |

6. For each variable, select the environments where it should be available:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### Step 2: Redeploy

After adding environment variables, redeploy your project:

```bash
git push  # This triggers automatic Vercel deployment
```

## File Structure

```
PeerIQ/
├── .env              ← LOCAL ONLY (not in git)
├── .env.local        ← LOCAL ONLY (not in git)
├── .env.example      ← In git (template for others)
├── .gitignore        ← Includes .env patterns
└── src/
    └── config/
        └── firebase.js   ← Reads env variables
```

## Git Configuration

Your `.gitignore` already excludes:

```
.env
.env.local
.env.*.local
.env.production
```

This prevents accidental commits of sensitive data.

## Security Best Practices

1. ✅ **Never commit `.env` files** - They contain secrets
2. ✅ **Use `.env.example`** - Shows what variables are needed
3. ✅ **Rotate credentials** - If you accidentally expose them, rotate immediately
4. ✅ **Use Vercel Environment Variables** - Securely manage production secrets
5. ✅ **Don't share credentials** - Only you should have your Firebase credentials

## Troubleshooting

### Variables not loading in development?

- Make sure file is named `.env.local` (not `.env`)
- Restart dev server: `npm start`
- Check that variables start with `REACT_APP_` prefix

### Variables not loading in Vercel?

- Verify variables are added in Vercel Settings > Environment Variables
- Ensure they're enabled for the correct environment (Production/Preview)
- Redeploy after adding variables
- Check Vercel deployment logs for errors

### Firebase Authentication not working?

- Verify all 6 Firebase config variables are set
- Check Firebase Console for project ID mismatch
- Ensure Firebase Security Rules allow your app access

## Verifying Your Setup

To verify environment variables are loaded correctly, check browser console (it will NOT show actual values for security):

```javascript
// In browser console, you can check if Firebase is configured
// Go to any page and check if user authentication works
// If login/signup works, variables are loaded correctly
```

## Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/projects/environment-variables)
- [Firebase Project Settings](https://console.firebase.google.com/project/_/settings/general)
- [Create React App Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
