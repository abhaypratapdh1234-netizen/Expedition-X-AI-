package com.expeditionx.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "payments")
public class Payment {
    public enum PaymentStatus { INITIATED, SUCCESS, FAILED, REFUNDED }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "booking_id") private Booking booking;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user;
    private Double amount;
    private String currency = "INR";
    @Enumerated(EnumType.STRING) private PaymentStatus status = PaymentStatus.INITIATED;
    private String method; // UPI, Card, Wallet
    private String transactionRef;
    private String promoCode;
    private Double discount = 0.0;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Payment() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Booking getBooking() { return booking; } public void setBooking(Booking b) { this.booking = b; }
    public User getUser() { return user; } public void setUser(User u) { this.user = u; }
    public Double getAmount() { return amount; } public void setAmount(Double a) { this.amount = a; }
    public String getCurrency() { return currency; } public void setCurrency(String c) { this.currency = c; }
    public PaymentStatus getStatus() { return status; } public void setStatus(PaymentStatus s) { this.status = s; }
    public String getMethod() { return method; } public void setMethod(String m) { this.method = m; }
    public String getTransactionRef() { return transactionRef; } public void setTransactionRef(String r) { this.transactionRef = r; }
    public String getPromoCode() { return promoCode; } public void setPromoCode(String p) { this.promoCode = p; }
    public Double getDiscount() { return discount; } public void setDiscount(Double d) { this.discount = d; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
