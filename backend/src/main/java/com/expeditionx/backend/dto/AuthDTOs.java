package com.expeditionx.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// ===== AUTH DTOs =====
public class AuthDTOs {

    public record SignupRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6) String password
    ) {}

    public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
    ) {}

    public record AuthResponse(
        Long userId,
        String name,
        String email,
        String role,
        String accessToken,
        String refreshToken,
        boolean onboardingCompleted,
        String avatarUrl
    ) {}

    public record RefreshRequest(@NotBlank String refreshToken) {}

    public record ForgotPasswordRequest(@NotBlank @Email String email) {}

    public record ResetPasswordRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 6) String newPassword
    ) {}

    public record VerifyOtpRequest(
        @NotBlank @Email String email,
        @NotBlank String otp
    ) {}

    public record MessageResponse(String message) {}
}
