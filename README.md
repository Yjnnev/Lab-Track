# Lab Borrow

A mobile-first, offline-capable web app that digitizes a university lab's equipment
borrowing process.

## Problem
Students borrow lab equipment in bulk through a paper slip. The lab has poor signal,
and the admin will only adopt a digital system if it is at least as convenient as paper.

## Users
- **Student representative** – borrows on behalf of a group, on their own phone
- **Lab admin** – releases and receives equipment (has a QR scanner device)
- **Instructor** – signs off on a slip

## Core features
**Student**
- Sign in with Google
- Build a borrow slip from the equipment catalog (quantity steppers)
- Instructor signature (draw-to-sign on screen)
- Submit slip and receive a slip QR code plus a short backup code
- Fill out the survey after the return is completed

**Admin**
- Scan or enter a slip code to open a slip
- Release items; check returns per line (returned quantity + optional note)
- Manage the equipment catalog and stock quantities
- See what is currently out and with whom

**Offline**
- Install Lab Track from the browser menu or use the in-app install prompt to keep the app shell on the device
- Open the Borrow page once while online to cache the equipment catalog; Firestore keeps the catalog in its local persistent cache
- Previously loaded catalog items remain selectable offline using the cached total quantities
- Borrow slips are saved locally and sync automatically when the connection returns
- Cached stock can be out of date; the lab admin confirms actual availability before releasing equipment
- "Pending sync" indicator

## Tech stack
- Vite + Preact (JavaScript)
- Plain CSS (mobile-first)
- Firebase: Firestore (with offline persistence), Authentication (Google)
- vite-plugin-pwa, qrcode, signature_pad
- Hosting: Firebase Hosting (free plan)
