# Booking tutorial and vehicle presentation

## What will change
- Replace the selected homepage SUV image with a short, muted booking tutorial video that shows search, vehicle selection, details, payment, and confirmation.
- Keep the video accessible with captions-style labels, a poster image, and playback controls.
- Add **Scooty** to vehicle-type choices everywhere the shared type list is used, including customer filters and admin add/edit.
- Show the vehicle's first uploaded photo in the booking payment summary, falling back to the built-in vehicle image when none is uploaded.
- Make the Aurora background react subtly to scrolling, while disabling motion when reduced-motion is requested.

## Technical details
- Create and store a lightweight MP4/WebM-style visual tutorial as a project media asset.
- Reuse `vehiclePhotos()` in the booking summary so admin-uploaded images flow through consistently.
- Convert the background layer into a scroll-aware React component and define motion through global semantic styles.
- Verify desktop and mobile layouts, video playback, booking imagery, and a clean build.
