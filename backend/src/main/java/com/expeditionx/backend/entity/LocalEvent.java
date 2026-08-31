package com.expeditionx.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity @Table(name = "local_events", indexes = {@Index(name = "idx_event_city", columnList = "city")})
public class LocalEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String city;
    private String country;
    private String name;
    private LocalDate date;
    @Column(columnDefinition = "TEXT") private String description;
    private String source;

    public LocalEvent() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getCity() { return city; } public void setCity(String c) { this.city = c; }
    public String getCountry() { return country; } public void setCountry(String c) { this.country = c; }
    public String getName() { return name; } public void setName(String n) { this.name = n; }
    public LocalDate getDate() { return date; } public void setDate(LocalDate d) { this.date = d; }
    public String getDescription() { return description; } public void setDescription(String d) { this.description = d; }
    public String getSource() { return source; } public void setSource(String s) { this.source = s; }
}
