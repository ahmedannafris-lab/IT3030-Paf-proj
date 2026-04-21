package com.smartcampus.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.smartcampus.enums.TicketPriority;
import com.smartcampus.enums.TicketStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class IncidentTicketResponse {
    private Long id;
    private Long reporterId;
    private String reporterName;
    private Long assignedTechnicianId;
    private String assignedTechnicianName;
    private String resourceLocation;
    private String category;
    private String description;
    private TicketPriority priority;
    private String preferredContactDetails;
    private TicketStatus status;
    private String rejectionReason;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AttachmentMetadataResponse> attachments;
    private List<TicketCommentResponse> comments;
}
