const fs = require('fs');
const path = require('path');

// ============================================================
// This script adds explanatory comments to every key file
// in the NyangaVoyage project so you can explain the code
// during your presentation tomorrow.
// Run with: node add-comments.js
// ============================================================

let count = 0;

function addComments(filePath, commentBlock) {
  if (!fs.existsSync(filePath)) {
    console.log('SKIPPED (not found): ' + filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  // Only add if not already commented
  if (content.includes('WHAT THIS FILE DOES')) {
    console.log('Already commented: ' + filePath);
    return;
  }
  content = commentBlock + '\n' + content;
  fs.writeFileSync(filePath, content, 'utf8');
  count++;
  console.log('Commented: ' + filePath);
}

// ============================================================
// app/layout.tsx
// ============================================================
addComments('app/layout.tsx', `
/*
 * ============================================================
 * FILE: app/layout.tsx
 * WHAT THIS FILE DOES:
 *   This is the ROOT LAYOUT — it wraps EVERY page in the app.
 *   Think of it like a picture frame that holds all pages.
 *   It does 3 important things:
 *   1. Loads the Google Fonts (Syne for headings, DM Sans for body text)
 *   2. Sets the browser tab title and the WhatsApp/Facebook preview image
 *   3. Wraps everything in LangProvider so ALL pages share the same language (FR/EN)
 *
 * WHY IT EXISTS:
 *   In Next.js, layout.tsx is special — it runs on EVERY page automatically.
 *   Without it, each page would need its own font loading and language setup.
 *   By putting it here once, every page inherits it automatically.
 *
 * KEY CONCEPTS:
 *   - metadata: controls what appears in browser tabs and social media previews
 *   - LangProvider: a React "context" that shares language state across all pages
 *   - crossOrigin: required by Google Fonts for security
 * ============================================================
 */
`);

// ============================================================
// app/globals.css
// ============================================================
addComments('app/globals.css', `
/*
 * ============================================================
 * FILE: app/globals.css
 * WHAT THIS FILE DOES:
 *   This is the ENTIRE DESIGN SYSTEM for NyangaVoyage.
 *   It defines ALL colors, fonts, buttons, cards, inputs,
 *   badges, alerts, and mobile responsive rules in one place.
 *
 *   Think of it like a brand guidelines document translated into code.
 *   Every green color, every rounded corner, every shadow —
 *   all defined here using CSS variables (custom properties).
 *
 * HOW IT WORKS:
 *   :root { --nv-green-600: #16a34a }  <- defines the color once
 *   Then anywhere in the app: color: var(--nv-green-600)  <- uses it
 *   If we want to change the green, we change it HERE and it updates everywhere.
 *
 * SECTIONS IN THIS FILE:
 *   1. CSS Variables (colors, fonts, spacing, shadows)
 *   2. Base reset (removes browser default margins/padding)
 *   3. Layout (.nv-container, .nv-section)
 *   4. Navbar (.nv-nav, .nv-nav-logo, .nv-nav-link)
 *   5. Language toggle (.nv-lang-toggle, .nv-lang-btn)
 *   6. Buttons (.nv-btn, .nv-btn-primary, .nv-btn-secondary)
 *   7. Cards (.nv-card, .nv-card-hover)
 *   8. Form inputs (.nv-input, .nv-select, .nv-label)
 *   9. Badges (.nv-badge, .nv-badge-vip, .nv-badge-green etc.)
 *   10. Alerts (.nv-alert-success, .nv-alert-warning etc.)
 *   11. Spinner (loading animation)
 *   12. Footer (.nv-footer, .nv-footer-logo)
 *   13. Mobile responsive (@media max-width: 768px)
 *   14. Input visibility fix for mobile browsers
 * ============================================================
 */
`);

// ============================================================
// lib/i18n.tsx
// ============================================================
addComments('lib/i18n.tsx', `
/*
 * ============================================================
 * FILE: lib/i18n.tsx
 * WHAT THIS FILE DOES:
 *   This file powers the FR/EN LANGUAGE TOGGLE across the entire app.
 *   "i18n" stands for "internationalization" (18 letters between i and n).
 *
 *   It creates a React "Context" — think of it like a global variable
 *   that ALL pages can read and update simultaneously.
 *   When a user clicks FR or EN in the navbar, this file saves the choice
 *   to localStorage so it persists even when the page refreshes.
 *
 * HOW IT WORKS:
 *   1. LangProvider wraps the whole app (in layout.tsx)
 *   2. Any page calls useLang() to get the current language
 *   3. When setLang('en') is called, all pages update instantly
 *
 * THE MOUNTED FIX:
 *   Next.js renders pages on the SERVER first (in French).
 *   Then the browser loads and reads localStorage (might be English).
 *   If they don't match, React throws a "hydration error".
 *   Solution: always render French first, THEN switch after mount.
 *   The "mounted" flag controls this — it starts false (server safe)
 *   and becomes true only after the component loads in the browser.
 * ============================================================
 */
`);

// ============================================================
// lib/supabase.ts
// ============================================================
addComments('lib/supabase.ts', `
/*
 * ============================================================
 * FILE: lib/supabase.ts
 * WHAT THIS FILE DOES:
 *   This file creates the CONNECTION to our Supabase database.
 *   Supabase is our backend — it stores all trips, seats, bookings,
 *   and agencies in a PostgreSQL database hosted in the cloud.
 *
 *   This file exports a single "supabase" object that every other
 *   file imports to read/write data. Think of it as the phone line
 *   to the database — you only set it up once.
 *
 * HOW IT WORKS:
 *   createClient(URL, KEY) connects to our Supabase project.
 *   The URL and KEY come from .env.local (never committed to GitHub).
 *   persistSession: false — we don't need user login sessions
 *   autoRefreshToken: false — we don't use auth tokens
 *
 * USAGE EXAMPLE:
 *   import { supabase } from '@/lib/supabase'
 *   const { data } = await supabase.from('trips').select('*')
 *   // data now contains all trips from the database
 * ============================================================
 */
`);

// ============================================================
// components/Navbar.tsx
// ============================================================
addComments('components/Navbar.tsx', `
/*
 * ============================================================
 * FILE: components/Navbar.tsx
 * WHAT THIS FILE DOES:
 *   This is the SHARED NAVIGATION BAR that appears at the top
 *   of EVERY page in the app.
 *
 *   It automatically shows different links depending on where you are:
 *   - On normal pages: shows Trajets, Agencies links + FR/EN toggle + Espace Agence button
 *   - On agency pages: shows Dashboard, Mes Trajets, Reservations links
 *   - On admin pages: shows "Admin" label
 *
 *   The FR/EN toggle here updates the language for THE ENTIRE APP
 *   because it uses useLang() from i18n.tsx (shared context).
 *
 * WHY IT'S A SEPARATE COMPONENT:
 *   Instead of copying the navbar HTML into every page (20+ pages),
 *   we write it ONCE here and every page just writes <Navbar />.
 *   If we want to change the navbar, we change it here and ALL pages update.
 *
 * usePathname():
 *   A Next.js hook that tells us which page we're on right now.
 *   We use it to highlight the active nav link with "active" CSS class.
 * ============================================================
 */
`);

// ============================================================
// app/page.tsx
// ============================================================
addComments('app/page.tsx', `
/*
 * ============================================================
 * FILE: app/page.tsx
 * WHAT THIS FILE DOES:
 *   This is the HOMEPAGE — the first page users see at nyanga-voyages.vercel.app
 *   It contains:
 *   1. The hero section with the animated headline
 *   2. The Bus/Train search form (the most important UI element)
 *   3. Stats row (3 agencies, 12 cities, SMS, MTN)
 *   4. Partners strip (Buca Voyages, Garanti Express, Vatican Express, Camrail)
 *   5. "Why NyangaVoyage?" features section
 *   6. Popular bus routes grid (12 routes, clickable)
 *   7. Camrail train routes section (3 lines)
 *   8. "How it works" 4-step guide
 *   9. Footer
 *
 * THE SEARCH FORM:
 *   Two tabs (Bus / Train) switch between different city lists and class options.
 *   When the user clicks "Rechercher", it builds a URL with the search
 *   parameters and navigates to /results or /train-results.
 *   Example: /results?origin=Yaounde&destination=Douala&date=2026-04-17
 *
 * LANGUAGE:
 *   All text comes from the T object (T.fr and T.en).
 *   The isMounted flag prevents hydration errors by always
 *   rendering French first, then switching to saved language.
 *
 * STATE VARIABLES:
 *   mode: 'bus' or 'train' — which tab is active
 *   busFrom, busTo, busDate, busClass — the bus search form values
 *   trainFrom, trainTo, trainDate, trainClass — the train form values
 * ============================================================
 */
`);

// ============================================================
// app/results/page.tsx
// ============================================================
addComments('app/results/page.tsx', `
/*
 * ============================================================
 * FILE: app/results/page.tsx
 * URL: /results?origin=X&destination=Y&date=Z
 * WHAT THIS FILE DOES:
 *   This page shows ALL AVAILABLE BUS TRIPS for a searched route and date.
 *   It reads the search parameters from the URL (origin, destination, date)
 *   then queries Supabase for matching trips.
 *
 * HOW THE DATABASE QUERY WORKS:
 *   supabase.from('trips')     <- look in the trips table
 *   .select('*, agencies(name)')  <- get trip data + agency name
 *   .eq('origin', origin)     <- where origin matches
 *   .eq('destination', dest)  <- AND destination matches
 *   .gte('departure_time', dayStart)  <- AND date is today
 *   .lte('departure_time', dayEnd)    <- AND date is today
 *
 * THE SIDEBAR FILTER:
 *   Buttons for Tous/Matin/Apres-midi/Soir filter the results
 *   by departure hour using JavaScript (no new database query needed).
 *
 * DISTANCE AND DURATION:
 *   Stored in DISTANCE_MAP and DURATION_MAP objects — hardcoded
 *   because Cameroon road distances don't change.
 *
 * CLICKING A TRIP:
 *   router.push('/seats/' + trip.id) — navigates to the seat map
 *   for that specific trip.
 * ============================================================
 */
`);

// ============================================================
// app/train-results/page.tsx
// ============================================================
addComments('app/train-results/page.tsx', `
/*
 * ============================================================
 * FILE: app/train-results/page.tsx
 * URL: /train-results?origin=X&destination=Y&date=Z
 * WHAT THIS FILE DOES:
 *   Shows available CAMRAIL TRAIN routes for a searched journey.
 *   Unlike bus results, train routes are STATIC (hardcoded) because
 *   Camrail has fixed schedules that rarely change.
 *
 * WHY STATIC AND NOT DATABASE:
 *   Camrail only has 3 lines with fixed timetables.
 *   Putting them in a database would add complexity with no benefit.
 *   The static data is defined as TRAIN_ROUTES array in this file.
 *
 * CLASS SELECTION:
 *   Each train route has multiple classes (2nd, Premium, 1st, Couchette).
 *   When a user clicks a class button, they go to /train-seats
 *   with all the journey details passed as URL parameters.
 *
 * THE CAMRAIL BADGE:
 *   The gold "Camrail" badge on each card identifies these as
 *   official national railway services, distinct from bus agencies.
 * ============================================================
 */
`);

// ============================================================
// app/seats/[id]/page.tsx
// ============================================================
addComments('app/seats/[id]/page.tsx', `
/*
 * ============================================================
 * FILE: app/seats/[id]/page.tsx
 * URL: /seats/[trip-id]
 * WHAT THIS FILE DOES:
 *   This is the BUS SEAT MAP — the interactive grid where passengers
 *   choose which physical seat they want on the bus.
 *
 * THE [id] IN THE FILENAME:
 *   This is a Next.js "dynamic route". The [id] means the URL can be
 *   /seats/abc123 or /seats/xyz789 — any trip ID works.
 *   The ID is read with: params.then(p => setTripId(p.id))
 *
 * SEAT LAYOUT BY CLASS:
 *   Normal bus: 2+3 layout (2 seats left, aisle, 3 seats right) = 70 seats
 *   VIP bus:    2+2 layout (2 seats each side) = 33 seats
 *   Classic bus: 2+2 layout = 50 seats
 *   Seats 1,2,3 are permanently reserved (driver + 2 hostesses)
 *
 * REAL-TIME SEAT LOCKING:
 *   When you click a seat, it is immediately "locked" in Supabase
 *   for 10 minutes. This prevents two people booking the same seat.
 *   A countdown timer shows how long you have to complete checkout.
 *   If you don't pay, the lock expires and the seat becomes available again.
 *
 * SEAT COLORS:
 *   Green = available, Blue = your selected seat,
 *   Yellow = locked by someone else (10 min hold), Gray = already booked
 *
 * ON-DEMAND GENERATION:
 *   Seats are only created in the database when someone FIRST views
 *   the seat map. Before that, only the trip exists in the database.
 * ============================================================
 */
`);

// ============================================================
// app/train-seats/page.tsx
// ============================================================
addComments('app/train-seats/page.tsx', `
/*
 * ============================================================
 * FILE: app/train-seats/page.tsx
 * URL: /train-seats?origin=X&class=Y&price=Z&...
 * WHAT THIS FILE DOES:
 *   This page lets passengers choose their TRAIN SEAT or COUCHETTE BERTH.
 *   It has two different layouts depending on the class chosen:
 *
 *   REGULAR SEATS (2nd Class, 1st Class, Premium):
 *   Shows a 2+2 seat grid (like an airplane layout).
 *   Green = available, Gray = occupied, Blue = your selection.
 *
 *   COUCHETTE BERTHS (night train):
 *   Shows compartment cards (groups of 2 or 4 berths per compartment).
 *   Each berth shows "Libre" (free) or "Occupe" (taken).
 *
 * WHY NO DATABASE FOR TRAIN SEATS:
 *   Train seat availability is simulated using a deterministic pattern
 *   (every 4th seat is "occupied") instead of real database records.
 *   This avoids needing to create thousands of seat records for trains.
 *
 * THE HYDRATION FIX:
 *   Seats are generated in useEffect (after mount) not in useState
 *   to avoid server/client mismatch errors.
 *
 * ALL DATA PASSED VIA URL:
 *   Origin, destination, class, price, departure time — everything
 *   is in the URL so no session storage is needed between pages.
 * ============================================================
 */
`);

// ============================================================
// app/checkout/page.tsx
// ============================================================
addComments('app/checkout/page.tsx', `
/*
 * ============================================================
 * FILE: app/checkout/page.tsx
 * URL: /checkout?tripId=X&seatId=Y&seatNumber=Z
 * WHAT THIS FILE DOES:
 *   This is the BUS PAYMENT PAGE where passengers:
 *   1. Enter their full name and phone number
 *   2. Enter their MTN Mobile Money number
 *   3. Click "Payer" to simulate payment
 *   4. Watch a 5-second countdown (simulating MoMo notification)
 *   5. Get redirected to their ticket
 *
 * FORM VALIDATION:
 *   Before payment, the form checks:
 *   - Full name is not empty
 *   - Phone number is 9 digits
 *   - MoMo number is 9 digits
 *   If any check fails, a red error message appears under that field.
 *
 * THE PAYMENT SIMULATION:
 *   Real MTN MoMo API requires business registration.
 *   For the MVP, we simulate it with a 5-second countdown.
 *   The countdown uses useEffect with a timer that decrements each second.
 *   When it reaches 1 (not 0) it triggers finishBooking() to avoid
 *   calling it twice.
 *
 * WHAT HAPPENS AFTER PAYMENT:
 *   1. The seat status is updated to 'booked' in Supabase
 *   2. A booking record is created with a random booking reference
 *   3. The passenger name/phone is saved to localStorage
 *   4. User is redirected to /ticket/[bookingRef]
 *
 * PASSENGER DATA STORAGE:
 *   Name and phone are stored in localStorage (browser storage)
 *   because we have no user accounts in this MVP.
 * ============================================================
 */
`);

// ============================================================
// app/train-checkout/page.tsx
// ============================================================
addComments('app/train-checkout/page.tsx', `
/*
 * ============================================================
 * FILE: app/train-checkout/page.tsx
 * URL: /train-checkout?origin=X&class=Y&seat=Z&price=W&...
 * WHAT THIS FILE DOES:
 *   Same as checkout/page.tsx but for TRAIN BOOKINGS.
 *   The key difference: train bookings are NOT saved to Supabase.
 *   Instead, the complete booking data is saved to localStorage
 *   as a JSON object, then read by the train ticket page.
 *
 * WHY LOCALSTORAGE INSTEAD OF DATABASE FOR TRAINS:
 *   Train routes don't have a database table (they're static).
 *   Without a trips table entry, we can't create a proper database booking.
 *   localStorage is used as a quick solution for the MVP.
 *
 * THE BOOKING REFERENCE:
 *   Generated as 'TR' + random 6 characters: e.g. "TRABCD12"
 *   The TR prefix distinguishes train tickets from bus tickets.
 *
 * DATA FLOW:
 *   URL params → form → localStorage → /ticket/train/[ref]
 * ============================================================
 */
`);

// ============================================================
// app/ticket/[bookingRef]/page.tsx
// ============================================================
addComments('app/ticket/[bookingRef]/page.tsx', `
/*
 * ============================================================
 * FILE: app/ticket/[bookingRef]/page.tsx
 * URL: /ticket/ABC123XY
 * WHAT THIS FILE DOES:
 *   This is the BUS E-TICKET page — the final destination of the
 *   booking flow. It shows the passenger their confirmed ticket.
 *
 * HOW IT LOADS THE BOOKING:
 *   Uses the bookingRef from the URL to query Supabase:
 *   supabase.from('bookings')
 *     .select('*, trips(*, agencies(name)), seats(seat_number)')
 *     .eq('booking_ref', bookingRef)
 *   This gets the booking + the trip details + the seat number
 *   in a single database query using Supabase's JOIN syntax.
 *
 * THE SMS TRIGGER:
 *   On first load, it calls /api/send-sms to send a Twilio SMS
 *   to the passenger's phone number with their booking details.
 *   localStorage key 'sms_sent_[ref]' prevents sending twice
 *   if the page is refreshed.
 *
 * THE TICKET DESIGN:
 *   Green header with booking reference (large, bold)
 *   Gold accent bar below the header
 *   Route section with departure time → arrival city
 *   Details grid: Passenger, Phone, Agency, Class, Seat, Reference
 *   "Confirme" green badge at the bottom
 *   Print button triggers window.print()
 * ============================================================
 */
`);

// ============================================================
// app/ticket/train/[bookingRef]/page.tsx
// ============================================================
addComments('app/ticket/train/[bookingRef]/page.tsx', `
/*
 * ============================================================
 * FILE: app/ticket/train/[bookingRef]/page.tsx
 * URL: /ticket/train/TRABCD12
 * WHAT THIS FILE DOES:
 *   The TRAIN E-TICKET page. Similar to the bus ticket but:
 *   - Gold/amber header instead of green (Camrail branding)
 *   - Reads booking data from localStorage (not database)
 *   - Shows departure time, arrival time, duration, compartment number
 *   - Shows "Couchette N°X" for couchette bookings, "Place N°X" for seats
 *   - Has "NyangaVoyage x Camrail" co-branding in the header
 *
 * DATA SOURCE:
 *   localStorage.getItem('nv_train_booking') — set during train checkout
 *   localStorage.getItem('nv_passenger_name') — passenger name
 *   localStorage.getItem('nv_passenger_phone') — passenger phone
 *
 * PRINT FUNCTIONALITY:
 *   window.print() triggers the browser's print dialog.
 *   Passengers can print their ticket or save it as PDF.
 * ============================================================
 */
`);

// ============================================================
// app/search/page.tsx
// ============================================================
addComments('app/search/page.tsx', `
/*
 * ============================================================
 * FILE: app/search/page.tsx
 * URL: /search
 * WHAT THIS FILE DOES:
 *   A dedicated SEARCH PAGE separate from the homepage.
 *   Accessible from the "Trajets" link in the navbar.
 *
 *   Contains the same Bus/Train search form as the homepage
 *   but in a cleaner, full-page layout with:
 *   - A hero banner with the search card
 *   - A "Popular Routes" section below (6 common routes)
 *   - Clicking a popular route auto-fills the search form
 *
 * WHY THIS PAGE EXISTS SEPARATELY:
 *   Users who land on internal pages (ticket, results) can navigate
 *   here via the navbar to start a new search without going back home.
 *
 * SUSPENSE WRAPPER:
 *   useSearchParams() requires the component to be wrapped in
 *   React Suspense to work correctly in Next.js App Router.
 *   The Suspense fallback shows a spinner while the page loads.
 * ============================================================
 */
`);

// ============================================================
// app/agencies/page.tsx
// ============================================================
addComments('app/agencies/page.tsx', `
/*
 * ============================================================
 * FILE: app/agencies/page.tsx
 * URL: /agencies
 * WHAT THIS FILE DOES:
 *   The AGENCIES & OPERATORS INFO PAGE — a comprehensive directory
 *   of all transport operators available on NyangaVoyage.
 *
 *   BUS TAB shows 3 agencies:
 *   - Buca Voyages (green theme, 45 buses, since 2008)
 *   - Garanti Express (blue theme, 30 buses, since 2012)
 *   - Vatican Express (gold theme, 25 buses, since 2015)
 *   Clicking an agency expands to show: all classes (Normal/Classic/VIP)
 *   with seat counts, layouts, and amenities; plus all routes with times.
 *
 *   TRAIN TAB shows Camrail with 3 lines:
 *   - Douala-Yaounde Express (263km, 4h45, daily)
 *   - Yaounde-Ngaoundere Night Train (667km, 13h, couchettes)
 *   - Douala-Kumba Omnibus (200km, 5h)
 *   Clicking a line shows: departure times, all stops, all classes.
 *
 * THE ACCORDION PATTERN:
 *   selectedAgency state stores which agency is expanded.
 *   Clicking the same agency again collapses it (sets to null).
 *   This is called an "accordion" or "expand/collapse" UI pattern.
 *
 * ALL DATA IS HARDCODED:
 *   Agency info, routes, and amenities are defined as constants
 *   at the top of the file (BUS_AGENCIES, TRAIN_LINES arrays).
 * ============================================================
 */
`);

// ============================================================
// app/agency/login/page.tsx
// ============================================================
addComments('app/agency/login/page.tsx', `
/*
 * ============================================================
 * FILE: app/agency/login/page.tsx
 * URL: /agency/login
 * WHAT THIS FILE DOES:
 *   The LOGIN PAGE for bus agency staff (not passengers).
 *   Agencies log in to manage their trips and view bookings.
 *
 * HOW AUTHENTICATION WORKS:
 *   1. Agency enters email + password
 *   2. supabase.auth.signInWithPassword() checks credentials
 *   3. If valid, we check the agencies table for a matching user_id
 *      where is_admin = false (to ensure it's an agency, not admin)
 *   4. If agency found → redirect to /agency/dashboard
 *   5. If not found → show error "Aucune agence associee"
 *
 * AGENCY CREDENTIALS (for demo):
 *   Buca Voyages:     buca@nyangavoyage.com / Buca2026!
 *   Garanti Express:  garanti@nyangavoyage.com / Garanti2026!
 *   Vatican Express:  vatican@nyangavoyage.com / Vatican2026!
 *
 * SUPABASE AUTH:
 *   Supabase handles password hashing, JWT tokens, and sessions.
 *   We never store passwords ourselves — Supabase manages all of that.
 * ============================================================
 */
`);

// ============================================================
// app/agency/dashboard/page.tsx
// ============================================================
addComments('app/agency/dashboard/page.tsx', `
/*
 * ============================================================
 * FILE: app/agency/dashboard/page.tsx
 * URL: /agency/dashboard
 * WHAT THIS FILE DOES:
 *   The AGENCY DASHBOARD — the home screen after an agency logs in.
 *   Shows 3 stat cards:
 *   - Number of active trips
 *   - Number of confirmed bookings
 *   - Total revenue in FCFA
 *
 *   Plus 2 quick action cards linking to Trips and Bookings pages.
 *
 * AUTHENTICATION GUARD:
 *   First thing on load: checkAuth() verifies the user is logged in.
 *   If not logged in → redirect to /agency/login immediately.
 *   If logged in but not an agency → redirect to /agency/login.
 *   This prevents unauthorized access to the dashboard.
 *
 * REVENUE CALCULATION:
 *   Gets all bookings for this agency's trips, then sums up the prices:
 *   bookings.reduce((sum, b) => sum + b.trips.price, 0)
 *   "reduce" is a JavaScript function that accumulates a running total.
 * ============================================================
 */
`);

// ============================================================
// app/agency/trips/page.tsx
// ============================================================
addComments('app/agency/trips/page.tsx', `
/*
 * ============================================================
 * FILE: app/agency/trips/page.tsx
 * URL: /agency/trips
 * WHAT THIS FILE DOES:
 *   Lets agency staff ADD and DELETE their bus trips.
 *   This is how new trips appear in the passenger search results.
 *
 * ADDING A TRIP:
 *   The form collects: origin, destination, date, time, class, price.
 *   Seat count is automatically set based on class:
 *   Normal=70, Classic=50, VIP=33 (no manual entry needed).
 *   The date and time are combined: date + 'T' + time + ':00+00'
 *   (the +00 means UTC timezone).
 *   Then inserted into Supabase trips table with the agency's ID.
 *
 * DELETING A TRIP:
 *   First deletes all seats for that trip (foreign key constraint)
 *   Then deletes the trip itself.
 *   confirm() shows a browser dialog asking "are you sure?"
 *
 * ONLY SHOWS THIS AGENCY'S TRIPS:
 *   .eq('agency_id', ag.id) — filters to only this agency's data.
 *   An agency cannot see or modify another agency's trips.
 * ============================================================
 */
`);

// ============================================================
// app/agency/bookings/page.tsx
// ============================================================
addComments('app/agency/bookings/page.tsx', `
/*
 * ============================================================
 * FILE: app/agency/bookings/page.tsx
 * URL: /agency/bookings
 * WHAT THIS FILE DOES:
 *   Shows a TABLE of all confirmed bookings for this agency's trips.
 *   Columns: Reference, Date, Route, Departure, Class, Seat, Price.
 *
 * HOW THE QUERY WORKS:
 *   Step 1: Get all trip IDs belonging to this agency
 *   Step 2: Get all bookings where trip_id is in that list (.in())
 *   Step 3: Include trip details and seat number in the same query
 *
 *   This is called a JOIN — getting related data from multiple tables
 *   in a single database request.
 *
 * READ-ONLY VIEW:
 *   Agency staff can only VIEW bookings, not modify or cancel them.
 *   This is intentional for the MVP — cancellation logic would
 *   require refund processing which needs the real MoMo API.
 * ============================================================
 */
`);

// ============================================================
// app/admin/login/page.tsx
// ============================================================
addComments('app/admin/login/page.tsx', `
/*
 * ============================================================
 * FILE: app/admin/login/page.tsx
 * URL: /admin/login
 * WHAT THIS FILE DOES:
 *   Login page for the PLATFORM ADMINISTRATOR (NyangaVoyage staff).
 *   Different from agency login — the admin can see ALL agencies
 *   and ALL bookings across the entire platform.
 *
 * HOW IT DIFFERS FROM AGENCY LOGIN:
 *   Checks is_admin = TRUE in the agencies table.
 *   If someone tries to log in with agency credentials here,
 *   they get "Acces administrateur refuse."
 *
 * ADMIN CREDENTIALS (for demo):
 *   Email:    admin@nyangavoyage.com
 *   Password: Admin2026!
 * ============================================================
 */
`);

// ============================================================
// app/admin/dashboard/page.tsx
// ============================================================
addComments('app/admin/dashboard/page.tsx', `
/*
 * ============================================================
 * FILE: app/admin/dashboard/page.tsx
 * URL: /admin/dashboard
 * WHAT THIS FILE DOES:
 *   The ADMIN CONTROL PANEL — platform-wide overview with 3 tabs:
 *
 *   TAB 1 — Vue d'ensemble (Overview):
 *   Shows 4 stats: total agencies, total trips, total bookings, total revenue.
 *   All data loaded in parallel using Promise.all() for speed.
 *
 *   TAB 2 — Agences (Agencies):
 *   Left: list of all registered agencies with active/inactive status.
 *   Right: form to ADD a new agency (creates Supabase auth account + agency record).
 *
 *   TAB 3 — Reservations (Bookings):
 *   Table of ALL bookings across ALL agencies on the platform.
 *
 * ADDING AN AGENCY:
 *   Step 1: supabase.auth.signUp() — creates login credentials
 *   Step 2: supabase.from('agencies').insert() — creates agency profile
 *   The agency can then log in at /agency/login with those credentials.
 *
 * Promise.all():
 *   Runs 3 database queries SIMULTANEOUSLY instead of one after another.
 *   This makes the dashboard load 3x faster.
 * ============================================================
 */
`);

// ============================================================
// public/favicon.svg
// ============================================================
addComments('public/favicon.svg', `<!--
  FILE: public/favicon.svg
  WHAT THIS FILE DOES:
    This is the FAVICON — the small icon that appears in the browser tab
    next to the page title, and on phone home screens when users save the site.

  THE R5 DESIGN:
    - Dark background (#0f172a) — matches the app's dark navbar color
    - Green sunrise arcs — represent new journeys, hope, movement
    - Gold sun with rays — represents the warmth of Cameroon
    - Green bus body with blue windows — the core of what NyangaVoyage does
    - Gold wheels — gold accent color from the design system
    - Yellow headlight — the bus is moving, going somewhere
    - Italic "N" in bright green and "V" in gold — NyangaVoyage initials

  HOW BROWSERS USE IT:
    The <link rel="icon"> tag in layout.tsx points to this file.
    Modern browsers support SVG favicons directly.
    The apple-touch-icon version is used when saving to iPhone home screen.

  FORMAT CHOICE:
    SVG is used instead of PNG/ICO because:
    - It scales perfectly to any size (16px tab to 512px app icon)
    - Small file size (under 2KB)
    - Looks sharp on retina/high-DPI screens
-->`);

console.log('\n============================================================');
console.log('DONE! Added comments to ' + count + ' files.');
console.log('============================================================');
console.log('\nFiles now have explanatory headers that describe:');
console.log('  - What the file does');
console.log('  - How it works');
console.log('  - Why key decisions were made');
console.log('  - Technical concepts explained simply');
console.log('\nYou can now open any file in VS Code and read the comments');
console.log('at the top to understand and explain that part of the code.');
