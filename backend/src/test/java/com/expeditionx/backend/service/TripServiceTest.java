package com.expeditionx.backend.service;

import com.expeditionx.backend.dto.TripDTOs.*;
import com.expeditionx.backend.entity.*;
import com.expeditionx.backend.repository.*;
import com.expeditionx.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TripServiceTest {

    @Mock private TripRepository tripRepo;
    @Mock private ItineraryItemRepository itineraryRepo;
    @Mock private TripCollaboratorRepository collabRepo;
    @Mock private CostSplitRepository costSplitRepo;
    @Mock private BookingRepository bookingRepo;
    @Mock private PlaceRepository placeRepo;
    @Mock private UserRepository userRepo;

    @InjectMocks
    private TripService tripService;

    private User owner;
    private Trip trip;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setName("Abhay");
        owner.setEmail("abhay@example.com");

        trip = new Trip();
        trip.setId(10L);
        trip.setOwner(owner);
        trip.setTitle("Goa Trip");
        trip.setTotalBudget(20000.0);
        trip.setStatus(Trip.Status.UPCOMING);
    }

    // 1. Test create trip success
    @Test
    void testCreateTripSuccess() {
        when(userRepo.findById(1L)).thenReturn(Optional.of(owner));
        when(tripRepo.save(any(Trip.class))).thenReturn(trip);

        CreateTripRequest req = new CreateTripRequest("Goa Trip", "2027-10-10", "2027-10-15", 20000.0, "", List.of("Goa"));
        TripResponse res = tripService.createTrip(1L, req);

        assertNotNull(res);
        assertEquals("Goa Trip", res.title());
        verify(collabRepo, times(1)).save(any());
    }

    // 2. Test create trip user not found
    @Test
    void testCreateTripUserNotFound() {
        when(userRepo.findById(99L)).thenReturn(Optional.empty());
        CreateTripRequest req = new CreateTripRequest("Trip", null, null, 100.0, "", List.of());
        assertThrows(ResourceNotFoundException.class, () -> tripService.createTrip(99L, req));
    }

    // 3. Test get trip success
    @Test
    void testGetTripSuccess() {
        when(tripRepo.findById(10L)).thenReturn(Optional.of(trip));
        TripResponse res = tripService.getTrip(10L);
        assertEquals("Goa Trip", res.title());
    }

    // 4. Test get trip not found
    @Test
    void testGetTripNotFound() {
        when(tripRepo.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> tripService.getTrip(99L));
    }

    // 5. Test get user trips without status filter
    @Test
    void testGetUserTripsNoStatus() {
        when(tripRepo.findByOwnerId(1L)).thenReturn(List.of(trip));
        List<TripResponse> list = tripService.getUserTrips(1L, null);
        assertEquals(1, list.size());
    }

    // 6. Test get user trips with status filter
    @Test
    void testGetUserTripsWithStatus() {
        when(tripRepo.findByOwnerIdAndStatus(1L, Trip.Status.UPCOMING)).thenReturn(List.of(trip));
        List<TripResponse> list = tripService.getUserTrips(1L, "UPCOMING");
        assertEquals(1, list.size());
    }

    // 7. Test get user trips empty
    @Test
    void testGetUserTripsEmpty() {
        when(tripRepo.findByOwnerId(1L)).thenReturn(Collections.emptyList());
        List<TripResponse> list = tripService.getUserTrips(1L, null);
        assertTrue(list.isEmpty());
    }

    // 8. Test update itinerary success
    @Test
    void testUpdateItinerarySuccess() {
        when(tripRepo.findById(10L)).thenReturn(Optional.of(trip));
        when(tripRepo.save(any(Trip.class))).thenReturn(trip);

        ItineraryItemDTO item1 = new ItineraryItemDTO(null, 1L, "Beach", 1, 1, 1000.0, "notes");
        ItineraryItemDTO item2 = new ItineraryItemDTO(null, null, "Custom", 1, 2, 500.0, "notes");
        UpdateItineraryRequest req = new UpdateItineraryRequest(List.of(item1, item2));
        
        TripResponse res = tripService.updateItinerary(10L, req);
        assertEquals(1500.0, trip.getTotalSpent());
        verify(itineraryRepo, times(1)).deleteByTripId(10L);
        verify(itineraryRepo, times(2)).save(any());
    }

    // 9. Test update itinerary trip not found
    @Test
    void testUpdateItineraryTripNotFound() {
        when(tripRepo.findById(10L)).thenReturn(Optional.empty());
        UpdateItineraryRequest req = new UpdateItineraryRequest(List.of());
        assertThrows(ResourceNotFoundException.class, () -> tripService.updateItinerary(10L, req));
    }

    // 10. Test invite collaborator success
    @Test
    void testInviteCollaboratorSuccess() {
        User friend = new User(); friend.setId(2L); friend.setEmail("friend@example.com");
        when(tripRepo.findById(10L)).thenReturn(Optional.of(trip));
        when(userRepo.findByEmail("friend@example.com")).thenReturn(Optional.of(friend));
        
        tripService.inviteCollaborator(10L, "friend@example.com", "VIEWER");
        verify(collabRepo, times(1)).save(any(TripCollaborator.class));
    }

    // 11. Test invite collaborator user not found
    @Test
    void testInviteCollaboratorUserNotFound() {
        when(tripRepo.findById(10L)).thenReturn(Optional.of(trip));
        when(userRepo.findByEmail("friend@example.com")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> tripService.inviteCollaborator(10L, "friend@example.com", "VIEWER"));
    }

    // 12. Test get collaborators
    @Test
    void testGetCollaborators() {
        TripCollaborator collab = new TripCollaborator();
        collab.setId(1L); collab.setUser(owner); collab.setRole(TripCollaborator.CollabRole.OWNER);
        when(collabRepo.findByTripId(10L)).thenReturn(List.of(collab));
        
        List<CollaboratorDTO> res = tripService.getCollaborators(10L);
        assertEquals(1, res.size());
        assertEquals("OWNER", res.get(0).role());
    }

    // 13. Test get cost splits
    @Test
    void testGetCostSplits() {
        CostSplit split = new CostSplit();
        split.setUser(owner); split.setShareAmount(5000.0); split.setSettled(false);
        when(costSplitRepo.findByTripId(10L)).thenReturn(List.of(split));
        
        List<CostSplitDTO> res = tripService.getCostSplits(10L);
        assertEquals(1, res.size());
        assertFalse(res.get(0).settled());
    }

    // 14. Test settle cost split success
    @Test
    void testSettleCostSplitSuccess() {
        CostSplit split = new CostSplit();
        split.setUser(owner); split.setShareAmount(5000.0); split.setSettled(false);
        when(costSplitRepo.findByTripId(10L)).thenReturn(List.of(split));
        
        tripService.settleCostSplit(10L, 1L);
        assertTrue(split.isSettled());
        verify(costSplitRepo, times(1)).save(split);
    }

    // 15. Test settle cost split not found
    @Test
    void testSettleCostSplitNotFound() {
        when(costSplitRepo.findByTripId(10L)).thenReturn(Collections.emptyList());
        assertThrows(ResourceNotFoundException.class, () -> tripService.settleCostSplit(10L, 1L));
    }

    // 16. Test compare trips 
    @Test
    void testCompareTrips() {
        Trip trip2 = new Trip(); trip2.setId(20L); trip2.setTitle("Bali"); trip2.setTotalBudget(15000.0); trip2.setStatus(Trip.Status.UPCOMING);
        when(tripRepo.findById(10L)).thenReturn(Optional.of(trip));
        when(tripRepo.findById(20L)).thenReturn(Optional.of(trip2));
        
        TripCompareResponse res = tripService.compareTrips(10L, 20L);
        assertEquals("Bali", res.comparison().cheaperTrip());
        assertEquals(5000.0, res.comparison().costDifference());
    }

    // 17. Test toResponse with null dates
    @Test
    void testToResponseNullDates() {
        Trip t = new Trip(); t.setId(5L); t.setStatus(Trip.Status.DRAFT);
        TripResponse res = tripService.toResponse(t);
        assertNull(res.startDate());
    }

    // 18. Test toResponse with destinations
    @Test
    void testToResponseWithDestinations() {
        trip.setDestinations("Goa,Mumbai");
        TripResponse res = tripService.toResponse(trip);
        assertEquals(2, res.destinations().size());
    }

    // 19. Test update itinerary empty list
    @Test
    void testUpdateItineraryEmpty() {
        when(tripRepo.findById(10L)).thenReturn(Optional.of(trip));
        when(tripRepo.save(any(Trip.class))).thenReturn(trip);
        
        TripResponse res = tripService.updateItinerary(10L, new UpdateItineraryRequest(List.of()));
        assertEquals(0.0, trip.getTotalSpent());
    }
    
    // 20. Test create trip empty destinations
    @Test
    void testCreateTripEmptyDest() {
        when(userRepo.findById(1L)).thenReturn(Optional.of(owner));
        when(tripRepo.save(any(Trip.class))).thenReturn(trip);

        CreateTripRequest req = new CreateTripRequest("Test", "2027-10-10", "2027-10-15", 20000.0, "", null);
        TripResponse res = tripService.createTrip(1L, req);
        assertNotNull(res);
        assertNull(trip.getDestinations());
    }
}
