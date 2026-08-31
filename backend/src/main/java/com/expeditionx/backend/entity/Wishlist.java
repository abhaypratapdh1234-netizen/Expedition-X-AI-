package com.expeditionx.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "wishlists", indexes = {@Index(name = "idx_wishlist_user", columnList = "user_id")})
public class Wishlist {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "place_id") private Place place;
    private LocalDateTime addedAt = LocalDateTime.now();

    public Wishlist() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public User getUser() { return user; } public void setUser(User u) { this.user = u; }
    public Place getPlace() { return place; } public void setPlace(Place p) { this.place = p; }
    public LocalDateTime getAddedAt() { return addedAt; } public void setAddedAt(LocalDateTime t) { this.addedAt = t; }
}
