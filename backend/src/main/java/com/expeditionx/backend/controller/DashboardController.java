package com.expeditionx.backend.controller;

import com.expeditionx.backend.dto.PlaceDTOs.*;
import com.expeditionx.backend.service.DashboardService;
import com.expeditionx.backend.service.PlaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class DashboardController {

    private final DashboardService dashboardService;
    private final PlaceService placeService;

    public DashboardController(DashboardService dashboardService, PlaceService placeService) {
        this.dashboardService = dashboardService;
        this.placeService = placeService;
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<DashboardSummary> getSummary(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(dashboardService.getSummary(userId));
    }

    @GetMapping("/places/trending")
    public ResponseEntity<List<PlaceResponse>> getTrending() {
        return ResponseEntity.ok(placeService.getTrending());
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<PlaceResponse>> getRecommendations(Authentication auth) {
        // For now, return trending as recommendations
        return ResponseEntity.ok(placeService.getTrending());
    }
}
