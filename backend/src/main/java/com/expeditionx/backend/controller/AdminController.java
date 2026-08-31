package com.expeditionx.backend.controller;

import com.expeditionx.backend.dto.MiscDTOs.AnalyticsResponse;
import com.expeditionx.backend.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final TripRepository tripRepo;
    private final BookingRepository bookingRepo;
    private final UserRepository userRepo;
    private final PaymentRepository paymentRepo;
    private final PlaceRepository placeRepo;

    public AdminController(TripRepository tripRepo, BookingRepository bookingRepo,
                           UserRepository userRepo, PaymentRepository paymentRepo,
                           PlaceRepository placeRepo) {
        this.tripRepo = tripRepo;
        this.bookingRepo = bookingRepo;
        this.userRepo = userRepo;
        this.paymentRepo = paymentRepo;
        this.placeRepo = placeRepo;
    }

    @GetMapping("/trips")
    public ResponseEntity<AnalyticsResponse> tripAnalytics() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalTrips", tripRepo.count());
        data.put("draftTrips", tripRepo.countByStatus(com.expeditionx.backend.entity.Trip.Status.DRAFT));
        data.put("completedTrips", tripRepo.countByStatus(com.expeditionx.backend.entity.Trip.Status.COMPLETED));
        data.put("ongoingTrips", tripRepo.countByStatus(com.expeditionx.backend.entity.Trip.Status.ONGOING));
        return ResponseEntity.ok(new AnalyticsResponse(data));
    }

    @GetMapping("/destinations")
    public ResponseEntity<AnalyticsResponse> destinationAnalytics() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalPlaces", placeRepo.count());
        data.put("topDestinations", placeRepo.findTop10ByOrderBySearchCountDesc().stream()
            .map(p -> Map.of("name", p.getName(), "city", p.getCity(), "searches", p.getSearchCount()))
            .toList());
        return ResponseEntity.ok(new AnalyticsResponse(data));
    }

    @GetMapping("/revenue")
    public ResponseEntity<AnalyticsResponse> revenueAnalytics() {
        Map<String, Object> data = new HashMap<>();
        Double totalRevenue = paymentRepo.getTotalRevenue();
        data.put("totalRevenue", totalRevenue != null ? totalRevenue : 0);
        data.put("totalBookings", bookingRepo.count());
        data.put("confirmedBookings", bookingRepo.countByStatus(com.expeditionx.backend.entity.Booking.BookingStatus.CONFIRMED));
        return ResponseEntity.ok(new AnalyticsResponse(data));
    }

    @GetMapping("/users")
    public ResponseEntity<AnalyticsResponse> userAnalytics() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalUsers", userRepo.count());
        data.put("newUsersLast30Days", userRepo.countByCreatedAtAfter(
            java.time.LocalDateTime.now().minusDays(30)));
        return ResponseEntity.ok(new AnalyticsResponse(data));
    }
}
