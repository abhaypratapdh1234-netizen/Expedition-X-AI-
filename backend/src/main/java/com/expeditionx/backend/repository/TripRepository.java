package com.expeditionx.backend.repository;

import com.expeditionx.backend.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByOwnerId(Long userId);
    List<Trip> findByOwnerIdAndStatus(Long userId, Trip.Status status);
    List<Trip> findByStatus(Trip.Status status);
    List<Trip> findByStartDateBeforeAndStatus(LocalDate date, Trip.Status status);
    List<Trip> findByEndDateBeforeAndStatus(LocalDate date, Trip.Status status);
    long countByOwnerId(Long userId);
    long countByStatus(Trip.Status status);
}
