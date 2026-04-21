package com.smartcampus.dto;

import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.model.AvailabilityWindow;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ResourceDto {
    private String id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private ResourceStatus status;
    private String description;
    private String imageUrl;
    private List<String> tags;
    private String contactPerson;
    private String notes; // Typically omitted if public only, but prompt says "includes internal notes if needed"
    private List<AvailabilityWindow> availabilityWindows;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}