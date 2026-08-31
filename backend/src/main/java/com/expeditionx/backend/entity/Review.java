package com.expeditionx.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "reviews", indexes = {@Index(name = "idx_review_place", columnList = "place_id")})
public class Review {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "place_id") private Place place;
    private Integer rating;
    @Column(columnDefinition = "TEXT") private String comment;
    private Double sentimentScore; // -1.0 to 1.0
    private String sentimentLabel; // POSITIVE, NEGATIVE, NEUTRAL
    @Column(columnDefinition = "TEXT") private String photos; // JSON array of URLs
    private Integer upvotes = 0;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Review() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public User getUser() { return user; } public void setUser(User u) { this.user = u; }
    public Place getPlace() { return place; } public void setPlace(Place p) { this.place = p; }
    public Integer getRating() { return rating; } public void setRating(Integer r) { this.rating = r; }
    public String getComment() { return comment; } public void setComment(String c) { this.comment = c; }
    public Double getSentimentScore() { return sentimentScore; } public void setSentimentScore(Double s) { this.sentimentScore = s; }
    public String getSentimentLabel() { return sentimentLabel; } public void setSentimentLabel(String l) { this.sentimentLabel = l; }
    public String getPhotos() { return photos; } public void setPhotos(String p) { this.photos = p; }
    public Integer getUpvotes() { return upvotes; } public void setUpvotes(Integer u) { this.upvotes = u; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
