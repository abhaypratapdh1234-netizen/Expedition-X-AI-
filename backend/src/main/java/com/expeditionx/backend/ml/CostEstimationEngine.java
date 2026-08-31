package com.expeditionx.backend.ml;

import com.expeditionx.backend.dto.TripDTOs.CostBreakdown;
import com.expeditionx.backend.dto.TripDTOs.CostEstimateResponse;
import com.expeditionx.backend.entity.ItineraryItem;
import com.expeditionx.backend.entity.Trip;
import org.springframework.stereotype.Component;

import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Rule-based cost estimation engine with confidence intervals.
 * Estimates total trip cost based on destination, duration, hotel tier, activities.
 */
@Component
public class CostEstimationEngine {

    // Base daily costs by city tier (INR)
    private static final Map<String, Double> CITY_COST_MAP = Map.of(
        "delhi", 3500.0, "mumbai", 4000.0, "goa", 3000.0, "manali", 2500.0,
        "jaipur", 2800.0, "udaipur", 3200.0, "varanasi", 2000.0, "kerala", 3000.0,
        "bangalore", 3500.0, "kolkata", 2500.0
    );

    public CostEstimateResponse estimate(Trip trip, List<ItineraryItem> items) {
        long days = 1;
        if (trip.getStartDate() != null && trip.getEndDate() != null) {
            days = Math.max(1, ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()));
        }

        String dest = trip.getDestinations() != null ? trip.getDestinations().split(",")[0].trim().toLowerCase() : "delhi";
        double baseDailyCost = CITY_COST_MAP.getOrDefault(dest, 3000.0);

        // Activity costs from itinerary
        double activityCost = items.stream()
                .filter(i -> i.getEstimatedCost() != null)
                .mapToDouble(ItineraryItem::getEstimatedCost).sum();
        if (activityCost == 0) activityCost = days * 500; // fallback

        // Accommodation estimate
        double accommodationCost = days * baseDailyCost * 0.5;

        // Food estimate
        double foodCost = days * baseDailyCost * 0.25;

        // Transport estimate
        double transportCost = days * baseDailyCost * 0.15;

        // Miscellaneous
        double miscCost = days * baseDailyCost * 0.1;

        double total = activityCost + accommodationCost + foodCost + transportCost + miscCost;

        // Confidence interval (±15%)
        double low = total * 0.85;
        double high = total * 1.15;
        double confidence = 0.78; // 78% confidence for rule-based

        List<CostBreakdown> breakdown = List.of(
            new CostBreakdown("Activities & Attractions", round(activityCost)),
            new CostBreakdown("Accommodation", round(accommodationCost)),
            new CostBreakdown("Food & Dining", round(foodCost)),
            new CostBreakdown("Transport", round(transportCost)),
            new CostBreakdown("Miscellaneous", round(miscCost))
        );

        return new CostEstimateResponse(round(total), round(low), round(high), confidence, breakdown);
    }

    private double round(double val) { return Math.round(val * 100.0) / 100.0; }
}
