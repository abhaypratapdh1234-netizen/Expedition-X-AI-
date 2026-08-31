package com.expeditionx.backend.repository;

import com.expeditionx.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

// Remaining repositories

public interface PackingChecklistItemRepository extends JpaRepository<PackingChecklistItem, Long> {
    List<PackingChecklistItem> findByTripIdOrderByCategoryAsc(Long tripId);
}
