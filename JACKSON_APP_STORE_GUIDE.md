# Dish Drop — App Store Submission Guide for Jackson

**Last updated:** April 8, 2026  
**Status:** Ready for submission (4th attempt — all previous rejection issues fixed)

---

## Quick Summary

The app has been rejected 3 times. All code issues are now fixed:
- ✅ Auth guard (no auto-login) — fixes Guideline 2.1
- ✅ EULA, report, block, moderation — fixes Guideline 1.2
- ✅ Account deletion — fixes Guideline 5.1.1(v)
- ✅ Privacy manifest added — fixes new 2024+ requirement
- ✅ Export compliance flag set — skips the encryption questionnaire
- ✅ Privacy policy, terms, support pages live

**Your job:** Build the app, upload it, and fill in App Store Connect metadata.

---

## Prerequisites

You need:
1. **Xcode 16+** installed (from Mac App Store)
2. **Node.js 18+** installed (`node -v` to check)
3. **Apple Developer account** access (the one with the team)
4. **An Expo account** — create one free at https://expo.dev/signup

---

## Step 1: Clone & Setup (5 min)

```bash
git clone https://github.com/YOUR_REPO/dish-drop.git
cd dish-drop/mobile
npm install --legacy-peer-deps
```

Create the file `mobile/.env` if it doesn't exist:
```
EXPO_PUBLIC_API_URL=https://api-brown-eight.vercel.app/api
```

---

## Step 2: Install EAS CLI & Login (2 min)

```bash
npm install -g eas-cli
eas login
# Enter your Expo account credentials
```

---

## Step 3: Link to Expo Project (2 min)

```bash
cd mobile
eas init
# This will create a project on expo.dev and fill in the projectId in app.json
```

After this, open `mobile/app.json` and make sure these fields are filled:
- `"owner"` — your Expo username
- `"extra.eas.projectId"` — should be auto-filled by `eas init`

---

## Step 4: Register the Bundle ID (3 min)

Go to https://developer.apple.com/account/resources/identifiers/list

1. Click **"+"** to register a new identifier
2. Select **"App IDs"** → Continue
3. Select **"App"** → Continue
4. Description: `Dish Drop`
5. Bundle ID: **Explicit** → `com.dishdrop.app`
6. Capabilities: check **Push Notifications** (optional, for future use)
7. Click **Register**

---

## Step 5: Create the App in App Store Connect (5 min)

Go to https://appstoreconnect.apple.com/apps

1. Click **"+"** → **"New App"**
2. Fill in:
   - **Platform:** iOS
   - **Name:** `Dish Drop`
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** `com.dishdrop.app` (select from dropdown)
   - **SKU:** `dishdrop-ios-001`
   - **User Access:** Full Access
3. Click **Create**

---

## Step 6: Build with EAS (10 min wait)

```bash
cd mobile
eas build --platform ios --profile production
```

EAS will:
- Ask you to log in to your Apple Developer account
- Auto-generate provisioning profiles and certificates
- Build the app in the cloud (no local Xcode needed!)
- Give you a download link when done

**First time?** It will ask:
- "Would you like to log in to your Apple account?" → **Yes**
- "Generate a new Apple Distribution Certificate?" → **Yes**  
- "Generate a new Apple Provisioning Profile?" → **Yes**

Wait ~10-15 minutes for the build to complete.

---

## Step 7: Submit to App Store (2 min)

Once the build is done:

```bash
eas submit --platform ios --latest
```

This uploads the build directly to App Store Connect / TestFlight.

It will ask for your **Apple ID** and **App-specific password**:
- Go to https://appleid.apple.com/account/manage → **Sign-In and Security** → **App-Specific Passwords** → Generate one
- Use that password when prompted

---

## Step 8: Fill in App Store Connect Metadata (15 min)

Go to https://appstoreconnect.apple.com → Your app → **App Store** tab

### Version Information
| Field | Value |
|-------|-------|
| Version | `1.0.0` |
| What's New | `Initial release of Dish Drop — share dishes, discover restaurants, and donate meals!` |

### App Description
```
Dish Drop is a food social media app where every post can feed someone in need.

📸 Share photos and reviews of dishes you eat at restaurants
🗺️ Discover new restaurants near you with map and list views
🍽️ Donate meals to local food banks with every post
🏆 Earn coins, unlock achievements, and climb leaderboards
🎫 Redeem coins for restaurant coupons and deals
⚡ Join flash sponsorship campaigns where restaurants pledge meals
👥 Follow friends, like posts, and build collections

Join the DishDrop community and make every meal count!
```

### Keywords
```
food,restaurant,review,social,donate,meals,charity,dishes,foodie,discover
```

