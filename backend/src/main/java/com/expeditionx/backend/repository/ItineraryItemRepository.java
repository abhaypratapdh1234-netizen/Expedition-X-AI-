package com.expeditionx.backend.repository;

import com.expeditionx.backend.entity.ItineraryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItineraryItemRepository extends JpaRepository<ItineraryItem, Long> {
    List<ItineraryItem> findByTripIdOrderByDayNumberAscDisplayOrderAsc(Long tripId);
    List<ItineraryItem> findByTripIdAndDayNumberOrderByDisplayOrderAsc(Long tripId, Integer dayNumber);
    void deleteByTripId(Long tripId);
}
