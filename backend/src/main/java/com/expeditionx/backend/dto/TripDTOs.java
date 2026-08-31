package com.expeditionx.backend.dto;

import java.util.List;

// ===== TRIP DTOs =====
public class TripDTOs {

    public record CreateTripRequest(
        String title, String startDate, String endDate,
        Double totalBudget, String coverImageUrl, List<String> destinations
    ) {}

    public record UpdateItineraryRequest(List<ItineraryItemDTO> items) {}

    public record ItineraryItemDTO(
        Long id, Long placeId, String placeName, Integer dayNumber,
        Integer displayOrder, Double estimatedCost, String notes
    ) {}

    public record TripResponse(
        Long id, String title, String status, String startDate, String endDate,
        Double totalBudget, Double totalSpent, String coverImageUrl,
        List<String> destinations, int collaboratorCount,
        List<ItineraryItemDTO> itinerary
    ) {}

    public record TripOverviewResponse(
        TripResponse trip,
        List<ItineraryItemDTO> itinerary,
        List<BookingDTOs.BookingResponse> bookings,
        List<CollaboratorDTO> collaborators,
        List<CostSplitDTO> costSplits,
        double budgetUsedPercent
    ) {}

    public record CollaboratorDTO(
        Long id, Long userId, String name, String email, String role, String avatarUrl
    ) {}

    public record InviteRequest(String email, String role) {}

    public record CostSplitDTO(Long userId, String name, Double share, boolean settled) {}

    public record CostEstimateResponse(
        Double estimatedTotal, Double low, Double high,
        Double confidence, List<CostBreakdown> breakdown
    ) {}

    public record CostBreakdown(String category, Double amount) {}

    public record TransportEstimate(
        Double distanceKm, Double durationMinutes, String mode
    ) {}

    public record TripCompareResponse(
        TripResponse tripA, TripResponse tripB,
        ComparisonMetrics comparison
    ) {}

    public record ComparisonMetrics(
        String cheaperTrip, Double costDifference,
        String shorterTrip, int dayDifference,
        String higherRated
    ) {}

    public record LiveTripResponse(
        TripResponse trip,
        List<ItineraryItemDTO> todayItinerary,
        PlaceDTOs.WeatherInfo currentWeather,
        List<EmergencyContact> emergencyContacts
    ) {}

    public record EmergencyContact(String name, String phone, String type) {}

    public record TripMemoryDTO(
        Long id, String mediaUrl, String mediaType, String caption,
        String uploadedBy, String createdAt
    ) {}
}
