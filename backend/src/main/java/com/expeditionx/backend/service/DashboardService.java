package com.expeditionx.backend.service;

import com.expeditionx.backend.dto.PlaceDTOs.*;
import com.expeditionx.backend.entity.*;
import com.expeditionx.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final TripRepository tripRepo;
    private final BookingRepository bookingRepo;
    private final GamificationProfileRepository gamRepo;
    private final PlaceService placeService;

    public DashboardService(TripRepository tripRepo, BookingRepository bookingRepo,
                            GamificationProfileRepository gamRepo, PlaceService placeService) {
        this.tripRepo = tripRepo;
        this.bookingRepo = bookingRepo;
        this.gamRepo = gamRepo;
        this.placeService = placeService;
    }

    public DashboardSummary getSummary(Long userId) {
        long totalTrips = tripRepo.countByOwnerId(userId);
        // Cities visited = completed trips count (approx)
        long citiesVisited = tripRepo.findByOwnerIdAndStatus(userId, Trip.Status.COMPLETED).size();
        double totalSpent = tripRepo.findByOwnerId(userId).stream()
                .filter(t -> t.getTotalSpent() != null)
                .mapToDouble(Trip::getTotalSpent).sum();

        GamificationProfile gp = gamRepo.findByUserId(userId).orElse(null);
        int level = gp != null ? gp.getLevel() : 1;
        int xp = gp != null ? gp.getXp() : 0;

        List<PlaceResponse> trending = placeService.getTrending();

        // Find draft trip for "continue planning"
        TripSummary continuePlanning = tripRepo.findByOwnerIdAndStatus(userId, Trip.Status.DRAFT)
                .stream().findFirst().map(t -> new TripSummary(
                    t.getId(), t.getTitle(), t.getStatus().name(),
                    t.getStartDate() != null ? t.getStartDate().toString() : null,
                    t.getEndDate() != null ? t.getEndDate().toString() : null,
                    t.getTotalBudget(), t.getCoverImageUrl()
                )).orElse(null);

        return new DashboardSummary(totalTrips, citiesVisited, totalSpent, level, xp,
                trending, List.of(), continuePlanning);
    }
}
