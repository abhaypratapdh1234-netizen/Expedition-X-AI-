package com.expeditionx.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "places", indexes = {
    @Index(name = "idx_place_city", columnList = "city"),
    @Index(name = "idx_place_category", columnList = "category"),
    @Index(name = "idx_place_country", columnList = "country")
})
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String country;

    private String category; // Historical, Adventure, Beach, etc.

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double latitude;
    private Double longitude;

    private Double avgCost; // Average cost per day
    private String imageUrl;
    private Double rating;
    private Integer reviewCount = 0;
    private String bestTime; // Best time to visit
    private String state;

    @Column(columnDefinition = "TEXT")
    private String safetyAdvisory;

    private boolean trending = false;
    private Long searchCount = 0L; // For trending calculation

    // Constructors
    public Place() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Double getAvgCost() { return avgCost; }
    public void setAvgCost(Double avgCost) { this.avgCost = avgCost; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    public String getBestTime() { return bestTime; }
    public void setBestTime(String bestTime) { this.bestTime = bestTime; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getSafetyAdvisory() { return safetyAdvisory; }
    public void setSafetyAdvisory(String safetyAdvisory) { this.safetyAdvisory = safetyAdvisory; }
    public boolean isTrending() { return trending; }
    public void setTrending(boolean trending) { this.trending = trending; }
    public Long getSearchCount() { return searchCount; }
    public void setSearchCount(Long searchCount) { this.searchCount = searchCount; }
}
