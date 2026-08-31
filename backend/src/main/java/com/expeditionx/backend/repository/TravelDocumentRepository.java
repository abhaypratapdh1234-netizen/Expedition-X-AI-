package com.expeditionx.backend.repository;

import com.expeditionx.backend.entity.TravelDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TravelDocumentRepository extends JpaRepository<TravelDocument, Long> {
    List<TravelDocument> findByTripId(Long tripId);
    List<TravelDocument> findByTripIdAndUserId(Long tripId, Long userId);
}
