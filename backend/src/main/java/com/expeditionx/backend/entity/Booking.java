package com.expeditionx.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings", indexes = {
    @Index(name = "idx_booking_user", columnList = "user_id"),
    @Index(name = "idx_booking_trip", columnList = "trip_id"),
    @Index(name = "idx_booking_status", columnList = "status")
})
public class Booking {
    public enum BookingType { TICKET, HOTEL }
    public enum BookingStatus { PENDING, CONFIRMED, CANCELLED }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "trip_id") private Trip trip;
    @Enumerated(EnumType.STRING) private BookingType type;
    private Long referenceId; // hotelId or placeId
    private String referenceName;
    @Enumerated(EnumType.STRING) private BookingStatus status = BookingStatus.PENDING;
    private Double amount;
    private String eTicketCode;
    private LocalDateTime bookingDate = LocalDateTime.now();
    private String checkInDate;
    private String checkOutDate;
    private Integer guests = 1;

    public Booking() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public User getUser() { return user; } public void setUser(User u) { this.user = u; }
    public Trip getTrip() { return trip; } public void setTrip(Trip t) { this.trip = t; }
    public BookingType getType() { return type; } public void setType(BookingType t) { this.type = t; }
    public Long getReferenceId() { return referenceId; } public void setReferenceId(Long r) { this.referenceId = r; }
    public String getReferenceName() { return referenceName; } public void setReferenceName(String n) { this.referenceName = n; }
    public BookingStatus getStatus() { return status; } public void setStatus(BookingStatus s) { this.status = s; }
    public Double getAmount() { return amount; } public void setAmount(Double a) { this.amount = a; }
    public String getETicketCode() { return eTicketCode; } public void setETicketCode(String c) { this.eTicketCode = c; }
    public LocalDateTime getBookingDate() { return bookingDate; } public void setBookingDate(LocalDateTime d) { this.bookingDate = d; }
    public String getCheckInDate() { return checkInDate; } public void setCheckInDate(String d) { this.checkInDate = d; }
    public String getCheckOutDate() { return checkOutDate; } public void setCheckOutDate(String d) { this.checkOutDate = d; }
    public Integer getGuests() { return guests; } public void setGuests(Integer g) { this.guests = g; }
}
