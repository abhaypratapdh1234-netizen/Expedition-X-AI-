package com.expeditionx.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "referrals")
public class Referral {
    public enum ReferralStatus { INVITED, SIGNED_UP, REWARDED }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "referrer_user_id") private User referrer;
    private String referredEmail;
    private String referralCode;
    @Enumerated(EnumType.STRING) private ReferralStatus status = ReferralStatus.INVITED;
    private Double rewardAmount = 200.0;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Referral() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public User getReferrer() { return referrer; } public void setReferrer(User u) { this.referrer = u; }
    public String getReferredEmail() { return referredEmail; } public void setReferredEmail(String e) { this.referredEmail = e; }
    public String getReferralCode() { return referralCode; } public void setReferralCode(String c) { this.referralCode = c; }
    public ReferralStatus getStatus() { return status; } public void setStatus(ReferralStatus s) { this.status = s; }
    public Double getRewardAmount() { return rewardAmount; } public void setRewardAmount(Double a) { this.rewardAmount = a; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
