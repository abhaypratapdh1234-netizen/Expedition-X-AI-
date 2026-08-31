package com.expeditionx.backend.dto;

import java.util.List;
import java.util.Map;

// ===== PLACE DTOs =====
public class PlaceDTOs {

    public record PlaceResponse(
        Long id, String name, String city, String country, String state,
        String category, String description, Double latitude, Double longitude,
        Double avgCost, String imageUrl, Double rating, Integer reviewCount,
        String bestTime, String safetyAdvisory, boolean trending
    ) {}

    public record PlaceDetailResponse(
        Long id, String name, String city, String country, String state,
        String category, String description, Double latitude, Double longitude,
        Double avgCost, String imageUrl, Double rating, Integer reviewCount,
        String bestTime, String safetyAdvisory,
        WeatherInfo weather,
        List<HotelSummary> nearbyHotels,
        List<ReviewSummary> recentReviews,
        Double sentimentPercentage,
        List<PlaceResponse> touristPlaces
    ) {}

    public record WeatherInfo(
        Double temperature, String description, String icon,
        Double humidity, Double windSpeed
    ) {}

    public record HotelSummary(
        Long id, String name, Double pricePerNight, Double rating,
        String imageUrl, String category
    ) {}

    public record ReviewSummary(
        Long id, String userName, Integer rating, String comment,
        String sentimentLabel, String createdAt
    ) {}

    // ===== DASHBOARD DTOs =====
    public record DashboardSummary(
        long totalTrips, long citiesVisited, double totalSpent,
        int explorerLevel, int xp,
        List<PlaceResponse> trendingPlaces,
        List<PlaceResponse> recommendations,
        TripSummary continuePlanning
    ) {}

    public record TripSummary(
        Long id, String title, String status, String startDate,
        String endDate, Double totalBudget, String coverImageUrl
    ) {}
}
