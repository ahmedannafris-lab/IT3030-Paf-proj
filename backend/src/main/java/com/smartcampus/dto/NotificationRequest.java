package com.smartcampus.dto;

import com.smartcampus.enums.NotificationType;

import lombok.Data;

@Data
public class NotificationRequest {

    private Long userId;
    private String title;
    private String message;
    private NotificationType type;
}