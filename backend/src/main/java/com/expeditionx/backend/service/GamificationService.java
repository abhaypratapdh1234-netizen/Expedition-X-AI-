package com.expeditionx.backend.service;

import com.expeditionx.backend.dto.MiscDTOs.*;
import com.expeditionx.backend.entity.*;
import com.expeditionx.backend.exception.ResourceNotFoundException;
import com.expeditionx.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GamificationService {
    private final GamificationProfileRepository gamRepo;
    private final UserRepository userRepo;

    public GamificationService(GamificationProfileRepository gamRepo, UserRepository userRepo) {
        this.gamRepo = gamRepo;
        this.userRepo = userRepo;
    }

    public GamificationResponse getProfile(Long userId) {
        GamificationProfile gp = gamRepo.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                    GamificationProfile newGp = new GamificationProfile();
                    newGp.setUser(user);
                    newGp.setBadges("[\"Explorer Newbie\"]");
                    return gamRepo.save(newGp);
                });
        List<String> badges = gp.getBadges() != null
                ? Arrays.asList(gp.getBadges().replace("[", "").replace("]", "").replace("\"", "").split(","))
                : List.of();
        return new GamificationResponse(userId, gp.getXp(), gp.getLevel(), badges);
    }

    public GamificationResponse awardXp(Long userId, int xp, String reason) {
        GamificationProfile gp = gamRepo.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("GamificationProfile", "userId", userId));
        gp.setXp(gp.getXp() + xp);
        // Level up every 500 XP
        gp.setLevel(1 + gp.getXp() / 500);

        // Award badges based on milestones
        List<String> badges = new ArrayList<>(Arrays.asList(
                gp.getBadges().replace("[", "").replace("]", "").replace("\"", "").split(",")));
        if (gp.getXp() >= 500 && !badges.contains("Trailblazer")) badges.add("Trailblazer");
        if (gp.getXp() >= 1000 && !badges.contains("Globetrotter")) badges.add("Globetrotter");
        if (gp.getXp() >= 2000 && !badges.contains("Wanderlust Master")) badges.add("Wanderlust Master");
        if (gp.getXp() >= 5000 && !badges.contains("Expedition Legend")) badges.add("Expedition Legend");
        gp.setBadges("[\"" + String.join("\",\"", badges) + "\"]");

        gamRepo.save(gp);
        return new GamificationResponse(userId, gp.getXp(), gp.getLevel(), badges);
    }
}
