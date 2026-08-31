package com.expeditionx.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "trip_collaborators", indexes = {
    @Index(name = "idx_collab_trip", columnList = "trip_id"),
    @Index(name = "idx_collab_user", columnList = "user_id")
})
public class TripCollaborator {
    public enum CollabRole { OWNER, EDITOR, VIEWER }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "trip_id", nullable = false) private Trip trip;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Enumerated(EnumType.STRING) private CollabRole role = CollabRole.VIEWER;
    private LocalDateTime invitedAt = LocalDateTime.now();
    private LocalDateTime joinedAt;

    public TripCollaborator() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Trip getTrip() { return trip; } public void setTrip(Trip t) { this.trip = t; }
    public User getUser() { return user; } public void setUser(User u) { this.user = u; }
    public CollabRole getRole() { return role; } public void setRole(CollabRole r) { this.role = r; }
    public LocalDateTime getInvitedAt() { return invitedAt; } public void setInvitedAt(LocalDateTime t) { this.invitedAt = t; }
    public LocalDateTime getJoinedAt() { return joinedAt; } public void setJoinedAt(LocalDateTime t) { this.joinedAt = t; }
}
