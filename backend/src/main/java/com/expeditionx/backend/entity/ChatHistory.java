package com.expeditionx.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "chat_history", indexes = {@Index(name = "idx_chat_user", columnList = "user_id")})
public class ChatHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user;
    @Column(columnDefinition = "TEXT") private String message;
    @Column(columnDefinition = "TEXT") private String response;
    private String intent;
    private LocalDateTime timestamp = LocalDateTime.now();

    public ChatHistory() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public User getUser() { return user; } public void setUser(User u) { this.user = u; }
    public String getMessage() { return message; } public void setMessage(String m) { this.message = m; }
    public String getResponse() { return response; } public void setResponse(String r) { this.response = r; }
    public String getIntent() { return intent; } public void setIntent(String i) { this.intent = i; }
    public LocalDateTime getTimestamp() { return timestamp; } public void setTimestamp(LocalDateTime t) { this.timestamp = t; }
}
