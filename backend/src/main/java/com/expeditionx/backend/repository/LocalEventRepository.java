package com.expeditionx.backend.repository;

import com.expeditionx.backend.entity.LocalEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface LocalEventRepository extends JpaRepository<LocalEvent, Long> {
    List<LocalEvent> findByCityContainingIgnoreCase(String city);
    List<LocalEvent> findByCityContainingIgnoreCaseAndDateBetween(String city, LocalDate from, LocalDate to);
}
