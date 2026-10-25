# Lab Borrow

A mobile-first, offline-capable web app that digitizes a university lab's equipment
borrowing process.

## Developers
Vennjy Lugo  
Carl Joshua Magdael  
Clarence Jay Sy   

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
- Installable PWA; catalog cached on device
- Slips and returns save locally and sync automatically when signal returns
- "Pending sync" indicator

## Slip status flow
draft → submitted → released → returned

## Tech stack
- Vite + Preact (JavaScript)
- Plain CSS (mobile-first)
- Firebase: Firestore (with offline persistence), Authentication (Google)
- vite-plugin-pwa, qrcode, signature_pad
- Hosting: Firebase Hosting (free plan)

## Open questions
- Instructor approval method (draw-to-sign assumed for v1)
- Who can edit stock quantities (admin only assumed)
