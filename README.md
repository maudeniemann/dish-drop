# Dish Drop

A food social media app with meal donation gamification. Share your favorite dishes, discover new restaurants, and donate meals to those in need.

## Tech Stack

- **Mobile**: React Native + Expo SDK 54
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma

---

## How to Run the App (Step-by-Step)

The app runs in **demo mode** with mock data, so you do NOT need a database or backend server. You just need to run the mobile app.

### Step 1: Install Prerequisites

You need these installed on your computer first:

1. **Node.js** (version 18 or newer)
   - Go to https://nodejs.org and download the **LTS** version
   - Run the installer, click through all the defaults
   - To verify it worked, open Terminal (Mac) or Command Prompt (Windows) and type:
     ```
     node --version
     ```
     You should see something like `v18.x.x` or `v20.x.x`

2. **Git** (to download the code)
   - **Mac**: It's already installed. Open Terminal and type `git --version` to check.
   - **Windows**: Download from https://git-scm.com/download/win and install with defaults.

3. **Expo Go app** on your phone (to preview the app on your actual phone)
   - **iPhone**: Search "Expo Go" in the App Store and install it
   - **Android**: Search "Expo Go" in the Google Play Store and install it

### Step 2: Download the Code

Open Terminal (Mac) or Command Prompt (Windows) and run:

```bash
git clone https://github.com/maudeniemann/dish-drop.git
cd dish-drop
```

### Step 3: Install Dependencies

```bash
cd mobile
npm install --legacy-peer-deps
```

This will take a minute or two. Wait until it finishes.

### Step 4: Set Up Environment File

```bash
cp .env.example .env
```

You don't need to edit anything — the defaults work fine for demo mode.

### Step 5: Start the App

```bash
npx expo start
```

After a few seconds, you'll see a QR code in your terminal.

### Step 6: Open on Your Phone

- **iPhone**: Open the **Camera app** and point it at the QR code. Tap the notification that appears — it will open in Expo Go.
- **Android**: Open the **Expo Go app** and tap "Scan QR code", then scan the QR code from your terminal.

**IMPORTANT**: Your phone and computer must be on the **same Wi-Fi network**.

That's it! The app should load on your phone.

---

## Troubleshooting

### "Could not connect to server"
- Make sure your phone and computer are on the same Wi-Fi
- Try pressing `s` in the terminal to switch to Expo Go mode
- Try running `npx expo start --tunnel` instead (this uses a tunnel so same Wi-Fi isn't required, but it's slower)

### npm install fails
- Try deleting `node_modules` folder and running `npm install --legacy-peer-deps` again
- Make sure you have Node.js 18+ installed

### QR code doesn't work on iPhone
- Make sure Expo Go is installed from the App Store
- Try opening the Expo Go app directly and entering the URL shown in terminal (the `exp://...` address)

### Want to run on a computer simulator instead?
- **Mac + iOS Simulator**: Install Xcode from the Mac App Store (it's free but ~12GB). Then press `i` in the terminal after `npx expo start`.
- **Android Emulator**: Install Android Studio (https://developer.android.com/studio). Set up an emulator in AVD Manager. Then press `a` in the terminal after `npx expo start`.

---

## Features

- Home feed with swipe-to-discover restaurants
- Restaurant discovery map and list view
- Restaurant menus with user review matching
- User profiles with post and likes grids
- Collections and curated lists
- Meal donation tracking and impact stats
- Coins, coupons, and flash sponsorships
- Teams and leaderboards
