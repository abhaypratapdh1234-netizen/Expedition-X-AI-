package com.expeditionx.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "trip_memories")
public class TripMemory {
    public enum MediaType { IMAGE, VIDEO }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "trip_id") private Trip trip;
    private String mediaUrl;
    @Enumerated(EnumType.STRING) private MediaType mediaType;
    @Column(columnDefinition = "TEXT") private String caption;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "uploaded_by_user_id") private User uploadedBy;
    private LocalDateTime createdAt = LocalDateTime.now();

    public TripMemory() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Trip getTrip() { return trip; } public void setTrip(Trip t) { this.trip = t; }
    public String getMediaUrl() { return mediaUrl; } public void setMediaUrl(String u) { this.mediaUrl = u; }
    public MediaType getMediaType() { return mediaType; } public void setMediaType(MediaType t) { this.mediaType = t; }
    public String getCaption() { return caption; } public void setCaption(String c) { this.caption = c; }
    public User getUploadedBy() { return uploadedBy; } public void setUploadedBy(User u) { this.uploadedBy = u; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
