# 🌍 ExpeditionX AI

**An AI-Powered Trip Planning Platform for Personalized Travel Discovery, Booking & Itinerary Management**

ExpeditionX AI unifies the entire travel journey — discovery, AI-driven cost estimation, personalized recommendations, route optimization, booking, and post-trip memories — into a single, intelligent platform.
Instead of juggling 5–6 different apps to plan a trip, users get everything in one place: search a destination and instantly receive tourist places, an AI-estimated budget, personalized suggestions, an optimized day-wise itinerary, and nearby hotels — all on an interactive map.

## 📌 Table of Contents

- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [AI/ML Components](#-aiml-components)
- [Database Design](#-database-design)
- [API Overview](#-api-overview)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Security](#-security)
- [Testing](#-testing)
- [Results](#-results)
- [Future Work](#-future-work)
- [References](#-references)

## 🎯 Problem Statement

Planning a trip today requires visiting multiple separate apps/websites — one for places, one for weather, one for hotel prices, one for maps/routes, one for reviews, and one for bookings. This fragmentation wastes time and produces inconsistent, non-personalized information.

**ExpeditionX AI** solves this by combining recommendation, cost prediction, route optimization, and sentiment analysis into one explainable, end-to-end platform — using lightweight, transparent ML models instead of black-box deep learning, so every AI output stays justifiable to the user.

## ✨ Key Features

| Module | Highlights |
|---|---|
| **A. Core Trip Planning** | Place search, category filters, drag-drop itinerary builder, route optimization, trip comparison |
| **B. AI & ML Intelligence** | Cost estimation with confidence range, personalized recommendations, AI chatbot, sentiment-tagged reviews |
| **C. Booking & Payments** | Hotel & ticket booking, checkout, e-ticket/QR generation, booking history & invoices |
| **D. Social, Group & Community** | Real-time group trip collaboration, cost-splitting, wishlist, community reviews |
| **E. Travel Toolkit & Utilities** | Packing checklist, currency converter, local events feed, weather-aware "best time to visit" |
| **F. Gamification & Retention** | XP/levels/badges, referral rewards, scheduled reminders & notifications |
| **G. Platform, Trust & Admin** | JWT auth & RBAC, safety advisory badges, support tickets, admin analytics dashboard |

## 🛠️ Tech Stack

**Frontend**
- React.js (Vite) + TypeScript
- Tailwind CSS (custom design tokens)
- Framer Motion (animation), Recharts (charts)
- Leaflet.js / Mapbox GL (maps)
- Zustand / Redux Toolkit, React Hook Form + Zod, Axios

**Backend**
- Java 17+, Spring Boot 3.x
- Spring Web (REST), Spring Security (JWT), Spring Data JPA
- Spring Validation, Spring Cache, Spring Scheduling (`@Scheduled`)
- Spring WebSocket (STOMP) for real-time collaboration
- PostgreSQL (primary database), Redis (caching)
- Swagger / OpenAPI (springdoc-openapi) for API docs
- Spring Actuator for health checks

**AI/ML Layer**
- Python microservice (FastAPI/Flask)
- scikit-learn, statsmodels, XGBoost/LightGBM
- TF-IDF + Logistic Regression / VADER-style sentiment scoring

**DevOps & External APIs**
- Docker + Docker Compose (one-command deployment)
- OpenTripMap, OpenWeatherMap, OSRM, Nominatim/OpenStreetMap
- Unsplash, ExchangeRate API, Cloudinary, Calendarific

## 🏗️ System Architecture

```text
[ React.js Frontend (Web/PWA) ]
      | REST / WebSocket (JWT)
      v
[ Spring Boot Backend — API Gateway Layer ]
- Controller Layer
- Service Layer
- Repository Layer (Spring Data JPA)
      |                \
      v                 v
[ PostgreSQL Database ]   [ Python AI/ML Microservice (FastAPI) ]
- Core entities         - Cost Estimation Model
                        - Recommendation Engine
[ Redis Cache ]         - Route Optimization
- Search/weather/session  - Sentiment Analysis
  caching               - Chatbot Intent Classifier
      |
      v
[ External Free APIs: OpenTripMap, OpenWeatherMap, OSRM,
  Nominatim, Unsplash, ExchangeRate, Cloudinary ]
```
**Presentation Layer:** React.js frontend consuming REST APIs and a WebSocket channel for live features.
**Application Layer:** Spring Boot backend organized as Controller -> Service -> Repository.
**AI/ML Layer:** A decoupled Python microservice serving all machine-learning predictions.
**Data Layer:** PostgreSQL for persistence, Redis for caching.
**Integration Layer:** Free third-party APIs enrich place, weather, routing, and image data.

## 🤖 AI/ML Components

| Component | Description |
|---|---|
| **Cost Estimation Model** | Regression/rule-weighted model predicting trip cost as a `[low, high, mostLikely]` confidence range |
| **Recommendation Engine** | Content-based filtering (cosine similarity) + collaborative signal from bookings/wishlist/preferences |
| **Route Optimization Engine** | Nearest-neighbor / greedy TSP-approximation over an OSRM travel-time matrix |
| **Sentiment Analysis Engine** | TF-IDF + Logistic Regression / VADER-style scoring, tagging reviews positive/negative/neutral |
| **Chatbot Intent Classifier** | Rule-based/NLP intent matching with slot-filling, routed to internal services |

All models are classical, explainable, and CPU-cheap by design — chosen over black-box deep learning so every AI output can be justified to the user.

## 🗄️ Database Design

Core entities: `User`, `UserPreference`, `Place`, `Hotel`, `Trip`, `TripCollaborator`, `ItineraryItem`, `Booking`, `Payment`, `Review`, `Wishlist`.

Key relationships:
- `1:1` User – UserPreference
- `1:N` User – Trip
- `1:N` Trip – ItineraryItem, `N:1` ItineraryItem – Place
- `M:N` Trip – User via TripCollaborator (group trips)
- `1:1` Booking – Payment

## 🔌 API Overview

Sample endpoints (40+ total, each mapped one-to-one to a frontend page):

```
POST /api/v1/auth/signup
POST /api/v1/auth/login
GET  /api/v1/onboarding/status
POST /api/v1/onboarding/preferences
GET  /api/v1/dashboard/summary?userId=...
GET  /api/v1/places/search?city={city}&category={category}
GET  /api/v1/places/{id}
POST /api/v1/trips
PUT  /api/v1/trips/{id}/itinerary
POST /api/v1/trips/{id}/optimize
GET  /api/v1/cost-estimate?tripId={id}
GET  /api/v1/recommendations?userId=...
WS   /ws/trips/{id}           (live itinerary co-editing)
GET  /api/v1/hotels/nearby?placeId={id}
GET  /api/v1/admin/analytics/*      (role-guarded)
```
Full API documentation is available via Swagger/OpenAPI once the backend is running:
```
http://localhost:8080/swagger-ui.html
```

## 📁 Project Structure

```
com.expeditionx.backend
├── config/      -> SecurityConfig, CorsConfig, RedisConfig, SwaggerConfig, WebSocketConfig
├── controller/  -> Auth, Onboarding, Dashboard, Places, Trips, Bookings, Chatbot, Admin...
├── service/     -> business logic per domain
├── repository/  -> Spring Data JPA repositories
├── entity/      -> JPA entities
├── dto/         -> request/response DTOs
├── ml/          -> clients for the Python AI/ML microservice
├── external/    -> OpenTripMap, OpenWeather, OSRM, Unsplash, Cloudinary clients
├── websocket/   -> STOMP handlers for group trip collaboration
├── scheduler/   -> cache refresh, trip-status transition jobs
├── security/    -> JWT filter, role guards
└── util/        -> helpers, mappers, QR/e-ticket generator
```

## 🚀 Getting Started

### Prerequisites
- Java 17+, Maven/Gradle
- Node.js 18+
- PostgreSQL, Redis
- Docker & Docker Compose (recommended)
- Python 3.10+ (for the AI/ML microservice)

### Run with Docker (recommended)

```bash
git clone https://github.com/abhaypratapdh1234-netizen/Expedition-X-AI-.git
cd Expedition-X-AI-
docker-compose up --build
```
This spins up: Spring Boot backend + PostgreSQL + Redis + Python ML microservice.

### Run manually

**Backend**
```bash
cd backend
./mvnw spring-boot:run
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

**AI/ML Microservice**
```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload
```
The frontend will be available at `http://localhost:5173`, the backend at `http://localhost:8080`.

## 🔑 Environment Variables

Create a `.env` file in the backend root (never commit this file):

```env
DB_URL=jdbc:postgresql://localhost:5432/expeditionx
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
REDIS_HOST=localhost
REDIS_PORT=6379
OPENTRIPMAP_API_KEY=your_key
OPENWEATHERMAP_API_KEY=your_key
UNSPLASH_ACCESS_KEY=your_key
CLOUDINARY_URL=your_cloudinary_url
EXCHANGERATE_API_KEY=your_key
```

## 🔒 Security

- BCrypt password hashing (strength 12)
- JWT authentication (short-lived access token + refresh token)
- Role-Based Access Control (USER / ADMIN)
- CORS restricted to the frontend origin only
- Input validation & sanitization on every endpoint
- Rate limiting (Bucket4j) on auth, payment, and chatbot endpoints
- File upload validation (type/size limits)
- Secrets managed via environment variables — never hard-coded

## ✅ Testing

- **Unit Testing** — service-layer logic (cost calc, route ordering, sentiment scoring)
- **API Testing** — via Swagger/OpenAPI & Postman
- **Model Validation** — train/validation/test split evaluation for ML models
- **Integration Testing** — end-to-end flow: onboarding -> search -> itinerary -> booking -> payment
- **Load/Cache Testing** — Redis cache hit-rate verification
- **Security Testing** — JWT expiry/refresh, role-guard, rate-limit checks

## 📊 Results

| Metric | Value |
|---|---|
| Cost Estimation Model R² (XGBoost) | ~0.88 |
| Recommendation Precision@5 | ~78% |
| Route Optimization — Time Saved/Day | ~22% |
| Cached API Response Time | < 200ms |

*(Replace with your actual measured results once models are trained and evaluated.)*

## 🔮 Future Work

- Upgrade the chatbot to an LLM-backed conversational assistant
- Train the recommendation engine on larger real-world interaction data
- Extend route optimization to a multi-day, multi-city TSP solver
- Build a React Native mobile app with Live Trip Mode & offline packs
- Integrate a real payment gateway and live hotel/flight inventories

## 📚 References

- Kiritbhai, K.M., Ranpara, R. (2024). *A Comparative Analysis of AI-Based Recommender Algorithms for Travel Search*. Springer.
- *Travel Recommendation Using Content and Collaborative Filtering — A Hybrid Approach*. IEEE, 2021.
- *Intelligent Recommendation Model of Tourist Places using Collaborative Filtering*. Applied Artificial Intelligence, 2023.
- *Tourism Recommendation System Based on User Reviews*. IEEE, 2019.
- *Overview of Personalized Travel Recommendation Systems*. IEEE, 2016.
- [OpenTripMap API](https://opentripmap.io/)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [OSRM — Open Source Routing Machine](https://project-osrm.org/)
