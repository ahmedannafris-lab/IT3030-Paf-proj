package com.smartcampus.controller;

import java.util.List;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.smartcampus.dto.AddTicketCommentRequest;
import com.smartcampus.dto.AssignTechnicianRequest;
import com.smartcampus.dto.CreateIncidentTicketRequest;
import com.smartcampus.dto.IncidentTicketResponse;
import com.smartcampus.dto.TicketCommentResponse;
import com.smartcampus.dto.UpdateIncidentTicketRequest;
import com.smartcampus.dto.UpdateTicketCommentRequest;
import com.smartcampus.dto.UpdateTicketStatusRequest;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.model.IncidentAttachment;
import com.smartcampus.service.IncidentTicketService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
@Validated
public class IncidentTicketController {

    private final IncidentTicketService incidentTicketService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<IncidentTicketResponse> createTicket(
            @Valid @ModelAttribute CreateIncidentTicketRequest request,
            @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments) {
        return ResponseEntity.ok(incidentTicketService.createTicket(request, attachments));
    }

    @GetMapping
    public ResponseEntity<List<IncidentTicketResponse>> listTickets(
            @RequestParam Long requesterId,
            @RequestParam(required = false) TicketStatus status) {
        return ResponseEntity.ok(incidentTicketService.listTickets(requesterId, status));
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<IncidentTicketResponse> getTicket(
            @PathVariable Long ticketId,
            @RequestParam Long requesterId) {
        return ResponseEntity.ok(incidentTicketService.getTicket(ticketId, requesterId));
    }

    @PutMapping("/{ticketId}")
    public ResponseEntity<IncidentTicketResponse> updateTicket(
            @PathVariable Long ticketId,
            @Valid @RequestBody UpdateIncidentTicketRequest request) {
        return ResponseEntity.ok(incidentTicketService.updateTicket(ticketId, request));
    }

    @DeleteMapping("/{ticketId}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable Long ticketId,
            @RequestParam Long actorUserId) {
        incidentTicketService.deleteTicket(ticketId, actorUserId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{ticketId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<IncidentTicketResponse> addAttachments(
            @PathVariable Long ticketId,
            @RequestParam Long actorUserId,
            @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments) {
        return ResponseEntity.ok(incidentTicketService.addAttachments(ticketId, actorUserId, attachments));
    }

    @DeleteMapping("/{ticketId}/attachments/{attachmentId}")
    public ResponseEntity<IncidentTicketResponse> deleteAttachment(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId,
            @RequestParam Long actorUserId) {
        return ResponseEntity.ok(incidentTicketService.deleteAttachment(ticketId, attachmentId, actorUserId));
    }

    @PutMapping("/{ticketId}/assign")
    public ResponseEntity<IncidentTicketResponse> assignTechnician(
            @PathVariable Long ticketId,
            @Valid @RequestBody AssignTechnicianRequest request) {
        return ResponseEntity.ok(incidentTicketService.assignTechnician(ticketId, request));
    }

    @PatchMapping("/{ticketId}/status")
    public ResponseEntity<IncidentTicketResponse> updateStatus(
            @PathVariable Long ticketId,
            @Valid @RequestBody UpdateTicketStatusRequest request) {
        return ResponseEntity.ok(incidentTicketService.updateStatus(ticketId, request));
    }

    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<TicketCommentResponse>> listComments(
            @PathVariable Long ticketId,
            @RequestParam Long requesterId) {
        return ResponseEntity.ok(incidentTicketService.listComments(ticketId, requesterId));
    }

    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<TicketCommentResponse> addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody AddTicketCommentRequest request) {
        return ResponseEntity.ok(incidentTicketService.addComment(ticketId, request));
    }

    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<TicketCommentResponse> updateComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @Valid @RequestBody UpdateTicketCommentRequest request) {
        return ResponseEntity.ok(incidentTicketService.updateComment(ticketId, commentId, request));
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @RequestParam Long actorUserId) {
        incidentTicketService.deleteComment(ticketId, commentId, actorUserId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{ticketId}/attachments/{attachmentId}")
    public ResponseEntity<byte[]> downloadAttachment(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId,
            @RequestParam Long requesterId) {
        IncidentAttachment attachment = incidentTicketService.getAttachment(ticketId, attachmentId, requesterId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(attachment.getContentType()));
        headers.setContentDisposition(
                ContentDisposition.inline().filename(attachment.getFileName()).build());

        return ResponseEntity.ok()
                .headers(headers)
                .body(attachment.getData());
    }
}
