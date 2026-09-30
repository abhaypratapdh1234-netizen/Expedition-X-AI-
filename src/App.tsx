import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

import { Suspense, lazy, Component, type ErrorInfo, type ReactNode } from 'react'
import { NotFoundPage, ServerErrorPage } from './pages/error/NotFoundPage'

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('ErrorBoundary caught error', error, info) }
  render() {
    if (this.state.hasError) {
      return <NotFoundPage />
    }
    return this.props.children
  }
}


// Layout
import { AppShell } from './components/layout/AppShell'
import { PublicLayout } from './components/layout/PublicLayout'
import { ScrollToTop } from './components/layout/ScrollToTop'
import { PageLoader } from './components/layout/PageLoader'

// Public Pages (Lazy)
const LandingPage = lazy(() => import('./pages/public/LandingPage').then(module => ({ default: module.LandingPage })))
const LoginPage = lazy(() => import('./pages/public/LoginPage').then(module => ({ default: module.LoginPage })))
const SignupPage = lazy(() => import('./pages/public/SignupPage').then(module => ({ default: module.SignupPage })))
const ForgotPasswordPage = lazy(() => import('./pages/public/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })))
const AboutPage = lazy(() => import('./pages/public/AboutPage').then(module => ({ default: module.AboutPage })))
const BlogPage = lazy(() => import('./pages/public/BlogPage').then(module => ({ default: module.BlogPage })))
const BlogPostPage = lazy(() => import('./pages/public/BlogPostPage').then(module => ({ default: module.BlogPostPage })))
const CareersPage = lazy(() => import('./pages/public/CareersPage').then(module => ({ default: module.CareersPage })))
const PressPage = lazy(() => import('./pages/public/PressPage').then(module => ({ default: module.PressPage })))
const PrivacyPolicyPage = lazy(() => import('./pages/public/PrivacyPolicyPage').then(module => ({ default: module.PrivacyPolicyPage })))
const TermsOfServicePage = lazy(() => import('./pages/public/TermsOfServicePage').then(module => ({ default: module.TermsOfServicePage })))
const CookiesPage = lazy(() => import('./pages/public/CookiesPage').then(module => ({ default: module.CookiesPage })))

// App Pages (Lazy)
const Dashboard = lazy(() => import('./pages/app/Dashboard').then(module => ({ default: module.Dashboard })))
const OnboardingWizard = lazy(() => import('./pages/app/OnboardingWizard').then(module => ({ default: module.OnboardingWizard })))
const ExplorePage = lazy(() => import('./pages/app/explore/ExplorePage').then(module => ({ default: module.ExplorePage })))
const SearchResultsPage = lazy(() => import('./pages/app/explore/SearchResultsPage').then(module => ({ default: module.SearchResultsPage })))
const ExploreByTheme = lazy(() => import('./pages/app/explore/ExploreByTheme').then(module => ({ default: module.ExploreByTheme })))
const ExploreByBudget = lazy(() => import('./pages/app/explore/ExploreByBudget').then(module => ({ default: module.ExploreByBudget })))
const PlaceDetailPage = lazy(() => import('./pages/app/explore/PlaceDetailPage').then(module => ({ default: module.PlaceDetailPage })))
const ItineraryBuilder = lazy(() => import('./pages/app/planner/ItineraryBuilder').then(module => ({ default: module.ItineraryBuilder })))
const TripSetupWizard = lazy(() => import('./pages/app/planner/trip-setup-wizard/TripSetupWizard').then(module => ({ default: module.TripSetupWizard })))
const MapGuide = lazy(() => import('./pages/app/planner/MapGuide').then(module => ({ default: module.MapGuide })))
const CostEstimator = lazy(() => import('./pages/app/planner/CostEstimator').then(module => ({ default: module.CostEstimator })))
const GroupTrip = lazy(() => import('./pages/app/planner/GroupTrip').then(module => ({ default: module.GroupTrip })))
const TripComparison = lazy(() => import('./pages/app/planner/TripComparison').then(module => ({ default: module.TripComparison })))
const TripPlannerWorkspace = lazy(() => import('./pages/app/planner/TripPlannerWorkspace').then(module => ({ default: module.TripPlannerWorkspace })))
const FutureCrowdMapPage = lazy(() => import('./pages/app/planner/FutureCrowdMapPage').then(module => ({ default: module.FutureCrowdMapPage })))
const DeadZoneNavigatorPage = lazy(() => import('./pages/app/planner/DeadZoneNavigatorPage').then(module => ({ default: module.DeadZoneNavigatorPage })))
const QuietTourismPage = lazy(() => import('./pages/app/planner/QuietTourismPage').then(module => ({ default: module.QuietTourismPage })))
const MemoryWeightPage = lazy(() => import('./pages/app/planner/MemoryWeightPage').then(module => ({ default: module.MemoryWeightPage })))
const TripIntelligenceMap = lazy(() => import('./pages/app/planner/TripIntelligenceMap').then(module => ({ default: module.TripIntelligenceMap })))
const HotelListing = lazy(() => import('./pages/app/book/HotelListing').then(module => ({ default: module.HotelListing })))
const HotelDetail = lazy(() => import('./pages/app/book/HotelDetail').then(module => ({ default: module.HotelDetail })))
const FlightSearch = lazy(() => import('./pages/app/book/FlightSearch').then(module => ({ default: module.FlightSearch })))
const FlightDetails = lazy(() => import('./pages/app/book/FlightDetails').then(module => ({ default: module.FlightDetails })))
const TicketBooking = lazy(() => import('./pages/app/book/TicketBooking').then(module => ({ default: module.TicketBooking })))
const CheckoutPage = lazy(() => import('./pages/app/book/CheckoutPage').then(module => ({ default: module.CheckoutPage })))
const BookingConfirmation = lazy(() => import('./pages/app/book/BookingConfirmation').then(module => ({ default: module.BookingConfirmation })))
const TripList = lazy(() => import('./pages/app/trips/TripList').then(module => ({ default: module.TripList })))
const TripOverview = lazy(() => import('./pages/app/trips/TripOverview').then(module => ({ default: module.TripOverview })))
const LiveTripMode = lazy(() => import('./pages/app/trips/LiveTripMode').then(module => ({ default: module.LiveTripMode })))
const TripMemories = lazy(() => import('./pages/app/trips/TripMemories').then(module => ({ default: module.TripMemories })))
const MyBookings = lazy(() => import('./pages/app/MyBookings').then(module => ({ default: module.MyBookings })))
const WishlistPage = lazy(() => import('./pages/app/WishlistPage').then(module => ({ default: module.WishlistPage })))
const AIAssistant = lazy(() => import('./pages/app/AIAssistant').then(module => ({ default: module.AIAssistant })))
const ReviewsPage = lazy(() => import('./pages/app/ReviewsPage').then(module => ({ default: module.ReviewsPage })))
const PackingChecklist = lazy(() => import('./pages/app/toolkit/PackingChecklist').then(module => ({ default: module.PackingChecklist })))
const TravelDocuments = lazy(() => import('./pages/app/toolkit/TravelDocuments').then(module => ({ default: module.TravelDocuments })))
const CurrencyConverter = lazy(() => import('./pages/app/toolkit/CurrencyConverter').then(module => ({ default: module.CurrencyConverter })))
const LocalEvents = lazy(() => import('./pages/app/toolkit/LocalEvents').then(module => ({ default: module.LocalEvents })))
const WeatherPage = lazy(() => import('./pages/app/toolkit/WeatherPage').then(module => ({ default: module.WeatherPage })))
const RewardsPage = lazy(() => import('./pages/app/user/RewardsPage').then(module => ({ default: module.RewardsPage })))
const ReferralPage = lazy(() => import('./pages/app/rewards/ReferralPage').then(module => ({ default: module.ReferralPage })))
const NotificationsPage = lazy(() => import('./pages/app/NotificationsPage').then(module => ({ default: module.NotificationsPage })))
const ProfilePage = lazy(() => import('./pages/app/user/ProfilePage').then(module => ({ default: module.ProfilePage })))
const HelpPage = lazy(() => import('./pages/app/HelpPage').then(module => ({ default: module.HelpPage })))
const SupportChat = lazy(() => import('./pages/app/SupportChat').then(module => ({ default: module.SupportChat })))
const AdminDashboard = lazy(() => import('./pages/app/AdminDashboard').then(module => ({ default: module.AdminDashboard })))
const SettingsPage = lazy(() => import('./pages/app/settings/SettingsPage').then(module => ({ default: module.SettingsPage })))
const OfflinePage = lazy(() => import('./pages/error/OfflinePage').then(module => ({ default: module.OfflinePage })))
const InviteJoinPage = lazy(() => import('./pages/InviteJoinPage'))

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/app/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/press" element={<PressPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/cookies" element={<CookiesPage />} />
          </Route>

          {/* Invite Join — publicly accessible (no auth required) */}
          <Route path="/join" element={<InviteJoinPage />} />

          {/* App Routes (Protected) */}
          <Route
            path="/app"
            element={
              <PrivateRoute>
                <AppShell />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="onboarding" element={<OnboardingWizard />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Explore */}
            <Route path="explore" element={<ExplorePage />} />
            <Route path="explore/search" element={<SearchResultsPage />} />
            <Route path="explore/themes" element={<ExploreByTheme />} />
            <Route path="explore/budget" element={<ExploreByBudget />} />
            <Route path="explore/place/:id" element={<PlaceDetailPage />} />

            {/* Trip Planner */}
            <Route path="planner/workspace" element={<Navigate to="/app/planner/setup" replace />} />
            <Route path="planner/setup" element={<TripSetupWizard />} />
            <Route path="planner/itinerary" element={<ItineraryBuilder />} />
            <Route path="planner/map" element={<MapGuide />} />
            <Route path="planner/cost" element={<CostEstimator />} />
            <Route path="planner/group" element={<GroupTrip />} />
            <Route path="planner/compare" element={<TripComparison />} />
            <Route path="crowd-map" element={<FutureCrowdMapPage />} />
            <Route path="dead-zone" element={<DeadZoneNavigatorPage />} />
            <Route path="quiet-tourism" element={<QuietTourismPage />} />
            <Route path="memory-weight" element={<MemoryWeightPage />} />
            <Route path="planner/intelligence" element={<TripIntelligenceMap />} />

            {/* Book */}
            <Route path="flights" element={<FlightSearch />} />
            <Route path="flights/detail" element={<FlightDetails />} />
            <Route path="book/hotels" element={<HotelListing />} />
            <Route path="book/hotels/:id" element={<HotelDetail />} />
            <Route path="book/tickets" element={<TicketBooking />} />
            <Route path="book/checkout" element={<CheckoutPage />} />
            <Route path="book/confirmation" element={<BookingConfirmation />} />

            {/* My Trips */}
            <Route path="trips" element={<TripList />} />
            <Route path="trips/:id" element={<TripOverview />} />
            <Route path="trips/:id/live" element={<LiveTripMode />} />
            <Route path="trips/:id/memories" element={<TripMemories />} />

            {/* Other App Pages */}
            <Route path="bookings" element={<MyBookings />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="assistant" element={<AIAssistant />} />
            <Route path="reviews" element={<ReviewsPage />} />

            {/* Travel Toolkit */}
            <Route path="toolkit/packing" element={<PackingChecklist />} />
            <Route path="toolkit/documents" element={<TravelDocuments />} />
            <Route path="toolkit/currency" element={<CurrencyConverter />} />
            <Route path="toolkit/events" element={<LocalEvents />} />
            <Route path="toolkit/weather" element={<WeatherPage />} />

            {/* Rewards */}
            <Route path="rewards" element={<RewardsPage />} />
            <Route path="rewards/referral" element={<ReferralPage />} />

            {/* Other */}
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="help/chat" element={<SupportChat />} />

            {/* Admin */}
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Route>

          {/* Error Pages */}
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="/offline" element={<OfflinePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
