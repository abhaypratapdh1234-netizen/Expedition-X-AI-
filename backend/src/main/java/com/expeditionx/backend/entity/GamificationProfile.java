package com.expeditionx.backend.entity;

import jakarta.persistence.*;

@Entity @Table(name = "gamification_profiles")
public class GamificationProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", unique = true) private User user;
    private Integer xp = 0;
    private Integer level = 1;
    @Column(columnDefinition = "TEXT") private String badges; // JSON array

    public GamificationProfile() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public User getUser() { return user; } public void setUser(User u) { this.user = u; }
    public Integer getXp() { return xp; } public void setXp(Integer x) { this.xp = x; }
    public Integer getLevel() { return level; } public void setLevel(Integer l) { this.level = l; }
    public String getBadges() { return badges; } public void setBadges(String b) { this.badges = b; }
}
