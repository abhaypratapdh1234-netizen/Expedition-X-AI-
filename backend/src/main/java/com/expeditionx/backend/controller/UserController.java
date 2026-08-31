package com.expeditionx.backend.controller;

import com.expeditionx.backend.dto.MiscDTOs.*;
import com.expeditionx.backend.entity.User;
import com.expeditionx.backend.exception.ResourceNotFoundException;
import com.expeditionx.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getUser(@PathVariable Long id) {
        User u = userRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return ResponseEntity.ok(new UserProfileResponse(
            u.getId(), u.getName(), u.getEmail(), u.getAvatarUrl(),
            u.getRole().name(), u.isOnboardingCompleted(), u.getCreatedAt().toString()
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProfileResponse> updateUser(@PathVariable Long id, @RequestBody UpdateProfileRequest req) {
        User u = userRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        if (req.name() != null) u.setName(req.name());
        if (req.avatarUrl() != null) {
            u.setAvatarUrl(req.avatarUrl().isEmpty() ? null : req.avatarUrl());
        }
        userRepo.save(u);
        return ResponseEntity.ok(new UserProfileResponse(
            u.getId(), u.getName(), u.getEmail(), u.getAvatarUrl(),
            u.getRole().name(), u.isOnboardingCompleted(), u.getCreatedAt().toString()
        ));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<Void> changePassword(@PathVariable Long id, @RequestBody ChangePasswordRequest req) {
        User u = userRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        u.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepo.save(u);
        return ResponseEntity.ok().build();
    }
}
