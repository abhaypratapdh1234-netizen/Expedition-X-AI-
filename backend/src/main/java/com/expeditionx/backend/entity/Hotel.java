package com.expeditionx.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "hotels", indexes = {
    @Index(name = "idx_hotel_place", columnList = "place_id")
})
public class Hotel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String name;
    private String location;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    private Place place;
    private Double pricePerNight;
    private Double rating;
    private Integer reviewCount = 0;
    @Column(columnDefinition = "TEXT") private String amenities; // JSON
    private String imageUrl;
    private String category; // Luxury, Business, Hostel, Budget
    private Double latitude;
    private Double longitude;

    public Hotel() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getLocation() { return location; } public void setLocation(String location) { this.location = location; }
    public Place getPlace() { return place; } public void setPlace(Place place) { this.place = place; }
    public Double getPricePerNight() { return pricePerNight; } public void setPricePerNight(Double p) { this.pricePerNight = p; }
    public Double getRating() { return rating; } public void setRating(Double r) { this.rating = r; }
    public Integer getReviewCount() { return reviewCount; } public void setReviewCount(Integer c) { this.reviewCount = c; }
    public String getAmenities() { return amenities; } public void setAmenities(String a) { this.amenities = a; }
    public String getImageUrl() { return imageUrl; } public void setImageUrl(String u) { this.imageUrl = u; }
    public String getCategory() { return category; } public void setCategory(String c) { this.category = c; }
    public Double getLatitude() { return latitude; } public void setLatitude(Double l) { this.latitude = l; }
    public Double getLongitude() { return longitude; } public void setLongitude(Double l) { this.longitude = l; }
}
