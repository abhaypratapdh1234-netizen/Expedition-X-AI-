package com.expeditionx.backend.entity;

import jakarta.persistence.*;

@Entity @Table(name = "travel_documents")
public class TravelDocument {
    public enum DocType { PASSPORT, VISA, ID, INSURANCE, OTHER }
    public enum DocStatus { PENDING, UPLOADED, VERIFIED }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "trip_id") private Trip trip;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user;
    @Enumerated(EnumType.STRING) private DocType documentType;
    private String fileUrl;
    private String fileName;
    @Enumerated(EnumType.STRING) private DocStatus status = DocStatus.PENDING;

    public TravelDocument() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Trip getTrip() { return trip; } public void setTrip(Trip t) { this.trip = t; }
    public User getUser() { return user; } public void setUser(User u) { this.user = u; }
    public DocType getDocumentType() { return documentType; } public void setDocumentType(DocType d) { this.documentType = d; }
    public String getFileUrl() { return fileUrl; } public void setFileUrl(String u) { this.fileUrl = u; }
    public String getFileName() { return fileName; } public void setFileName(String n) { this.fileName = n; }
    public DocStatus getStatus() { return status; } public void setStatus(DocStatus s) { this.status = s; }
}
