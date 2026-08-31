package com.expeditionx.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "itinerary_items", indexes = {
    @Index(name = "idx_itinerary_trip", columnList = "trip_id")
})
public class ItineraryItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "trip_id", nullable = false) private Trip trip;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "place_id") private Place place;
    private Integer dayNumber;
    private Integer displayOrder;
    private Double estimatedCost;
    @Column(columnDefinition = "TEXT") private String notes;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "added_by_user_id") private User addedBy;

    public ItineraryItem() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Trip getTrip() { return trip; } public void setTrip(Trip t) { this.trip = t; }
    public Place getPlace() { return place; } public void setPlace(Place p) { this.place = p; }
    public Integer getDayNumber() { return dayNumber; } public void setDayNumber(Integer d) { this.dayNumber = d; }
    public Integer getDisplayOrder() { return displayOrder; } public void setDisplayOrder(Integer o) { this.displayOrder = o; }
    public Double getEstimatedCost() { return estimatedCost; } public void setEstimatedCost(Double c) { this.estimatedCost = c; }
    public String getNotes() { return notes; } public void setNotes(String n) { this.notes = n; }
    public User getAddedBy() { return addedBy; } public void setAddedBy(User u) { this.addedBy = u; }
}
