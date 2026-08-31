package com.expeditionx.backend.controller;

import com.expeditionx.backend.dto.BookingDTOs.*;
import com.expeditionx.backend.dto.PlaceDTOs.HotelSummary;
import com.expeditionx.backend.entity.Hotel;
import com.expeditionx.backend.exception.ResourceNotFoundException;
import com.expeditionx.backend.repository.HotelRepository;
import com.expeditionx.backend.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
public class BookingController {

    private final BookingService bookingService;
    private final HotelRepository hotelRepo;

    public BookingController(BookingService bookingService, HotelRepository hotelRepo) {
        this.bookingService = bookingService;
        this.hotelRepo = hotelRepo;
    }

    // Hotel endpoints
    @GetMapping("/hotels/nearby")
    public ResponseEntity<List<HotelSummary>> getNearbyHotels(@RequestParam Long placeId) {
        return ResponseEntity.ok(hotelRepo.findByPlaceId(placeId).stream()
            .map(h -> new HotelSummary(h.getId(), h.getName(), h.getPricePerNight(), h.getRating(), h.getImageUrl(), h.getCategory()))
            .collect(Collectors.toList()));
    }

    @GetMapping("/hotels/{id}")
    public ResponseEntity<Hotel> getHotel(@PathVariable Long id) {
        return ResponseEntity.ok(hotelRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id)));
    }

    // Booking endpoints
    @PostMapping("/bookings/hotel")
    public ResponseEntity<BookingResponse> bookHotel(Authentication auth, @RequestBody HotelBookingRequest req) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.bookHotel(userId, req));
    }

    @PostMapping("/bookings/ticket")
    public ResponseEntity<BookingResponse> bookTicket(Authentication auth, @RequestBody TicketBookingRequest req) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.bookTicket(userId, req));
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBooking(id));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getUserBookings(Authentication auth, @RequestParam(required = false) String status) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(bookingService.getUserBookings(userId, status));
    }

    @GetMapping("/bookings/{id}/invoice")
    public ResponseEntity<InvoiceResponse> getInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getInvoice(id));
    }

    // Payment endpoints
    @PostMapping("/payments/checkout")
    public ResponseEntity<PaymentResponse> checkout(Authentication auth, @RequestBody CheckoutRequest req) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(bookingService.checkout(userId, req));
    }

    @PostMapping("/payments/{id}/confirm")
    public ResponseEntity<PaymentResponse> confirmPayment(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.confirmPayment(id));
    }
}
