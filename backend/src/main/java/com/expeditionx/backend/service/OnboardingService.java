package com.expeditionx.backend.service;

import com.expeditionx.backend.dto.PreferenceDTOs.*;
import com.expeditionx.backend.entity.User;
import com.expeditionx.backend.entity.UserPreference;
import com.expeditionx.backend.exception.ResourceNotFoundException;
import com.expeditionx.backend.repository.UserPreferenceRepository;
import com.expeditionx.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class OnboardingService {
    private final UserPreferenceRepository prefRepo;
    private final UserRepository userRepo;

    public OnboardingService(UserPreferenceRepository prefRepo, UserRepository userRepo) {
        this.prefRepo = prefRepo;
        this.userRepo = userRepo;
    }

    public boolean isCompleted(Long userId) {
        return userRepo.findById(userId).map(User::isOnboardingCompleted).orElse(false);
    }

    public PreferenceResponse savePreferences(Long userId, OnboardingRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        UserPreference pref = prefRepo.findByUserId(userId).orElse(new UserPreference());
        pref.setUser(user);
        pref.setInterests(req.interests() != null ? String.join(",", req.interests()) : null);
        pref.setTravelStyle(req.travelStyle());
        pref.setBudgetRangeMin(req.budgetMin());
        pref.setBudgetRangeMax(req.budgetMax());
        pref.setPreferredLanguage(req.preferredLanguage());
        prefRepo.save(pref);

        user.setOnboardingCompleted(true);
        userRepo.save(user);

        return toResponse(userId, pref);
    }

    public PreferenceResponse getPreferences(Long userId) {
        UserPreference pref = prefRepo.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Preferences", "userId", userId));
        return toResponse(userId, pref);
    }

    public PreferenceResponse updatePreferences(Long userId, OnboardingRequest req) {
        return savePreferences(userId, req);
    }

    private PreferenceResponse toResponse(Long userId, UserPreference p) {
        List<String> interests = p.getInterests() != null ? Arrays.asList(p.getInterests().split(",")) : List.of();
        return new PreferenceResponse(userId, interests, p.getTravelStyle(),
                p.getBudgetRangeMin(), p.getBudgetRangeMax(), p.getPreferredLanguage());
    }
}
