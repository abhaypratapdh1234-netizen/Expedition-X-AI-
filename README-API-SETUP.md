# API Setup Guide (Free Tiers)

To run the backend fully, you need to sign up for several free API keys. Copy `backend/.env.example` to `backend/.env` and fill in the values using this guide.

## 1. OpenTripMap (Tourist Attractions)
- **Sign up**: `https://opentripmap.io/product`
- **Cost**: Free (no card required)
- **Env Variable**: `OPENTRIPMAP_API_KEY`

## 2. OpenWeatherMap (Weather)
- **Sign up**: `https://openweathermap.org/`
- **Cost**: Free (no card required)
- **Note**: Go to "My API keys". Keys take ~10 mins to activate.
- **Env Variable**: `OPENWEATHER_API_KEY`

## 3. Unsplash (Images)
- **Sign up**: `https://unsplash.com/developers`
- **Cost**: Free
- **Note**: Click "New Application" and accept terms. Use the "Access Key".
- **Env Variable**: `UNSPLASH_ACCESS_KEY`

## 4. Cloudinary (Media Uploads)
- **Sign up**: `https://cloudinary.com/users/register/free`
- **Cost**: Free (no card required)
- **Env Variables**: 
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

## 5. Brevo (Transactional Email)
- **Sign up**: `https://www.brevo.com/`
- **Cost**: Free (300 emails/day)
- **Note**: Go to "SMTP & API" and generate a new SMTP key.
- **Env Variables**:
  - `SMTP_USER` (your login email)
  - `SMTP_PASSWORD` (the generated SMTP key)

## 6. Amadeus (Flight/Hotel Sandbox) [Optional]
- **Sign up**: `https://developers.amadeus.com/register`
- **Cost**: Free test environment
- **Note**: Create an app in "My Self-Service Workspace".
- **Env Variables**:
  - `AMADEUS_CLIENT_ID`
  - `AMADEUS_CLIENT_SECRET`

## 7. Aviationstack (Live Flight Tracking)
- **Sign up**: `https://aviationstack.com/`
- **Cost**: Free (100 requests/month limit on the basic free plan)
- **Note**: Used for live flight search and tracking feature on the `/app/flights` page.
- **Env Variable**: `AVIATIONSTACK_API_KEY`

---

*Note: APIs like REST Countries, Nominatim, ExchangeRate-API, and Nager.Date are keyless and require no setup.*
