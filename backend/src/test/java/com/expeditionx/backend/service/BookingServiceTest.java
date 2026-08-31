package com.expeditionx.backend.service;

import com.expeditionx.backend.dto.BookingDTOs.*;
import com.expeditionx.backend.entity.*;
import com.expeditionx.backend.exception.ResourceNotFoundException;
import com.expeditionx.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingServiceTest {

    @Mock private BookingRepository bookingRepo;
    @Mock private UserRepository userRepo;
    @Mock private HotelRepository hotelRepo;
    @Mock private PaymentRepository paymentRepo;
    @Mock private PlaceRepository placeRepo;
    @Mock private TripRepository tripRepo;

    @InjectMocks
    private BookingService bookingService;

    private User user;
    private Hotel hotel;
    private Place place;
    private Booking booking;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setName("Test User");

        hotel = new Hotel();
        hotel.setId(10L);
        hotel.setName("Test Hotel");
        hotel.setPricePerNight(100.0);

        place = new Place();
        place.setId(20L);
        place.setName("Test Place");
        place.setAvgCost(100.0);

        booking = new Booking();
        booking.setId(100L);
        booking.setUser(user);
        booking.setType(Booking.BookingType.HOTEL);
        booking.setAmount(500.0);
        booking.setStatus(Booking.BookingStatus.PENDING);
        booking.setReferenceId(10L);
    }

    @Test
    void testBookHotelSuccess() {
        when(userRepo.findById(1L)).thenReturn(Optional.of(user));
        when(hotelRepo.findById(10L)).thenReturn(Optional.of(hotel));
        when(bookingRepo.save(any(Booking.class))).thenReturn(booking);

        HotelBookingRequest req = new HotelBookingRequest(10L, null, "2024-01-01", "2024-01-03", 2, 1);
        BookingResponse res = bookingService.bookHotel(1L, req);

        assertNotNull(res);
        assertEquals(100L, res.id());
    }

    @Test
    void testBookHotelUserNotFound() {
        when(userRepo.findById(2L)).thenReturn(Optional.empty());
        HotelBookingRequest req = new HotelBookingRequest(10L, null, "2024-01-01", "2024-01-03", 2, 1);
        assertThrows(ResourceNotFoundException.class, () -> bookingService.bookHotel(2L, req));
    }

    @Test
    void testBookHotelHotelNotFound() {
        when(userRepo.findById(1L)).thenReturn(Optional.of(user));
        when(hotelRepo.findById(10L)).thenReturn(Optional.empty());
        HotelBookingRequest req = new HotelBookingRequest(10L, null, "2024-01-01", "2024-01-03", 2, 1);
        assertThrows(ResourceNotFoundException.class, () -> bookingService.bookHotel(1L, req));
    }

    @Test
    void testBookTicketSuccess() {
        when(userRepo.findById(1L)).thenReturn(Optional.of(user));
        when(placeRepo.findById(20L)).thenReturn(Optional.of(place));
        when(bookingRepo.save(any(Booking.class))).thenReturn(booking);

        TicketBookingRequest req = new TicketBookingRequest(20L, null, "2024-01-01", 2);
        BookingResponse res = bookingService.bookTicket(1L, req);

        assertNotNull(res);
        assertEquals(100L, res.id());
    }

    @Test
    void testGetBookingSuccess() {
        when(bookingRepo.findById(100L)).thenReturn(Optional.of(booking));
        BookingResponse res = bookingService.getBooking(100L);
        assertNotNull(res);
        assertEquals(100L, res.id());
    }

    @Test
    void testGetBookingNotFound() {
        when(bookingRepo.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> bookingService.getBooking(99L));
    }

    @Test
    void testGetUserBookingsAll() {
        when(bookingRepo.findByUserId(1L)).thenReturn(List.of(booking));
        List<BookingResponse> res = bookingService.getUserBookings(1L, null);
        assertEquals(1, res.size());
    }

    @Test
    void testGetUserBookingsFiltered() {
        when(bookingRepo.findByUserIdAndStatus(1L, Booking.BookingStatus.PENDING)).thenReturn(List.of(booking));
        List<BookingResponse> res = bookingService.getUserBookings(1L, "PENDING");
        assertEquals(1, res.size());
    }

    @Test
    void testCheckoutSuccess() {
        when(userRepo.findById(1L)).thenReturn(Optional.of(user));
        when(bookingRepo.findById(100L)).thenReturn(Optional.of(booking));
        when(paymentRepo.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));
        
        CheckoutRequest req = new CheckoutRequest(100L, "CREDIT_CARD", "PROMO10");
        PaymentResponse res = bookingService.checkout(1L, req);
        assertNotNull(res);
    }

    @Test
    void testConfirmPaymentSuccess() {
        Payment tx = new Payment();
        tx.setBooking(booking);
        tx.setStatus(Payment.PaymentStatus.INITIATED);
        
        when(paymentRepo.findById(1L)).thenReturn(Optional.of(tx));
        when(paymentRepo.save(any(Payment.class))).thenReturn(tx);
        when(bookingRepo.save(any(Booking.class))).thenReturn(booking);
        
        PaymentResponse res = bookingService.confirmPayment(1L);
        assertNotNull(res);
        assertEquals(Booking.BookingStatus.CONFIRMED, booking.getStatus());
    }

    @Test
    void testGetInvoiceSuccess() {
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        when(bookingRepo.findById(100L)).thenReturn(Optional.of(booking));
        
        Payment payment = new Payment();
        payment.setId(1L);
        payment.setAmount(500.0);
        payment.setBooking(booking);
        when(paymentRepo.findByBookingId(100L)).thenReturn(Optional.of(payment));
        
        InvoiceResponse res = bookingService.getInvoice(100L);
        assertNotNull(res.qrCodeData());
    }

    @Test
    void testBookingResponseMapping() {
        when(bookingRepo.findById(100L)).thenReturn(Optional.of(booking));
        BookingResponse res = bookingService.getBooking(100L);
        assertEquals("HOTEL", res.type());
        assertEquals("PENDING", res.status());
    }

    @Test
    void testGetUserBookingsEmpty() {
        when(bookingRepo.findByUserId(1L)).thenReturn(Collections.emptyList());
        List<BookingResponse> res = bookingService.getUserBookings(1L, null);
        assertTrue(res.isEmpty());
    }

    @Test
    void testBookTicketUserNotFound() {
        when(userRepo.findById(99L)).thenReturn(Optional.empty());
        TicketBookingRequest req = new TicketBookingRequest(20L, null, "2024-01-01", 2);
        assertThrows(ResourceNotFoundException.class, () -> bookingService.bookTicket(99L, req));
    }

    @Test
    void testConfirmPaymentTxNotFound() {
        when(paymentRepo.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> bookingService.confirmPayment(99L));
    }
}
