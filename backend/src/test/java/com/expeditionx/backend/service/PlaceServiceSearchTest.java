package com.expeditionx.backend.service;

import com.expeditionx.backend.dto.PlaceDTOs.PlaceResponse;
import com.expeditionx.backend.entity.Place;
import com.expeditionx.backend.repository.HotelRepository;
import com.expeditionx.backend.repository.PlaceRepository;
import com.expeditionx.backend.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class PlaceServiceSearchTest {

    @Mock
    private PlaceRepository placeRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private PlaceService placeService;

    private Place tajMahal;
    private Place bagaBeach;
    private Place redFort;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        tajMahal = new Place();
        tajMahal.setId(1L);
        tajMahal.setName("Taj Mahal");
        tajMahal.setCity("Agra");
        tajMahal.setState("Uttar Pradesh");
        tajMahal.setCountry("India");
        tajMahal.setCategory("Historical");
        tajMahal.setSearchCount(0L);

        bagaBeach = new Place();
        bagaBeach.setId(2L);
        bagaBeach.setName("Baga Beach");
        bagaBeach.setCity("Goa");
        bagaBeach.setState("Goa");
        bagaBeach.setCountry("India");
        bagaBeach.setCategory("Beach");
        bagaBeach.setSearchCount(0L);

        redFort = new Place();
        redFort.setId(3L);
        redFort.setName("Red Fort");
        redFort.setCity("Delhi");
        redFort.setState("Delhi");
        redFort.setCountry("India");
        redFort.setCategory("Historical");
        redFort.setSearchCount(0L);
    }

    // 1. Empty query and category returns all places
    @Test
    void testSearch_EmptyQueryEmptyCategory() {
        when(placeRepository.findAll()).thenReturn(Arrays.asList(tajMahal, bagaBeach, redFort));
        List<PlaceResponse> results = placeService.search("", "");
        assertEquals(3, results.size());
        verify(placeRepository, times(1)).findAll();
    }

    // 2. Null query and category returns all places
    @Test
    void testSearch_NullQueryNullCategory() {
        when(placeRepository.findAll()).thenReturn(Arrays.asList(tajMahal, bagaBeach, redFort));
        List<PlaceResponse> results = placeService.search(null, null);
        assertEquals(3, results.size());
        verify(placeRepository, times(1)).findAll();
    }

    // 3. Search by exact name matches
    @Test
    void testSearch_ByName() {
        when(placeRepository.searchByQuery("Taj Mahal")).thenReturn(Collections.singletonList(tajMahal));
        List<PlaceResponse> results = placeService.search("Taj Mahal", null);
        assertEquals(1, results.size());
        assertEquals("Taj Mahal", results.get(0).name());
    }

    // 4. Search by partial name matches
    @Test
    void testSearch_ByPartialName() {
        when(placeRepository.searchByQuery("Fort")).thenReturn(Collections.singletonList(redFort));
        List<PlaceResponse> results = placeService.search("Fort", null);
        assertEquals(1, results.size());
        assertEquals("Red Fort", results.get(0).name());
    }

    // 5. Search by exact city matches
    @Test
    void testSearch_ByCity() {
        when(placeRepository.searchByQuery("Agra")).thenReturn(Collections.singletonList(tajMahal));
        List<PlaceResponse> results = placeService.search("Agra", null);
        assertEquals(1, results.size());
        assertEquals("Agra", results.get(0).city());
    }

    // 6. Search by exact state matches
    @Test
    void testSearch_ByState() {
        when(placeRepository.searchByQuery("Goa")).thenReturn(Collections.singletonList(bagaBeach));
        List<PlaceResponse> results = placeService.search("Goa", null);
        assertEquals(1, results.size());
        assertEquals("Goa", results.get(0).state());
    }

    // 7. Search by exact country matches
    @Test
    void testSearch_ByCountry() {
        when(placeRepository.searchByQuery("India")).thenReturn(Arrays.asList(tajMahal, bagaBeach, redFort));
        List<PlaceResponse> results = placeService.search("India", null);
        assertEquals(3, results.size());
    }

    // 8. Search by exact category in query
    @Test
    void testSearch_ByCategoryInQuery() {
        when(placeRepository.searchByQuery("Historical")).thenReturn(Arrays.asList(tajMahal, redFort));
        List<PlaceResponse> results = placeService.search("Historical", null);
        assertEquals(2, results.size());
    }

    // 9. Search with only category parameter
    @Test
    void testSearch_OnlyCategoryParam() {
        when(placeRepository.findByCategoryContainingIgnoreCase("Beach")).thenReturn(Collections.singletonList(bagaBeach));
        List<PlaceResponse> results = placeService.search(null, "Beach");
        assertEquals(1, results.size());
        assertEquals("Baga Beach", results.get(0).name());
    }

    // 10. Search with both query and category parameters
    @Test
    void testSearch_QueryAndCategory() {
        when(placeRepository.searchByQueryAndCategory("Delhi", "Historical")).thenReturn(Collections.singletonList(redFort));
        List<PlaceResponse> results = placeService.search("Delhi", "Historical");
        assertEquals(1, results.size());
        assertEquals("Red Fort", results.get(0).name());
    }

    // 11. Search with no results found for query
    @Test
    void testSearch_NoResultsQuery() {
        when(placeRepository.searchByQuery("UnknownPlace")).thenReturn(Collections.emptyList());
        List<PlaceResponse> results = placeService.search("UnknownPlace", null);
        assertTrue(results.isEmpty());
    }

    // 12. Search with no results found for category
    @Test
    void testSearch_NoResultsCategory() {
        when(placeRepository.findByCategoryContainingIgnoreCase("UnknownCategory")).thenReturn(Collections.emptyList());
        List<PlaceResponse> results = placeService.search(null, "UnknownCategory");
        assertTrue(results.isEmpty());
    }

    // 13. Search increments search count for trending
    @Test
    void testSearch_IncrementsSearchCount() {
        when(placeRepository.searchByQuery("Taj Mahal")).thenReturn(Collections.singletonList(tajMahal));
        placeService.search("Taj Mahal", null);
        verify(placeRepository, times(1)).save(tajMahal);
        assertEquals(1, tajMahal.getSearchCount());
    }

    // 14. Search with whitespace padded query trims string
    @Test
    void testSearch_TrimsQuery() {
        when(placeRepository.searchByQuery("Delhi")).thenReturn(Collections.singletonList(redFort));
        List<PlaceResponse> results = placeService.search("  Delhi  ", null);
        verify(placeRepository, times(1)).searchByQuery("Delhi");
    }

    // 15. Search with whitespace padded category trims string
    @Test
    void testSearch_TrimsCategory() {
        when(placeRepository.findByCategoryContainingIgnoreCase("Historical")).thenReturn(Collections.singletonList(tajMahal));
        List<PlaceResponse> results = placeService.search(null, "  Historical  ");
        verify(placeRepository, times(1)).findByCategoryContainingIgnoreCase("Historical");
    }

    // 16. Search with whitespace padded query and category trims both
    @Test
    void testSearch_TrimsBothQueryAndCategory() {
        when(placeRepository.searchByQueryAndCategory("Delhi", "Historical")).thenReturn(Collections.singletonList(redFort));
        List<PlaceResponse> results = placeService.search(" Delhi ", " Historical ");
        verify(placeRepository, times(1)).searchByQueryAndCategory("Delhi", "Historical");
    }

    // 17. Search with case insensitive query is handled by repository (mocked here)
    @Test
    void testSearch_CaseInsensitiveQuery() {
        when(placeRepository.searchByQuery("tAj maHaL")).thenReturn(Collections.singletonList(tajMahal));
        List<PlaceResponse> results = placeService.search("tAj maHaL", null);
        assertEquals(1, results.size());
    }

    // 18. Search with empty string query but valid category falls back to category only
    @Test
    void testSearch_EmptyQueryValidCategory() {
        when(placeRepository.findByCategoryContainingIgnoreCase("Beach")).thenReturn(Collections.singletonList(bagaBeach));
        List<PlaceResponse> results = placeService.search("   ", "Beach");
        verify(placeRepository, times(1)).findByCategoryContainingIgnoreCase("Beach");
        assertEquals(1, results.size());
    }

    // 19. Search with valid query but empty category string falls back to query only
    @Test
    void testSearch_ValidQueryEmptyCategory() {
        when(placeRepository.searchByQuery("Goa")).thenReturn(Collections.singletonList(bagaBeach));
        List<PlaceResponse> results = placeService.search("Goa", "   ");
        verify(placeRepository, times(1)).searchByQuery("Goa");
        assertEquals(1, results.size());
    }

    // 20. Search with both empty space strings returns all places
    @Test
    void testSearch_WhitespaceStringsReturnAll() {
        when(placeRepository.findAll()).thenReturn(Arrays.asList(tajMahal, bagaBeach, redFort));
        List<PlaceResponse> results = placeService.search("   ", "   ");
        verify(placeRepository, times(1)).findAll();
        assertEquals(3, results.size());
    }
}
