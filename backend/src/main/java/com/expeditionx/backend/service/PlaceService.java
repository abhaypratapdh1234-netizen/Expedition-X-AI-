package com.expeditionx.backend.service;

import com.expeditionx.backend.dto.PlaceDTOs.*;
import com.expeditionx.backend.entity.Hotel;
import com.expeditionx.backend.entity.Place;
import com.expeditionx.backend.entity.Review;
import com.expeditionx.backend.exception.ResourceNotFoundException;
import com.expeditionx.backend.repository.HotelRepository;
import com.expeditionx.backend.repository.PlaceRepository;
import com.expeditionx.backend.repository.ReviewRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import com.expeditionx.backend.external.*;

@Service
public class PlaceService {

    private final PlaceRepository placeRepo;
    private final HotelRepository hotelRepo;
    private final ReviewRepository reviewRepo;
    private final TimeZoneDbClient timeZoneDbClient;
    private final PixabayClient pixabayClient;
    private final PexelsClient pexelsClient;
    private final UnsplashClient unsplashClient;

    public PlaceService(PlaceRepository placeRepo, HotelRepository hotelRepo, ReviewRepository reviewRepo,
                        TimeZoneDbClient timeZoneDbClient, PixabayClient pixabayClient,
                        PexelsClient pexelsClient, UnsplashClient unsplashClient) {
        this.placeRepo = placeRepo;
        this.hotelRepo = hotelRepo;
        this.reviewRepo = reviewRepo;
        this.timeZoneDbClient = timeZoneDbClient;
        this.pixabayClient = pixabayClient;
        this.pexelsClient = pexelsClient;
        this.unsplashClient = unsplashClient;
    }

    @Cacheable(value = "places", key = "'search:' + #query + ':' + #category")
    public List<PlaceResponse> search(String query, String category) {
        List<Place> places;
        if (query != null && !query.trim().isEmpty() && category != null && !category.trim().isEmpty()) {
            places = placeRepo.searchByQueryAndCategory(query.trim(), category.trim());
        } else if (query != null && !query.trim().isEmpty()) {
            places = placeRepo.searchByQuery(query.trim());
        } else if (category != null && !category.trim().isEmpty()) {
            places = placeRepo.findByCategoryContainingIgnoreCase(category.trim());
        } else {
            places = placeRepo.findAll();
        }
        // Increment search counts for trending
        places.forEach(p -> {
            p.setSearchCount(p.getSearchCount() + 1);
            placeRepo.save(p);
        });
        return places.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Cacheable(value = "trending")
    public List<PlaceResponse> getTrending() {
        return placeRepo.findTop10ByOrderBySearchCountDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<PlaceResponse> getByTheme(String theme) {
        return placeRepo.findByTheme(theme)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<PlaceResponse> getByBudget(Double maxBudget) {
        return placeRepo.findByBudget(maxBudget)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public PlaceDetailResponse getDetail(Long id) {
        Place p = placeRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Place", "id", id));

        // Increment search count
        p.setSearchCount(p.getSearchCount() + 1);
        placeRepo.save(p);

        List<Hotel> nearbyHotels = hotelRepo.findByPlaceId(id);
        List<Review> reviews = reviewRepo.findByPlaceIdOrderByCreatedAtDesc(id);

        Long positiveCount = reviewRepo.countPositiveReviews(id);
        double sentPct = reviews.isEmpty() ? 0 : (positiveCount * 100.0 / reviews.size());

        List<PlaceResponse> touristPlaces = placeRepo.findByCityContainingIgnoreCase(p.getCity())
            .stream()
            .filter(tp -> !tp.getId().equals(p.getId()))
            .limit(5)
            .map(this::toResponse)
            .collect(Collectors.toList());

        return new PlaceDetailResponse(
            p.getId(), p.getName(), p.getCity(), p.getCountry(), p.getState(),
            p.getCategory(), p.getDescription(), p.getLatitude(), p.getLongitude(),
            p.getAvgCost(), p.getImageUrl(), p.getRating(), p.getReviewCount(),
            p.getBestTime(), p.getSafetyAdvisory(),
            null, // Weather filled by controller via external API
            nearbyHotels.stream().map(h -> new HotelSummary(
                h.getId(), h.getName(), h.getPricePerNight(), h.getRating(), h.getImageUrl(), h.getCategory()
            )).collect(Collectors.toList()),
            reviews.stream().limit(5).map(r -> new ReviewSummary(
                r.getId(), r.getUser().getName(), r.getRating(), r.getComment(),
                r.getSentimentLabel(), r.getCreatedAt().toString()
            )).collect(Collectors.toList()),
            sentPct,
            touristPlaces
        );
    }

    public PlaceResponse toResponse(Place p) {
        return new PlaceResponse(
            p.getId(), p.getName(), p.getCity(), p.getCountry(), p.getState(),
            p.getCategory(), p.getDescription(), p.getLatitude(), p.getLongitude(),
            p.getAvgCost(), p.getImageUrl(), p.getRating(), p.getReviewCount(),
            p.getBestTime(), p.getSafetyAdvisory(), p.isTrending()
        );
    }

    public String getTimezone(Long id) {
        Place p = placeRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Place", "id", id));
        return timeZoneDbClient.getTimeZoneByPosition(p.getLatitude(), p.getLongitude());
    }

    public String getMegaGallery(Long id, int page, int pageSize) {
        Place p = placeRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Place", "id", id));
        
        // This is a naive aggregation. In a real app we'd deserialize, interleave, and reserialize.
        // For now, we fetch from Pixabay and Pexels. Unsplash is already hit elsewhere but we can include it.
        String pixabayRes = pixabayClient.searchPhotos(p.getName(), pageSize / 2);
        String pexelsRes = pexelsClient.searchPhotos(p.getName(), pageSize / 2);
        
        // Returning a combined JSON string manually for simplicity.
        return "{\"pixabay\": " + pixabayRes + ", \"pexels\": " + pexelsRes + "}";
    }

}
