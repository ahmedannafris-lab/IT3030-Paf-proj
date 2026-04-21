package com.smartcampus.dto;

import com.smartcampus.enums.BookingStatus;
import lombok.Data;

@Data
public class UpdateBookingStatusRequest {
    private BookingStatus status;
    private String adminNote;
}
