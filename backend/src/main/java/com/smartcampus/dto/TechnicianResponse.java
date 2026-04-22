package com.smartcampus.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TechnicianResponse {
    private Long id;
    private String name;
    private String email;
    private boolean enabled;
}