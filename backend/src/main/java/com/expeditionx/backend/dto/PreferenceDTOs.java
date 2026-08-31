package com.expeditionx.backend.dto;

import java.util.List;

// ===== ONBOARDING / PREFERENCE DTOs =====
public class PreferenceDTOs {

    public record OnboardingRequest(
        List<String> interests,
        String travelStyle,
        Double budgetMin,
        Double budgetMax,
        String preferredLanguage
    ) {}

    public record PreferenceResponse(
        Long userId,
        List<String> interests,
        String travelStyle,
        Double budgetMin,
        Double budgetMax,
        String preferredLanguage
    ) {}

    public record OnboardingStatusResponse(boolean completed) {}
}
