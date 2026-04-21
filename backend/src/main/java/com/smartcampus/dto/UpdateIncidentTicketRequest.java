package com.smartcampus.dto;

import com.smartcampus.enums.TicketPriority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateIncidentTicketRequest {

    @NotNull(message = "Actor user id is required")
    private Long actorUserId;

    @NotBlank(message = "Resource or location is required")
    @Size(max = 200, message = "Resource or location cannot exceed 200 characters")
    private String resourceLocation;

    @NotBlank(message = "Category is required")
    @Size(max = 100, message = "Category cannot exceed 100 characters")
    private String category;

    @NotBlank(message = "Description is required")
    @Size(max = 3000, message = "Description cannot exceed 3000 characters")
    private String description;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotBlank(message = "Preferred contact details are required")
    @Size(max = 500, message = "Preferred contact details cannot exceed 500 characters")
    private String preferredContactDetails;
}
