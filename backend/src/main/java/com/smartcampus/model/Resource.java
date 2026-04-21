package com.smartcampus.model;

import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "resources")
public class Resource {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String name;                    // required, unique

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;              // enum

    private Integer capacity;               // 0 for equipment

    @Column(nullable = false)
    private String location;                // required

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceStatus status;          // ACTIVE or OUT_OF_SERVICE

    @Column(length = 500)
    private String description;             // optional, max 500 chars

    private String imageUrl;                // uploaded image URL

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "resource_tags", joinColumns = @JoinColumn(name = "resource_id"))
    @Column(name = "tag")
    private List<String> tags;              // search keywords

    private String contactPerson;           // who to contact

    @Lob
    private String notes;                   // internal admin notes

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "resource_availability", joinColumns = @JoinColumn(name = "resource_id"))
    private List<AvailabilityWindow> availabilityWindows;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}