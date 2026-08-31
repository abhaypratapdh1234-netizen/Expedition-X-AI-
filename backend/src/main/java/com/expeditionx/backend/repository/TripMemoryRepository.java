package com.expeditionx.backend.repository;

import com.expeditionx.backend.entity.TripMemory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TripMemoryRepository extends JpaRepository<TripMemory, Long> {
    List<TripMemory> findByTripIdOrderByCreatedAtDesc(Long tripId);
}
