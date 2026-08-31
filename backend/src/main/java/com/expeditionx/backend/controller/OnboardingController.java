package com.expeditionx.backend.controller;

import com.expeditionx.backend.dto.PreferenceDTOs.*;
import com.expeditionx.backend.service.OnboardingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class OnboardingController {

    private final OnboardingService onboardingService;

    public OnboardingController(OnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    @GetMapping("/onboarding/status")
    public ResponseEntity<OnboardingStatusResponse> getStatus(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(new OnboardingStatusResponse(onboardingService.isCompleted(userId)));
    }

    @PostMapping("/onboarding/preferences")
    public ResponseEntity<PreferenceResponse> savePreferences(Authentication auth, @RequestBody OnboardingRequest req) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(onboardingService.savePreferences(userId, req));
    }

    @PutMapping("/preferences/{userId}")
    public ResponseEntity<PreferenceResponse> updatePreferences(@PathVariable Long userId, @RequestBody OnboardingRequest req) {
        return ResponseEntity.ok(onboardingService.updatePreferences(userId, req));
    }
}
