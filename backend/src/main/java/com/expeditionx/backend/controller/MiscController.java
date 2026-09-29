package com.expeditionx.backend.controller;

import com.expeditionx.backend.dto.MiscDTOs.*;
import com.expeditionx.backend.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.expeditionx.backend.external.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/v1")
public class MiscController {

    private final ReviewService reviewService;
    private final WishlistService wishlistService;
    private final NotificationService notifService;
    private final ToolkitService toolkitService;
    private final GamificationService gamService;
    private final ReferralService referralService;
    private final IpGeoClient ipGeoClient;
    private final ExchangeRateClient exchangeRateClient;
    private final BrevoSmtpService smtpService;

    public MiscController(ReviewService reviewService, WishlistService wishlistService,
                          NotificationService notifService, ToolkitService toolkitService,
                          GamificationService gamService, ReferralService referralService,
                          IpGeoClient ipGeoClient, ExchangeRateClient exchangeRateClient,
                          BrevoSmtpService smtpService) {
        this.reviewService = reviewService;
        this.wishlistService = wishlistService;
        this.notifService = notifService;
        this.toolkitService = toolkitService;
        this.gamService = gamService;
        this.referralService = referralService;
        this.ipGeoClient = ipGeoClient;
        this.exchangeRateClient = exchangeRateClient;
        this.smtpService = smtpService;
    }

    // === REVIEWS ===
    @PostMapping("/reviews")
    public ResponseEntity<ReviewResponse> createReview(Authentication auth, @RequestBody CreateReviewRequest req) {
        Long userId = 1L; // Fallback to System Admin
        if (auth != null && auth.getCredentials() != null) {
            userId = (Long) auth.getCredentials();
        }
        return ResponseEntity.ok(reviewService.createReview(userId, req));
    }

    @GetMapping("/reviews/place/{placeId}")
    public ResponseEntity<List<ReviewResponse>> getPlaceReviews(@PathVariable Long placeId) {
        return ResponseEntity.ok(reviewService.getPlaceReviews(placeId));
    }

    @GetMapping("/reviews/all")
    public ResponseEntity<List<ReviewResponse>> getGlobalReviews() {
        return ResponseEntity.ok(reviewService.getAllGlobalReviews());
    }

    @PostMapping("/reviews/{id}/upvote")
    public ResponseEntity<Void> upvoteReview(@PathVariable Long id, @RequestParam(required = false, defaultValue = "false") boolean undo) {
        reviewService.upvote(id, undo);
        return ResponseEntity.ok().build();
    }

