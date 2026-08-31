package com.expeditionx.backend.service;

import com.expeditionx.backend.dto.BookingDTOs.*;
import com.expeditionx.backend.entity.*;
import com.expeditionx.backend.exception.BadRequestException;
import com.expeditionx.backend.exception.ResourceNotFoundException;
import com.expeditionx.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepo;
    private final PaymentRepository paymentRepo;
    private final HotelRepository hotelRepo;
    private final PlaceRepository placeRepo;
    private final TripRepository tripRepo;
    private final UserRepository userRepo;

    public BookingService(BookingRepository bookingRepo, PaymentRepository paymentRepo,
                          HotelRepository hotelRepo, PlaceRepository placeRepo,
                          TripRepository tripRepo, UserRepository userRepo) {
        this.bookingRepo = bookingRepo;
        this.paymentRepo = paymentRepo;
        this.hotelRepo = hotelRepo;
        this.placeRepo = placeRepo;
        this.tripRepo = tripRepo;
        this.userRepo = userRepo;
    }

    public BookingResponse bookHotel(Long userId, HotelBookingRequest req) {
        User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Hotel hotel = hotelRepo.findById(req.hotelId()).orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", req.hotelId()));

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setType(Booking.BookingType.HOTEL);
        booking.setReferenceId(hotel.getId());
        booking.setReferenceName(hotel.getName());
        booking.setAmount(hotel.getPricePerNight() * req.rooms());
        booking.setCheckInDate(req.checkIn());
        booking.setCheckOutDate(req.checkOut());
        booking.setGuests(req.guests());
        if (req.tripId() != null) {
            tripRepo.findById(req.tripId()).ifPresent(booking::setTrip);
        }
        booking = bookingRepo.save(booking);
        return toResponse(booking);
    }

    public BookingResponse bookTicket(Long userId, TicketBookingRequest req) {
        User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Place place = placeRepo.findById(req.placeId()).orElseThrow(() -> new ResourceNotFoundException("Place", "id", req.placeId()));

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setType(Booking.BookingType.TICKET);
        booking.setReferenceId(place.getId());
        booking.setReferenceName(place.getName());
        booking.setAmount(place.getAvgCost() != null ? place.getAvgCost() * req.passengers() : 500.0);
        booking.setGuests(req.passengers());
        if (req.tripId() != null) {
            tripRepo.findById(req.tripId()).ifPresent(booking::setTrip);
        }
        booking = bookingRepo.save(booking);
        return toResponse(booking);
    }

    @Transactional
    public PaymentResponse checkout(Long userId, CheckoutRequest req) {
        Booking booking = bookingRepo.findById(req.bookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", req.bookingId()));
        User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        double discount = 0;
        if (req.promoCode() != null && !req.promoCode().isBlank()) {
            // Simple promo logic
            if ("EXPLORE20".equalsIgnoreCase(req.promoCode())) discount = booking.getAmount() * 0.20;
            else if ("FIRST10".equalsIgnoreCase(req.promoCode())) discount = booking.getAmount() * 0.10;
        }

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setUser(user);
        payment.setAmount(booking.getAmount() - discount);
        payment.setMethod(req.method() != null ? req.method() : "UPI");
        payment.setPromoCode(req.promoCode());
        payment.setDiscount(discount);
        payment.setStatus(Payment.PaymentStatus.INITIATED);
        payment.setTransactionRef("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment = paymentRepo.save(payment);

        return toPaymentResponse(payment);
    }

    @Transactional
    public PaymentResponse confirmPayment(Long paymentId) {
        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        // Simulate payment success
        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        paymentRepo.save(payment);

        // Update booking status and generate e-ticket
        Booking booking = payment.getBooking();
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setETicketCode("EXP-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase());
        bookingRepo.save(booking);

        return toPaymentResponse(payment);
    }

    public BookingResponse getBooking(Long id) {
        return toResponse(bookingRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id)));
    }

    public List<BookingResponse> getUserBookings(Long userId, String status) {
        List<Booking> bookings;
        if (status != null && !status.isBlank()) {
            bookings = bookingRepo.findByUserIdAndStatus(userId, Booking.BookingStatus.valueOf(status));
        } else {
            bookings = bookingRepo.findByUserId(userId);
        }
        return bookings.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public InvoiceResponse getInvoice(Long bookingId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        Payment payment = paymentRepo.findByBookingId(bookingId).orElse(null);

        String qrData = "EXPEDITIONX|" + booking.getETicketCode() + "|" + booking.getAmount();
        return new InvoiceResponse(
            toResponse(booking),
            payment != null ? toPaymentResponse(payment) : null,
            booking.getUser().getName(), booking.getUser().getEmail(), qrData
        );
    }

    private BookingResponse toResponse(Booking b) {
        return new BookingResponse(
            b.getId(), b.getType().name(), b.getReferenceName(), b.getReferenceId(),
            b.getStatus().name(), b.getAmount(), b.getETicketCode(),
            b.getBookingDate().toString(), b.getCheckInDate(), b.getCheckOutDate(), b.getGuests()
        );
    }

    private PaymentResponse toPaymentResponse(Payment p) {
        return new PaymentResponse(
            p.getId(), p.getBooking().getId(), p.getAmount(), p.getCurrency(),
            p.getStatus().name(), p.getMethod(), p.getTransactionRef(), p.getDiscount()
        );
    }
}
