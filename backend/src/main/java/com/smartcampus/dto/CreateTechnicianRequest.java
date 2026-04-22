package com.smartcampus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTechnicianRequest {

    @NotNull(message = "Actor user id is required")
    private Long actorUserId;

    @NotBlank(message = "Technician name is required")
    private String name;

    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Technician password is required")
    private String password;
}