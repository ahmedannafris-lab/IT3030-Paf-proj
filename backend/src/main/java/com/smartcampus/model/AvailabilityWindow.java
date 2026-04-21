package com.smartcampus.model;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
@Embeddable
public class AvailabilityWindow {
    @Enumerated(EnumType.STRING)
    private DayOfWeek day;          // MONDAY, TUESDAY, ...
    private LocalTime startTime;    // e.g. 08:00
    private LocalTime endTime;      // e.g. 18:00
}