package com.expeditionx.backend.service;

import com.expeditionx.backend.dto.MiscDTOs.*;
import com.expeditionx.backend.entity.*;
import com.expeditionx.backend.exception.ResourceNotFoundException;
import com.expeditionx.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReferralService {
    private final ReferralRepository referralRepo;
    private final UserRepository userRepo;

    public ReferralService(ReferralRepository referralRepo, UserRepository userRepo) {
        this.referralRepo = referralRepo;
        this.userRepo = userRepo;
    }

    public ReferralResponse generateReferral(Long userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        String code = "EXP-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String link = "https://expeditionx.ai/signup?ref=" + code;

        List<ReferralItem> existing = referralRepo.findByReferrerId(userId).stream()
                .map(r -> new ReferralItem(r.getReferredEmail(), r.getStatus().name(),
                        r.getRewardAmount(), r.getCreatedAt().toString()))
                .collect(Collectors.toList());

        return new ReferralResponse(code, link, existing);
    }

    public ReferralResponse getStatus(Long userId) {
        List<ReferralItem> referrals = referralRepo.findByReferrerId(userId).stream()
                .map(r -> new ReferralItem(r.getReferredEmail(), r.getStatus().name(),
                        r.getRewardAmount(), r.getCreatedAt().toString()))
                .collect(Collectors.toList());
        return new ReferralResponse(null, null, referrals);
    }
}
