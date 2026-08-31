package com.expeditionx.backend.service;

import com.expeditionx.backend.dto.MiscDTOs.*;
import com.expeditionx.backend.entity.*;
import com.expeditionx.backend.exception.ResourceNotFoundException;
import com.expeditionx.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    private final NotificationRepository notifRepo;
    private final UserRepository userRepo;

    public NotificationService(NotificationRepository notifRepo, UserRepository userRepo) {
        this.notifRepo = notifRepo;
        this.userRepo = userRepo;
    }

    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notifRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(n -> new NotificationResponse(n.getId(), n.getType().name(), n.getTitle(),
                    n.getMessage(), n.isRead(), n.getCreatedAt().toString()))
            .collect(Collectors.toList());
    }

    @Transactional
    public void markRead(List<Long> ids) {
        ids.forEach(id -> notifRepo.findById(id).ifPresent(n -> { n.setRead(true); notifRepo.save(n); }));
    }

    @Transactional
    public void markAllRead(Long userId) {
        notifRepo.markAllReadByUserId(userId);
    }

    public void createNotification(Long userId, Notification.NotifType type, String title, String message) {
        User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Notification n = new Notification();
        n.setUser(user);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        notifRepo.save(n);
    }
}
