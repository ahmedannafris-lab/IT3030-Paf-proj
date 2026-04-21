package com.smartcampus.dto;

import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.model.AvailabilityWindow;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateResourceRequest {
    @NotBlank
    private String name;
    @NotNull
    private ResourceType type;
    @NotNull
    @Min(0)
    private Integer capacity;
    @NotBlank
    private String location;
    private String description;
    private List<String> tags;
    private String contactPerson;
    private String notes;
    private List<AvailabilityWindow> availabilityWindows;
}