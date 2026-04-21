package com.smartcampus.dto;

import com.smartcampus.enums.ResourceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResourceStatusChangeRequest {
    @NotNull
    private ResourceStatus status;
}