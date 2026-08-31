package com.expeditionx.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "trips", indexes = {
    @Index(name = "idx_trip_owner", columnList = "owner_user_id"),
    @Index(name = "idx_trip_status", columnList = "status")
})
public class Trip {
    public enum Status { DRAFT, UPCOMING, ONGOING, COMPLETED }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "owner_user_id", nullable = false) private User owner;
    @Column(nullable = false) private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    @Enumerated(EnumType.STRING) private Status status = Status.DRAFT;
    private Double totalBudget;
    private Double totalSpent = 0.0;
    private String coverImageUrl;
    private String destinations; // JSON array of destination names
    private LocalDateTime createdAt = LocalDateTime.now();

    public Trip() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public User getOwner() { return owner; } public void setOwner(User owner) { this.owner = owner; }
    public String getTitle() { return title; } public void setTitle(String t) { this.title = t; }
    public LocalDate getStartDate() { return startDate; } public void setStartDate(LocalDate d) { this.startDate = d; }
    public LocalDate getEndDate() { return endDate; } public void setEndDate(LocalDate d) { this.endDate = d; }
    public Status getStatus() { return status; } public void setStatus(Status s) { this.status = s; }
    public Double getTotalBudget() { return totalBudget; } public void setTotalBudget(Double b) { this.totalBudget = b; }
    public Double getTotalSpent() { return totalSpent; } public void setTotalSpent(Double s) { this.totalSpent = s; }
    public String getCoverImageUrl() { return coverImageUrl; } public void setCoverImageUrl(String u) { this.coverImageUrl = u; }
    public String getDestinations() { return destinations; } public void setDestinations(String d) { this.destinations = d; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