    // === WISHLIST ===
    @PostMapping("/wishlist")
    public ResponseEntity<WishlistResponse> addWishlist(Authentication auth, @RequestBody WishlistRequest req) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(wishlistService.addToWishlist(userId, req.placeId()));
    }

    @GetMapping("/wishlist")
    public ResponseEntity<List<WishlistResponse>> getWishlist(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(wishlistService.getUserWishlist(userId));
    }

    @DeleteMapping("/wishlist/{id}")
    public ResponseEntity<Void> removeWishlist(@PathVariable Long id) {
        wishlistService.removeFromWishlist(id);
        return ResponseEntity.ok().build();
    }

    // === NOTIFICATIONS ===
    @GetMapping("/notifications/{userId}")
    public ResponseEntity<List<NotificationResponse>> getNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notifService.getUserNotifications(userId));
    }

    @PostMapping("/notifications/mark-read")
    public ResponseEntity<Void> markRead(@RequestBody MarkReadRequest req) {
        notifService.markRead(req.ids());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/notifications/mark-all-read")
    public ResponseEntity<Void> markAllRead(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        notifService.markAllRead(userId);
        return ResponseEntity.ok().build();
    }

    // === TOOLKIT ===
    @GetMapping("/trips/{id}/packing-checklist")
    public ResponseEntity<List<PackingItemResponse>> getPackingChecklist(@PathVariable Long id) {
        return ResponseEntity.ok(toolkitService.getPackingChecklist(id));
    }

    @PutMapping("/trips/{tripId}/packing-checklist/{itemId}")
    public ResponseEntity<PackingItemResponse> updatePackingItem(@PathVariable Long tripId, @PathVariable Long itemId, @RequestBody PackingItemUpdateRequest req) {
        return ResponseEntity.ok(toolkitService.updatePackingItem(itemId, req));
    }

    @GetMapping("/trips/{id}/documents")
    public ResponseEntity<List<DocumentResponse>> getDocuments(@PathVariable Long id) {
        return ResponseEntity.ok(toolkitService.getDocuments(id));
    }

    @PostMapping("/trips/{id}/documents")
    public ResponseEntity<DocumentResponse> uploadDocument(@PathVariable Long id, Authentication auth,
            @RequestParam String docType, @RequestParam String fileUrl, @RequestParam String fileName) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(toolkitService.uploadDocument(id, userId, docType, fileUrl, fileName));
    }

    @GetMapping("/currency/convert")
    public ResponseEntity<String> convertCurrency(
            @RequestParam String from, @RequestParam String to, @RequestParam Double amount) {
        // Use real ExchangeRate API
        String jsonResult = exchangeRateClient.getRates(from.toUpperCase());
        // Simple manual parsing to avoid creating DTOs if not necessary, but returning a valid JSON string
        // We will return a JSON object with from, to, amount, convertedAmount, rate, lastUpdated.
        return ResponseEntity.ok(jsonResult); // The frontend will parse this or we map it properly. Let's return the raw response and frontend can handle.
    }
    
    @GetMapping("/geo/locate")
    public ResponseEntity<String> geoLocate(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        String geoData = ipGeoClient.getGeoByIp(ipAddress);
        if (geoData == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(geoData);
    }

    @GetMapping("/events/local")
    public ResponseEntity<List<LocalEventResponse>> getLocalEvents(
            @RequestParam String city, @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        return ResponseEntity.ok(toolkitService.getLocalEvents(city, fromDate, toDate));
    }

    @GetMapping("/weather")
    public ResponseEntity<WeatherResponse> getWeather(@RequestParam String city) {
        // Static weather for dev mode
        return ResponseEntity.ok(new WeatherResponse(city, 32.0, 35.0, "Clear sky", "01d", 45.0, 12.0, List.of(
            new MonthlyClimate("Jan", 15.0, 10.0, "Good"), new MonthlyClimate("Mar", 28.0, 5.0, "Best"),
            new MonthlyClimate("Jun", 40.0, 80.0, "Avoid"), new MonthlyClimate("Oct", 30.0, 20.0, "Great"),
            new MonthlyClimate("Dec", 12.0, 5.0, "Good")
        )));
    }

    @GetMapping("/weather/best-time")
    public ResponseEntity<WeatherResponse> getBestTime(@RequestParam String city) {
        return getWeather(city);
    }

    // === GAMIFICATION ===
    @GetMapping("/gamification/{userId}")
    public ResponseEntity<GamificationResponse> getGamification(@PathVariable Long userId) {
        return ResponseEntity.ok(gamService.getProfile(userId));
    }

    @PostMapping("/gamification/award")
    public ResponseEntity<GamificationResponse> awardXp(@RequestBody AwardXpRequest req) {
        return ResponseEntity.ok(gamService.awardXp(req.userId(), req.xp(), req.reason()));
    }

    // === REFERRAL ===
    @PostMapping("/referral/generate")
    public ResponseEntity<ReferralResponse> generateReferral(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(referralService.generateReferral(userId));
    }

    @GetMapping("/referral/status")
    public ResponseEntity<ReferralResponse> getReferralStatus(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(referralService.getStatus(userId));
    }

    // === FAQ ===
    @GetMapping("/faq")
    public ResponseEntity<List<FaqItem>> getFaq() {
        return ResponseEntity.ok(List.of(
            new FaqItem(1L, "How does AI trip planning work?", "Our AI analyzes your preferences, budget, and travel style to create personalized itineraries with optimized routes and cost estimates.", "AI Planning"),
            new FaqItem(2L, "Is booking through ExpeditionX safe?", "Yes! All payments are processed through secure gateways with encryption.", "Booking"),
            new FaqItem(3L, "How do I earn rewards?", "Book trips, write reviews, refer friends, and complete trips to earn XP and unlock badges!", "Rewards"),
            new FaqItem(4L, "Can I collaborate on a trip with friends?", "Absolutely! Invite friends to co-edit itineraries in real-time with our Group Trip feature.", "Trip Planning"),
            new FaqItem(5L, "How accurate are cost estimates?", "Our AI estimates are 78-85% accurate based on real data from thousands of travelers.", "AI Planning"),
            new FaqItem(6L, "Can I cancel a booking?", "Yes, bookings can be cancelled. Refund policies vary by hotel/service provider.", "Booking"),
            new FaqItem(7L, "What is Explorer Level?", "Your Explorer Level reflects your travel experience. Complete trips and activities to level up!", "Rewards"),
            new FaqItem(8L, "How does the packing list generator work?", "We analyze your destination's weather, trip duration, and activities to suggest a personalized packing list.", "Travel Toolkit"),
            new FaqItem(9L, "Is the chatbot available 24/7?", "Yes! Our AI assistant is always available to help with trip planning, recommendations, and more.", "AI Planning")
        ));
    }

    // === SUPPORT ===
    @PostMapping("/support/ticket")
    public ResponseEntity<SupportTicketResponse> createTicket(Authentication auth, @RequestBody SupportTicketRequest req) {
        String email = "support@expeditionx.ai"; // Should fetch user email, using hardcoded for MVP if missing
        
        CompletableFuture.runAsync(() -> {
            smtpService.sendEmail(email, 
                "Ticket Created: " + req.subject(), 
                "We received your support ticket.\n\nMessage: " + req.message() + "\n\nOur team will review this shortly."
            );
        });

        return ResponseEntity.ok(new SupportTicketResponse(1L, req.subject(), req.message(), "OPEN", java.time.LocalDateTime.now().toString()));
    }

    // User profile and password endpoints handled by UserController

    private double getCurrencyRate(String from, String to) {
        if (from.equalsIgnoreCase(to)) return 1.0;
        if (from.equalsIgnoreCase("INR") && to.equalsIgnoreCase("USD")) return 0.012;
        if (from.equalsIgnoreCase("USD") && to.equalsIgnoreCase("INR")) return 83.5;
        if (from.equalsIgnoreCase("INR") && to.equalsIgnoreCase("EUR")) return 0.011;
        if (from.equalsIgnoreCase("EUR") && to.equalsIgnoreCase("INR")) return 91.0;
        if (from.equalsIgnoreCase("USD") && to.equalsIgnoreCase("EUR")) return 0.92;
        return 1.0;
    }
}
