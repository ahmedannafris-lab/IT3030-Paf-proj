package com.smartcampus.dto;

import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.model.AvailabilityWindow;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.util.List;

@Data
public class UpdateResourceRequest {
    private String name;
    private ResourceType type;
    @Min(0)
    private Integer capacity;
    private String location;
    private String description;
    private List<String> tags;
    private String contactPerson;
    private String notes;
    private List<AvailabilityWindow> availabilityWindows;
}