package com.expeditionx.backend.dto;

import java.util.List;

// ===== BOOKING + PAYMENT DTOs =====
public class BookingDTOs {

    public record HotelBookingRequest(
        Long hotelId, Long tripId, String checkIn, String checkOut, Integer guests, Integer rooms
    ) {}

    public record TicketBookingRequest(
        Long placeId, Long tripId, String travelDate, Integer passengers
    ) {}

    public record BookingResponse(
        Long id, String type, String referenceName, Long referenceId,
        String status, Double amount, String eTicketCode,
        String bookingDate, String checkIn, String checkOut, Integer guests
    ) {}

    public record CheckoutRequest(
        Long bookingId, String method, String promoCode
    ) {}

    public record PaymentResponse(
        Long id, Long bookingId, Double amount, String currency,
        String status, String method, String transactionRef, Double discount
    ) {}

    public record InvoiceResponse(
        BookingResponse booking, PaymentResponse payment,
        String userName, String userEmail, String qrCodeData
    ) {}
}
