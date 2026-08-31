package com.expeditionx.backend.service;

import com.expeditionx.backend.dto.TripDTOs.*;
import com.expeditionx.backend.entity.*;
import com.expeditionx.backend.exception.ResourceNotFoundException;
import com.expeditionx.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TripService {

    private final TripRepository tripRepo;
    private final ItineraryItemRepository itineraryRepo;
    private final TripCollaboratorRepository collabRepo;
    private final CostSplitRepository costSplitRepo;
    private final BookingRepository bookingRepo;
    private final PlaceRepository placeRepo;
    private final UserRepository userRepo;

    public TripService(TripRepository tripRepo, ItineraryItemRepository itineraryRepo,
                       TripCollaboratorRepository collabRepo, CostSplitRepository costSplitRepo,
                       BookingRepository bookingRepo, PlaceRepository placeRepo, UserRepository userRepo) {
        this.tripRepo = tripRepo;
        this.itineraryRepo = itineraryRepo;
        this.collabRepo = collabRepo;
        this.costSplitRepo = costSplitRepo;
        this.bookingRepo = bookingRepo;
        this.placeRepo = placeRepo;
        this.userRepo = userRepo;
    }

    public TripResponse createTrip(Long userId, CreateTripRequest req) {
        User owner = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Trip trip = new Trip();
        trip.setOwner(owner);
        trip.setTitle(req.title());
        trip.setStartDate(req.startDate() != null ? LocalDate.parse(req.startDate()) : null);
        trip.setEndDate(req.endDate() != null ? LocalDate.parse(req.endDate()) : null);
        trip.setTotalBudget(req.totalBudget());
        trip.setCoverImageUrl(req.coverImageUrl());
        trip.setDestinations(req.destinations() != null ? String.join(",", req.destinations()) : null);
        trip = tripRepo.save(trip);

        // Add owner as collaborator
        TripCollaborator ownerCollab = new TripCollaborator();
        ownerCollab.setTrip(trip);
        ownerCollab.setUser(owner);
        ownerCollab.setRole(TripCollaborator.CollabRole.OWNER);
        ownerCollab.setJoinedAt(LocalDateTime.now());
        collabRepo.save(ownerCollab);

        return toResponse(trip);
    }

    public TripResponse getTrip(Long id) {
        Trip trip = tripRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", id));
        return toResponse(trip);
    }

    public List<TripResponse> getUserTrips(Long userId, String status) {
        List<Trip> trips;
        if (status != null && !status.isEmpty()) {
            trips = tripRepo.findByOwnerIdAndStatus(userId, Trip.Status.valueOf(status));
        } else {
            trips = tripRepo.findByOwnerId(userId);
        }
        return trips.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public TripResponse updateItinerary(Long tripId, UpdateItineraryRequest req) {
        Trip trip = tripRepo.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));
        // Clear existing and re-add
        itineraryRepo.deleteByTripId(tripId);
        for (ItineraryItemDTO dto : req.items()) {
            ItineraryItem item = new ItineraryItem();
            item.setTrip(trip);
            if (dto.placeId() != null) {
                placeRepo.findById(dto.placeId()).ifPresent(item::setPlace);
            }
            item.setDayNumber(dto.dayNumber());
            item.setDisplayOrder(dto.displayOrder());
            item.setEstimatedCost(dto.estimatedCost());
            item.setNotes(dto.notes());
            itineraryRepo.save(item);
        }
        // Update total spent
        double totalCost = req.items().stream()
                .filter(i -> i.estimatedCost() != null)
                .mapToDouble(ItineraryItemDTO::estimatedCost).sum();
        trip.setTotalSpent(totalCost);
        tripRepo.save(trip);
        return toResponse(trip);
    }

    public void inviteCollaborator(Long tripId, String email, String role) {
        Trip trip = tripRepo.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        TripCollaborator collab = new TripCollaborator();
        collab.setTrip(trip);
        collab.setUser(user);
        collab.setRole(TripCollaborator.CollabRole.valueOf(role));
        collabRepo.save(collab);
    }

    public List<CollaboratorDTO> getCollaborators(Long tripId) {
        return collabRepo.findByTripId(tripId).stream().map(c -> new CollaboratorDTO(
            c.getId(), c.getUser().getId(), c.getUser().getName(),
            c.getUser().getEmail(), c.getRole().name(), c.getUser().getAvatarUrl()
        )).collect(Collectors.toList());
    }

    public List<CostSplitDTO> getCostSplits(Long tripId) {
        return costSplitRepo.findByTripId(tripId).stream().map(cs -> new CostSplitDTO(
            cs.getUser().getId(), cs.getUser().getName(), cs.getShareAmount(), cs.isSettled()
        )).collect(Collectors.toList());
    }

    @Transactional
    public void settleCostSplit(Long tripId, Long userId) {
        CostSplit cs = costSplitRepo.findByTripId(tripId).stream()
                .filter(c -> c.getUser().getId().equals(userId))
                .findFirst().orElseThrow(() -> new ResourceNotFoundException("CostSplit not found"));
        cs.setSettled(true);
        costSplitRepo.save(cs);
    }

    public TripCompareResponse compareTrips(Long tripIdA, Long tripIdB) {
        TripResponse a = getTrip(tripIdA);
        TripResponse b = getTrip(tripIdB);
        String cheaper = (a.totalBudget() != null && b.totalBudget() != null)
                ? (a.totalBudget() <= b.totalBudget() ? a.title() : b.title()) : "N/A";
        double costDiff = (a.totalBudget() != null && b.totalBudget() != null)
                ? Math.abs(a.totalBudget() - b.totalBudget()) : 0;
        return new TripCompareResponse(a, b, new ComparisonMetrics(cheaper, costDiff, a.title(), 0, a.title()));
    }

    public TripResponse toResponse(Trip trip) {
        List<ItineraryItemDTO> items = itineraryRepo.findByTripIdOrderByDayNumberAscDisplayOrderAsc(trip.getId())
                .stream().map(i -> new ItineraryItemDTO(
                    i.getId(), i.getPlace() != null ? i.getPlace().getId() : null,
                    i.getPlace() != null ? i.getPlace().getName() : null,
                    i.getDayNumber(), i.getDisplayOrder(), i.getEstimatedCost(), i.getNotes()
                )).collect(Collectors.toList());

        int collabCount = collabRepo.findByTripId(trip.getId()).size();
        List<String> dests = trip.getDestinations() != null
                ? Arrays.asList(trip.getDestinations().split(",")) : List.of();

        return new TripResponse(
            trip.getId(), trip.getTitle(), trip.getStatus().name(),
            trip.getStartDate() != null ? trip.getStartDate().toString() : null,
            trip.getEndDate() != null ? trip.getEndDate().toString() : null,
            trip.getTotalBudget(), trip.getTotalSpent(), trip.getCoverImageUrl(),
            dests, collabCount, items
        );
    }
}
