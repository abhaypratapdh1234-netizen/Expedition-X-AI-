package com.expeditionx.backend.scheduler;

import com.expeditionx.backend.entity.Trip;
import com.expeditionx.backend.repository.TripRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
public class TripStatusTransitionJob {

    private static final Logger log = LoggerFactory.getLogger(TripStatusTransitionJob.class);
    private final TripRepository tripRepo;

    public TripStatusTransitionJob(TripRepository tripRepo) {
        this.tripRepo = tripRepo;
    }

    /**
     * Runs daily at midnight to auto-transition trip statuses:
     * UPCOMING -> ONGOING (when startDate <= today)
     * ONGOING -> COMPLETED (when endDate < today)
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void transitionTripStatuses() {
        LocalDate today = LocalDate.now();
        log.info("Running trip status transition job for date: {}", today);

        // UPCOMING -> ONGOING
        List<Trip> upcomingTrips = tripRepo.findByStartDateBeforeAndStatus(today.plusDays(1), Trip.Status.UPCOMING);
        for (Trip trip : upcomingTrips) {
            trip.setStatus(Trip.Status.ONGOING);
            tripRepo.save(trip);
            log.info("Trip {} transitioned to ONGOING", trip.getId());
        }

        // ONGOING -> COMPLETED
        List<Trip> ongoingTrips = tripRepo.findByEndDateBeforeAndStatus(today, Trip.Status.ONGOING);
        for (Trip trip : ongoingTrips) {
            trip.setStatus(Trip.Status.COMPLETED);
            tripRepo.save(trip);
            log.info("Trip {} transitioned to COMPLETED", trip.getId());
        }
    }
}
