package com.expeditionx.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "support_tickets")
public class SupportTicket {
    public enum TicketStatus { OPEN, IN_PROGRESS, RESOLVED }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user;
    private String subject;
    @Column(columnDefinition = "TEXT") private String message;
    @Enumerated(EnumType.STRING) private TicketStatus status = TicketStatus.OPEN;
    private LocalDateTime createdAt = LocalDateTime.now();

    public SupportTicket() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public User getUser() { return user; } public void setUser(User u) { this.user = u; }
    public String getSubject() { return subject; } public void setSubject(String s) { this.subject = s; }
    public String getMessage() { return message; } public void setMessage(String m) { this.message = m; }
    public TicketStatus getStatus() { return status; } public void setStatus(TicketStatus s) { this.status = s; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
