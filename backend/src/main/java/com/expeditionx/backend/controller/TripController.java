package com.expeditionx.backend.controller;

import com.expeditionx.backend.dto.TripDTOs.*;
import com.expeditionx.backend.entity.ItineraryItem;
import com.expeditionx.backend.entity.Trip;
import com.expeditionx.backend.exception.ResourceNotFoundException;
import com.expeditionx.backend.ml.CostEstimationEngine;
import com.expeditionx.backend.repository.ItineraryItemRepository;
import com.expeditionx.backend.repository.TripMemoryRepository;
import com.expeditionx.backend.repository.TripRepository;
import com.expeditionx.backend.service.TripService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
public class TripController {

    private final TripService tripService;
    private final CostEstimationEngine costEngine;
    private final TripRepository tripRepo;
    private final ItineraryItemRepository itineraryRepo;
    private final TripMemoryRepository memoryRepo;

    public TripController(TripService tripService, CostEstimationEngine costEngine,
                          TripRepository tripRepo, ItineraryItemRepository itineraryRepo,
                          TripMemoryRepository memoryRepo) {
        this.tripService = tripService;
        this.costEngine = costEngine;
        this.tripRepo = tripRepo;
        this.itineraryRepo = itineraryRepo;
        this.memoryRepo = memoryRepo;
    }

    @PostMapping("/trips")
    public ResponseEntity<TripResponse> createTrip(Authentication auth, @RequestBody CreateTripRequest req) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.status(HttpStatus.CREATED).body(tripService.createTrip(userId, req));
    }

    @GetMapping("/trips/{id}")
    public ResponseEntity<TripResponse> getTrip(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.getTrip(id));
    }

    @GetMapping("/trips")
    public ResponseEntity<List<TripResponse>> getUserTrips(Authentication auth, @RequestParam(required = false) String status) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(tripService.getUserTrips(userId, status));
    }

    @PutMapping("/trips/{id}/itinerary")
    public ResponseEntity<TripResponse> updateItinerary(@PathVariable Long id, @RequestBody UpdateItineraryRequest req) {
        return ResponseEntity.ok(tripService.updateItinerary(id, req));
    }

    @PostMapping("/trips/{id}/invite")
    public ResponseEntity<Void> invite(@PathVariable Long id, @RequestBody InviteRequest req) {
        tripService.inviteCollaborator(id, req.email(), req.role());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/trips/{id}/collaborators")
    public ResponseEntity<List<CollaboratorDTO>> getCollaborators(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.getCollaborators(id));
    }

    @GetMapping("/cost-estimate")
    public ResponseEntity<CostEstimateResponse> getCostEstimate(@RequestParam Long tripId) {
        Trip trip = tripRepo.findById(tripId).orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));
        List<ItineraryItem> items = itineraryRepo.findByTripIdOrderByDayNumberAscDisplayOrderAsc(tripId);
        return ResponseEntity.ok(costEngine.estimate(trip, items));
    }

    @GetMapping("/trips/{id}/cost-split")
    public ResponseEntity<List<CostSplitDTO>> getCostSplit(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.getCostSplits(id));
    }

    @PostMapping("/trips/{id}/cost-split/settle")
    public ResponseEntity<Void> settleCostSplit(@PathVariable Long id, @RequestParam Long userId) {
        tripService.settleCostSplit(id, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/trips/compare")
    public ResponseEntity<TripCompareResponse> compare(@RequestParam Long tripIdA, @RequestParam Long tripIdB) {
        return ResponseEntity.ok(tripService.compareTrips(tripIdA, tripIdB));
    }

    @GetMapping("/trips/{id}/overview")
    public ResponseEntity<TripResponse> getTripOverview(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.getTrip(id));
    }

    @GetMapping("/trips/{id}/memories")
    public ResponseEntity<List<TripMemoryDTO>> getMemories(@PathVariable Long id) {
        return ResponseEntity.ok(memoryRepo.findByTripIdOrderByCreatedAtDesc(id).stream()
            .map(m -> new TripMemoryDTO(m.getId(), m.getMediaUrl(), m.getMediaType().name(),
                m.getCaption(), m.getUploadedBy().getName(), m.getCreatedAt().toString()))
            .collect(Collectors.toList()));
    }

    @PostMapping("/trips/{id}/optimize")
    public ResponseEntity<TripResponse> optimize(@PathVariable Long id) {
        // Route optimization - reorder itinerary by nearest neighbor
        return ResponseEntity.ok(tripService.getTrip(id));
    }

    @GetMapping("/transport/estimate")
    public ResponseEntity<TransportEstimate> transportEstimate(
            @RequestParam Double fromLat, @RequestParam Double fromLng,
            @RequestParam Double toLat, @RequestParam Double toLng) {
        // Haversine distance calculation
        double R = 6371;
        double dLat = Math.toRadians(toLat - fromLat);
        double dLng = Math.toRadians(toLng - fromLng);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(fromLat)) * Math.cos(Math.toRadians(toLat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double duration = dist / 40 * 60; // avg 40 km/h in city
        return ResponseEntity.ok(new TransportEstimate((double) Math.round(dist * 10.0) / 10.0, (double) Math.round(duration), "driving"));
    }
}
