package com.expeditionx.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "notifications", indexes = {@Index(name = "idx_notif_user", columnList = "user_id")})
public class Notification {
    public enum NotifType { PRICE_DROP, REMINDER, BOOKING_UPDATE, REFERRAL, SYSTEM, REWARD }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user;
    @Enumerated(EnumType.STRING) private NotifType type;
    private String title;
    @Column(columnDefinition = "TEXT") private String message;
    private boolean read = false;
    private String icon;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Notification() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public User getUser() { return user; } public void setUser(User u) { this.user = u; }
    public NotifType getType() { return type; } public void setType(NotifType t) { this.type = t; }
    public String getTitle() { return title; } public void setTitle(String t) { this.title = t; }
    public String getMessage() { return message; } public void setMessage(String m) { this.message = m; }
    public boolean isRead() { return read; } public void setRead(boolean r) { this.read = r; }
    public String getIcon() { return icon; } public void setIcon(String i) { this.icon = i; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
