package com.expeditionx.backend.repository;

import com.expeditionx.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

// Remaining simple repositories

public interface CostSplitRepository extends JpaRepository<CostSplit, Long> {
    List<CostSplit> findByTripId(Long tripId);
    List<CostSplit> findByTripIdAndSettledFalse(Long tripId);
}
