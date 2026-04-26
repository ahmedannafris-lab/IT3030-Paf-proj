package com.smartcampus.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AttachmentMetadataResponse {
    private Long id;
    private String fileName;
    private String contentType;
    private Long fileSize;
}
