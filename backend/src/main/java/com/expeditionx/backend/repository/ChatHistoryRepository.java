package com.expeditionx.backend.repository;

import com.expeditionx.backend.entity.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    List<ChatHistory> findByUserIdOrderByTimestampDesc(Long userId);
    List<ChatHistory> findTop20ByUserIdOrderByTimestampDesc(Long userId);
}
