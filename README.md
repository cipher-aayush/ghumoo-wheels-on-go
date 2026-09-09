# Ghumoo Wheels

Build a modern vehicle rental web app called "[GHUMOO]" — a platform where users can browse, search, and book cars/bikes for self-drive rental, similar to Zoomcar or Freedo Rentals.

CORE PAGES & FEATURES:

1. Landing Page:

   - Hero section with a search bar (location, pickup date/time, drop-off date/time)

   - "How it works" section (3-4 steps: choose location → pick vehicle → book → drive)

   - Featured/popular vehicles carousel with images, name, price/hour or price/day, and "Book Now" button

   - City/location selector showing available cities

   - Customer testimonials section

   - Trust badges (insurance included, 24/7 support, fuel included, etc.)

   - Footer with links (About, Contact, Terms, Privacy, Social icons)

2. Vehicle Listing Page:

   - Grid/list of available vehicles with filters: vehicle type (car/bike/SUV), transmission (manual/automatic), fuel type, price range, seating capacity

   - Sort by: price low-high, high-low, popularity

   - Each card shows: image, name, rating, price, key specs (seats, fuel, transmission), "View Details" button

3. Vehicle Detail Page:

   - Image gallery

   - Full specs (mileage, fuel type, transmission, seats, luggage space)

   - Pricing breakdown (hourly/daily rate, security deposit, taxes)

   - Availability calendar

   - Reviews & ratings section

   - "Book Now" CTA button

4. Booking Flow:

   - Step 1: Select pickup/drop-off location and date/time

   - Step 2: Add-ons (GPS, child seat, extra driver, insurance)

   - Step 3: Enter personal details (name, phone, email, driving license upload)

   - Step 4: Payment page (card/UPI/wallet options — use dummy/placeholder payment UI)

   - Booking confirmation page with summary and booking ID

5. User Dashboard:

   - "My Bookings" (upcoming, ongoing, past) with status badges

   - Profile section (edit personal info, upload driving license)

   - Saved/favorite vehicles

6. Admin/Host Panel (basic):

   - Add/edit/remove vehicles (name, images, price, specs, availability)

   - View all bookings with status (pending, confirmed, completed, cancelled)

   - Basic dashboard with total bookings, revenue, active vehicles stats

DESIGN REQUIREMENTS:

- Clean, modern, mobile-responsive design

- Primary brand color: [pick one, e.g., deep blue/teal/orange] with white/neutral backgrounds

- Use card-based layouts with soft shadows and rounded corners

- Sticky navbar with logo, links (Home, Vehicles, About, Contact), and Login/Signup button

- Use smooth hover animations on buttons and cards

- Include a working search/filter functionality with mock data

TECH/DATA:

- Use Supabase for authentication (email/password + Google login) and database (vehicles, bookings, users tables)

- Populate with realistic dummy vehicle data (10-15 vehicles: hatchbacks, sedans, SUVs, bikes) including images from placeholder/stock sources

- Store bookings linked to logged-in users

Start by building the landing page, vehicle listing, vehicle detail page, and booking flow first, then add the user dashboard and admin panel.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7d8dea3b-9d68-402d-a02a-13464ab13375).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
