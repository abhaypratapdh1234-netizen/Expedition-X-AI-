package com.expeditionx.backend.repository;

import com.expeditionx.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByPlaceIdOrderByCreatedAtDesc(Long placeId);
    List<Review> findByUserId(Long userId);
    List<Review> findAllByOrderByCreatedAtDesc();

    @Query("SELECT AVG(r.sentimentScore) FROM Review r WHERE r.place.id = :placeId")
    Double getAvgSentimentForPlace(@Param("placeId") Long placeId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.place.id = :placeId AND r.sentimentLabel = 'POSITIVE'")
    Long countPositiveReviews(@Param("placeId") Long placeId);
}
