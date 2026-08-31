package com.expeditionx.backend.repository;

import com.expeditionx.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

// All remaining repositories in one file to reduce file count

public interface TripCollaboratorRepository extends JpaRepository<TripCollaborator, Long> {
    List<TripCollaborator> findByTripId(Long tripId);
    List<TripCollaborator> findByUserId(Long userId);
    Optional<TripCollaborator> findByTripIdAndUserId(Long tripId, Long userId);
}
