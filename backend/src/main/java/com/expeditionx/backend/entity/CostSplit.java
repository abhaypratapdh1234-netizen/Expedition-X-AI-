package com.expeditionx.backend.entity;

import jakarta.persistence.*;

@Entity @Table(name = "cost_splits")
public class CostSplit {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "trip_id") private Trip trip;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user;
    private Double shareAmount;
    private boolean settled = false;

    public CostSplit() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Trip getTrip() { return trip; } public void setTrip(Trip t) { this.trip = t; }
    public User getUser() { return user; } public void setUser(User u) { this.user = u; }
    public Double getShareAmount() { return shareAmount; } public void setShareAmount(Double a) { this.shareAmount = a; }
    public boolean isSettled() { return settled; } public void setSettled(boolean s) { this.settled = s; }
}
