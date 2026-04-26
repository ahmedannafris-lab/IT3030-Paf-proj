package com.smartcampus.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignTechnicianRequest {

    @NotNull(message = "Actor user id is required")
    private Long actorUserId;

    @NotNull(message = "Technician user id is required")
    private Long technicianUserId;
}
