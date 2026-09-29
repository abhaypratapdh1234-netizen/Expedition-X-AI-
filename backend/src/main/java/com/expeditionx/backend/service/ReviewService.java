package com.expeditionx.backend.service;

import com.expeditionx.backend.dto.MiscDTOs.*;
import com.expeditionx.backend.entity.*;
import com.expeditionx.backend.exception.ResourceNotFoundException;
import com.expeditionx.backend.ml.SentimentAnalyzer;
import com.expeditionx.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepo;
    private final UserRepository userRepo;
    private final PlaceRepository placeRepo;
    private final SentimentAnalyzer sentimentAnalyzer;

    public ReviewService(ReviewRepository reviewRepo, UserRepository userRepo,
                         PlaceRepository placeRepo, SentimentAnalyzer sentimentAnalyzer) {
        this.reviewRepo = reviewRepo;
        this.userRepo = userRepo;
        this.placeRepo = placeRepo;
        this.sentimentAnalyzer = sentimentAnalyzer;
    }

    @Transactional
    public ReviewResponse createReview(Long userId, CreateReviewRequest req) {
        User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Place place = null;
        if (req.placeId() != null && req.placeId() != 999999999L) {
            place = placeRepo.findById(req.placeId()).orElseThrow(() -> new ResourceNotFoundException("Place", "id", req.placeId()));
        }

        // Run sentiment analysis
        var sentiment = sentimentAnalyzer.analyze(req.comment());

        Review review = new Review();
        review.setUser(user);
        review.setPlace(place);
        review.setRating(req.rating());
        review.setComment(req.comment());
        review.setSentimentScore(sentiment.score());
        review.setSentimentLabel(sentiment.label());
        review.setPhotos(req.photos() != null ? String.join(",", req.photos()) : null);
        review = reviewRepo.save(review);

        // Update place review count and avg rating
        if (place != null) {
            place.setReviewCount(place.getReviewCount() + 1);
            placeRepo.save(place);
        }

        return toResponse(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getPlaceReviews(Long placeId) {
        return reviewRepo.findByPlaceIdOrderByCreatedAtDesc(placeId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllGlobalReviews() {
        return reviewRepo.findAllByOrderByCreatedAtDesc().stream()
                .limit(50) // Limit to top 50 recent reviews
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void upvote(Long reviewId) {
        upvote(reviewId, false);
    }

    @Transactional
    public void upvote(Long reviewId, boolean undo) {
        Review r = reviewRepo.findById(reviewId).orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        int current = r.getUpvotes() != null ? r.getUpvotes() : 0;
        if (undo) {
            r.setUpvotes(Math.max(0, current - 1));
        } else {
            r.setUpvotes(current + 1);
        }
        reviewRepo.save(r);
    }

    private ReviewResponse toResponse(Review r) {
        List<String> photos = r.getPhotos() != null ? Arrays.asList(r.getPhotos().split(",")) : List.of();
        String placeName = r.getPlace() != null ? r.getPlace().getName() : "Expedition X AI Platform";
        return new ReviewResponse(r.getId(), r.getUser().getName(), r.getUser().getAvatarUrl(),
                placeName, r.getRating(), r.getComment(),
                r.getSentimentScore(), r.getSentimentLabel(), photos,
                r.getUpvotes(), r.getCreatedAt().toString());
    }
}
