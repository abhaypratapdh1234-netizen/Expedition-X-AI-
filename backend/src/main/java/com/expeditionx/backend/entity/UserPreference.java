package com.expeditionx.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_preferences")
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String interests; // JSON array: ["Adventure","Culture","Food"]

    private String travelStyle; // Solo, Couple, Family, Group

    private Double budgetRangeMin;
    private Double budgetRangeMax;

    private String preferredLanguage = "en";

    @Column(columnDefinition = "TEXT")
    private String accessibilitySettings; // JSON

    // Constructors
    public UserPreference() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getInterests() { return interests; }
    public void setInterests(String interests) { this.interests = interests; }
    public String getTravelStyle() { return travelStyle; }
    public void setTravelStyle(String travelStyle) { this.travelStyle = travelStyle; }
    public Double getBudgetRangeMin() { return budgetRangeMin; }
    public void setBudgetRangeMin(Double budgetRangeMin) { this.budgetRangeMin = budgetRangeMin; }
    public Double getBudgetRangeMax() { return budgetRangeMax; }
    public void setBudgetRangeMax(Double budgetRangeMax) { this.budgetRangeMax = budgetRangeMax; }
    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
    public String getAccessibilitySettings() { return accessibilitySettings; }
    public void setAccessibilitySettings(String accessibilitySettings) { this.accessibilitySettings = accessibilitySettings; }
}
