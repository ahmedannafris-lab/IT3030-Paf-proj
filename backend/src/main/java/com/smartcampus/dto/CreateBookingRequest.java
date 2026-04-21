package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateBookingRequest {
    @NotBlank(message = "Resource not found")
    private String resourceId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Booking purpose is required")
    @Size(max = 200, message = "Purpose cannot exceed 200 characters")
    private String purpose;

    @PositiveOrZero(message = "Expected attendees cannot be negative")
    private Integer expectedAttendees;
}