### URLs
| Field | URL |
|-------|-----|
| Privacy Policy URL | `https://legal-roan-one.vercel.app/privacy.html` |
| Support URL | `https://legal-roan-one.vercel.app/support.html` |

### Category
- **Primary:** Food & Drink
- **Secondary:** Social Networking

### Age Rating
Fill out the questionnaire. Key answers:
- **Unrestricted Web Access:** No
- **Gambling/Contests:** No
- **User-Generated Content:** **Yes** ← This will set it to 12+
- **Everything else:** No/None/Infrequent

### Screenshots
You need screenshots for:
- **6.7" iPhone** (iPhone 15 Pro Max) — 1290 × 2796 px — **REQUIRED**
- **6.5" iPhone** (iPhone 11 Pro Max) — 1242 × 2688 px — **REQUIRED**
- **iPad Pro 12.9"** — 2048 × 2732 px — Optional but recommended

**How to take screenshots:**
1. Run the app in Xcode Simulator (iPhone 15 Pro Max)
2. Press `Cmd + S` to save a screenshot
3. Take screenshots of: Home Feed, Explore/Map, Create Post, Impact/Donations, Profile
4. Upload at least 3, up to 10 per device size

### App Review Information

**Review Notes** (paste this exactly):
```
DEMO ACCOUNT FOR REVIEW:
Email: reviewer@dishdrop.app
Password: Review2026!

The app works with demo/mock data so all features are functional without needing a live backend connection. You can:
1. Browse the home feed with sample dish posts
2. Explore restaurants on the map
3. View the impact/donation tracking page
4. View user profiles and collections
5. Access Settings → Delete Account (Guideline 5.1.1)
6. Report content via the ⋯ menu on any post (Guideline 1.2)
7. Block users via the ⋯ menu on any profile (Guideline 1.2)
8. View Terms of Service and Privacy Policy (linked in registration and settings)

Note: The app uses HTTPS for all API communication. No non-exempt encryption is used (ITSAppUsesNonExemptEncryption = NO).
```

**Contact Info:**
- First Name: (your name)
- Last Name: (your last name)  
- Phone: (your phone number)
- Email: (your email)

### Privacy Labels (App Privacy section)

Go to **App Privacy** in App Store Connect and fill in:

**Data Not Collected for Tracking** — Select "No" for tracking

**Data Linked to You:**
| Data Type | Purpose |
|-----------|---------|
| Email Address | App Functionality |
| Photos or Videos | App Functionality |
| Precise Location | App Functionality |
| User ID | App Functionality |

**Data NOT collected:** Financial, Health, Browsing History, Search History, Contacts, Diagnostics

---

## Step 9: Submit for Review

1. In App Store Connect, make sure all fields have green checkmarks
2. Click **"Add for Review"**
3. Click **"Submit to App Review"**

---

## Troubleshooting

### EAS build fails
```bash
# Clear cache and retry
eas build --platform ios --profile production --clear-cache
```

### "Bundle ID not registered"
Make sure you completed Step 4 (register `com.dishdrop.app` in the Developer Portal).

### "Missing compliance" warning
The app.json already has `ITSAppUsesNonExemptEncryption: false`. If App Store Connect still asks, select "No" for encryption.

### Build succeeds but upload fails
Try manual upload:
1. Download the `.ipa` from the EAS build page
2. Open **Transporter** app (free from Mac App Store)
3. Drag the `.ipa` into Transporter and click **Deliver**

---

## Live URLs Reference

| Service | URL |
|---------|-----|
| API (Production) | https://api-brown-eight.vercel.app |
| API Health Check | https://api-brown-eight.vercel.app/health |
| Privacy Policy | https://legal-roan-one.vercel.app/privacy.html |
| Terms of Service | https://legal-roan-one.vercel.app/terms.html |
| Support Page | https://legal-roan-one.vercel.app/support.html |

---

## What Was Fixed (for reference)

| Previous Rejection | Fix Applied |
|-------------------|-------------|
| Guideline 2.1 — Auto-login hid signup | Auth guard added, login screen shown first |
| Guideline 1.2 — No UGC moderation | EULA checkbox, report modal, block users, terms/privacy pages |
| Guideline 5.1.1(v) — No account deletion | Delete Account in Settings with double confirmation |
| Guideline 5.1.2(i) — Privacy labels wrong | Privacy manifest added, labels documented above |
| Missing PrivacyInfo.xcprivacy | Added via app.json privacyManifests config |
| No export compliance declaration | ITSAppUsesNonExemptEncryption = false |
| No buildNumber | Set to "4" with auto-increment on production builds |
| No privacy policy URL | https://legal-roan-one.vercel.app/privacy.html |
| No support URL | https://legal-roan-one.vercel.app/support.html |

---

**Questions? Text Maude.**
