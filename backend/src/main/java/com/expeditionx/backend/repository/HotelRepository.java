package com.expeditionx.backend.repository;

import com.expeditionx.backend.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface HotelRepository extends JpaRepository<Hotel, Long> {
    List<Hotel> findByPlaceId(Long placeId);

    @Query("SELECT h FROM Hotel h WHERE " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(h.latitude)) * " +
           "cos(radians(h.longitude) - radians(:lng)) + sin(radians(:lat)) * " +
           "sin(radians(h.latitude)))) < :radiusKm ORDER BY h.rating DESC")
    List<Hotel> findNearby(@Param("lat") double lat, @Param("lng") double lng, @Param("radiusKm") double radiusKm);
}
