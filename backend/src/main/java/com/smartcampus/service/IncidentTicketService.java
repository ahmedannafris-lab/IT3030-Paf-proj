package com.smartcampus.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.smartcampus.dto.AddTicketCommentRequest;
import com.smartcampus.dto.AssignTechnicianRequest;
import com.smartcampus.dto.AttachmentMetadataResponse;
import com.smartcampus.dto.CreateIncidentTicketRequest;
import com.smartcampus.dto.IncidentTicketResponse;
import com.smartcampus.dto.TicketCommentResponse;
import com.smartcampus.dto.UpdateIncidentTicketRequest;
import com.smartcampus.dto.UpdateTicketCommentRequest;
import com.smartcampus.dto.UpdateTicketStatusRequest;
import com.smartcampus.enums.Role;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.model.IncidentAttachment;
import com.smartcampus.model.IncidentTicket;
import com.smartcampus.model.TicketComment;
import com.smartcampus.model.User;
import com.smartcampus.repository.IncidentAttachmentRepository;
import com.smartcampus.repository.IncidentTicketRepository;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IncidentTicketService {

    private static final int MAX_ATTACHMENTS = 3;

    private final IncidentTicketRepository incidentTicketRepository;
    private final IncidentAttachmentRepository incidentAttachmentRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final UserRepository userRepository;

    @Transactional
    public IncidentTicketResponse createTicket(CreateIncidentTicketRequest request, List<MultipartFile> attachments) {
        User reporter = getUserOrThrow(request.getReporterId());

        IncidentTicket ticket = IncidentTicket.builder()
                .reporter(reporter)
                .resourceLocation(request.getResourceLocation().trim())
                .category(request.getCategory().trim())
                .description(request.getDescription().trim())
                .priority(request.getPriority())
                .preferredContactDetails(request.getPreferredContactDetails().trim())
                .status(TicketStatus.OPEN)
                .build();

        IncidentTicket savedTicket = incidentTicketRepository.save(ticket);
        addAttachments(savedTicket, attachments);

        return toTicketResponse(savedTicket);
    }

    @Transactional
    public IncidentTicketResponse updateTicket(Long ticketId, UpdateIncidentTicketRequest request) {
        User actor = getUserOrThrow(request.getActorUserId());
        IncidentTicket ticket = getTicketOrThrow(ticketId);

        ensureCanManageTicket(ticket, actor, false);

        ticket.setResourceLocation(request.getResourceLocation().trim());
        ticket.setCategory(request.getCategory().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setPriority(request.getPriority());
        ticket.setPreferredContactDetails(request.getPreferredContactDetails().trim());

        IncidentTicket savedTicket = incidentTicketRepository.save(ticket);
        return toTicketResponse(savedTicket);
    }

    @Transactional
    public void deleteTicket(Long ticketId, Long actorUserId) {
        User actor = getUserOrThrow(actorUserId);
        IncidentTicket ticket = getTicketOrThrow(ticketId);

        ensureCanManageTicket(ticket, actor, true);
        incidentTicketRepository.delete(ticket);
    }

    @Transactional(readOnly = true)
    public List<IncidentTicketResponse> listTickets(Long requesterId, TicketStatus status) {
        User requester = getUserOrThrow(requesterId);

        List<IncidentTicket> tickets;
        if (requester.getRole() == Role.USER) {
            tickets = (status == null)
                    ? incidentTicketRepository.findByReporterIdOrderByCreatedAtDesc(requester.getId())
                    : incidentTicketRepository.findByReporterIdAndStatusOrderByCreatedAtDesc(requester.getId(), status);
        } else {
            tickets = (status == null)
                    ? incidentTicketRepository.findAllByOrderByCreatedAtDesc()
                    : incidentTicketRepository.findByStatusOrderByCreatedAtDesc(status);
        }

        return tickets.stream().map(this::toTicketResponse).toList();
    }

    @Transactional(readOnly = true)
    public IncidentTicketResponse getTicket(Long ticketId, Long requesterId) {
        User requester = getUserOrThrow(requesterId);
        IncidentTicket ticket = getTicketOrThrow(ticketId);
        ensureCanView(ticket, requester);
        return toTicketResponse(ticket);
    }

    @Transactional
    public IncidentTicketResponse addAttachments(Long ticketId, Long actorUserId, List<MultipartFile> attachments) {
        User actor = getUserOrThrow(actorUserId);
        IncidentTicket ticket = getTicketOrThrow(ticketId);

        ensureCanManageTicket(ticket, actor, false);
        addAttachments(ticket, attachments);

        IncidentTicket savedTicket = incidentTicketRepository.save(ticket);
        return toTicketResponse(savedTicket);
    }

    @Transactional
    public IncidentTicketResponse deleteAttachment(Long ticketId, Long attachmentId, Long actorUserId) {
        User actor = getUserOrThrow(actorUserId);
        IncidentTicket ticket = getTicketOrThrow(ticketId);

        ensureCanManageTicket(ticket, actor, false);

        IncidentAttachment attachment = incidentAttachmentRepository.findByIdAndTicketId(attachmentId, ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found"));

        ticket.getAttachments().removeIf(item -> item.getId().equals(attachment.getId()));
        incidentAttachmentRepository.delete(attachment);

        IncidentTicket savedTicket = incidentTicketRepository.save(ticket);
        return toTicketResponse(savedTicket);
    }

    @Transactional
    public IncidentTicketResponse assignTechnician(Long ticketId, AssignTechnicianRequest request) {
        User actor = getUserOrThrow(request.getActorUserId());
        if (actor.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can assign a technician");
        }

        User technician = getUserOrThrow(request.getTechnicianUserId());
        if (technician.getRole() != Role.TECHNICIAN && technician.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Assigned user must have TECHNICIAN or ADMIN role");
        }

        IncidentTicket ticket = getTicketOrThrow(ticketId);
        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot assign technician to a terminal ticket");
        }

        ticket.setAssignedTechnician(technician);
        IncidentTicket savedTicket = incidentTicketRepository.save(ticket);
        return toTicketResponse(savedTicket);
    }

    @Transactional
    public IncidentTicketResponse updateStatus(Long ticketId, UpdateTicketStatusRequest request) {
        User actor = getUserOrThrow(request.getActorUserId());
        IncidentTicket ticket = getTicketOrThrow(ticketId);

        boolean isAdmin = actor.getRole() == Role.ADMIN;
        boolean isReporter = ticket.getReporter().getId().equals(actor.getId());
        boolean isAssignedTechnician = ticket.getAssignedTechnician() != null
                && ticket.getAssignedTechnician().getId().equals(actor.getId())
                && actor.getRole() == Role.TECHNICIAN;

        if (!isAdmin && !isReporter && !isAssignedTechnician) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only admin, reporter, or assigned technician can update ticket status");
        }

        TicketStatus currentStatus = ticket.getStatus();
        TicketStatus targetStatus = request.getStatus();

        if (targetStatus == TicketStatus.REJECTED) {
            if (!isAdmin) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can reject tickets");
            }
            if (!StringUtils.hasText(request.getRejectionReason())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is required");
            }
            if (currentStatus == TicketStatus.CLOSED) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Closed tickets cannot be rejected");
            }
            ticket.setStatus(TicketStatus.REJECTED);
            ticket.setRejectionReason(request.getRejectionReason().trim());
        } else {
            validateStatusTransition(currentStatus, targetStatus);
            if (currentStatus != targetStatus) {
                ticket.setStatus(targetStatus);
            }
            ticket.setRejectionReason(null);
        }

        if (StringUtils.hasText(request.getResolutionNotes())) {
            ticket.setResolutionNotes(request.getResolutionNotes().trim());
        }

        IncidentTicket savedTicket = incidentTicketRepository.save(ticket);
        return toTicketResponse(savedTicket);
    }

    @Transactional(readOnly = true)
    public List<TicketCommentResponse> listComments(Long ticketId, Long requesterId) {
        User requester = getUserOrThrow(requesterId);
        IncidentTicket ticket = getTicketOrThrow(ticketId);
        ensureCanView(ticket, requester);

        return ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::toCommentResponse)
                .toList();
    }

    @Transactional
    public TicketCommentResponse addComment(Long ticketId, AddTicketCommentRequest request) {
        User actor = getUserOrThrow(request.getActorUserId());
        IncidentTicket ticket = getTicketOrThrow(ticketId);
        ensureCanView(ticket, actor);

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .author(actor)
                .content(request.getContent().trim())
                .build();

        TicketComment saved = ticketCommentRepository.save(comment);
        return toCommentResponse(saved);
    }

    @Transactional
    public TicketCommentResponse updateComment(Long ticketId, Long commentId, UpdateTicketCommentRequest request) {
        User actor = getUserOrThrow(request.getActorUserId());
        TicketComment comment = ticketCommentRepository.findByIdAndTicketId(commentId, ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        if (actor.getRole() != Role.ADMIN && !comment.getAuthor().getId().equals(actor.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only comment owner or admin can edit this comment");
        }

        comment.setContent(request.getContent().trim());
        TicketComment saved = ticketCommentRepository.save(comment);
        return toCommentResponse(saved);
    }

    @Transactional
    public void deleteComment(Long ticketId, Long commentId, Long actorUserId) {
        User actor = getUserOrThrow(actorUserId);
        TicketComment comment = ticketCommentRepository.findByIdAndTicketId(commentId, ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        if (actor.getRole() != Role.ADMIN && !comment.getAuthor().getId().equals(actor.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only comment owner or admin can delete this comment");
        }

        ticketCommentRepository.delete(comment);
    }

    @Transactional(readOnly = true)
    public IncidentAttachment getAttachment(Long ticketId, Long attachmentId, Long requesterId) {
        User requester = getUserOrThrow(requesterId);
        IncidentTicket ticket = getTicketOrThrow(ticketId);
        ensureCanView(ticket, requester);

        return incidentAttachmentRepository.findByIdAndTicketId(attachmentId, ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found"));
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private IncidentTicket getTicketOrThrow(Long ticketId) {
        return incidentTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
    }

    private void ensureCanView(IncidentTicket ticket, User requester) {
        if (requester.getRole() == Role.ADMIN || requester.getRole() == Role.TECHNICIAN) {
            return;
        }

        if (!ticket.getReporter().getId().equals(requester.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to access this ticket");
        }
    }

    private void ensureAssignedTechnician(IncidentTicket ticket, User actor) {
        if (actor.getRole() != Role.TECHNICIAN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only assigned technician can update ticket status");
        }

        if (ticket.getAssignedTechnician() == null || !ticket.getAssignedTechnician().getId().equals(actor.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This ticket is not assigned to you");
        }
    }

    private void ensureCanManageTicket(IncidentTicket ticket, User actor, boolean forDeletion) {
        boolean isAdmin = actor.getRole() == Role.ADMIN;
        boolean isReporter = ticket.getReporter().getId().equals(actor.getId());

        if (!isAdmin && !isReporter) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only ticket owner or admin can modify this ticket");
        }

        if (!isAdmin && ticket.getStatus() != TicketStatus.OPEN) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    forDeletion
                            ? "Only OPEN tickets can be deleted by the reporter"
                            : "Only OPEN tickets can be updated by the reporter");
        }

        if (!forDeletion && (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Terminal tickets cannot be updated");
        }
    }

    private void validateStatusTransition(TicketStatus current, TicketStatus target) {
        if (current == target) {
            return;
        }

        if (current == TicketStatus.CLOSED || current == TicketStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No further transitions are allowed");
        }

        boolean isValid = switch (current) {
            case OPEN -> target == TicketStatus.IN_PROGRESS;
            case IN_PROGRESS -> target == TicketStatus.RESOLVED;
            case RESOLVED -> target == TicketStatus.CLOSED;
            default -> false;
        };

        if (!isValid) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid transition. Allowed flow: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED");
        }
    }

    private void addAttachments(IncidentTicket ticket, List<MultipartFile> attachments) {
        if (attachments == null || attachments.isEmpty()) {
            return;
        }

        int existingAttachmentCount = ticket.getAttachments() == null ? 0 : ticket.getAttachments().size();
        if (existingAttachmentCount + attachments.size() > MAX_ATTACHMENTS) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A ticket can include up to " + MAX_ATTACHMENTS + " image attachments");
        }

        List<IncidentAttachment> entities = new ArrayList<>();
        for (MultipartFile file : attachments) {
            validateImageAttachment(file);
            try {
                IncidentAttachment attachment = IncidentAttachment.builder()
                        .ticket(ticket)
                        .fileName(file.getOriginalFilename())
                        .contentType(file.getContentType())
                        .fileSize(file.getSize())
                        .data(file.getBytes())
                        .build();
                entities.add(attachment);
            } catch (IOException ex) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to process attachment");
            }
        }

        incidentAttachmentRepository.saveAll(entities);
        ticket.getAttachments().addAll(entities);
    }

    private void validateImageAttachment(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Attachment cannot be empty");
        }

        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType) || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image attachments are allowed");
        }
    }

    private IncidentTicketResponse toTicketResponse(IncidentTicket ticket) {
        List<AttachmentMetadataResponse> attachments = ticket.getAttachments().stream()
                .map(attachment -> AttachmentMetadataResponse.builder()
                        .id(attachment.getId())
                        .fileName(attachment.getFileName())
                        .contentType(attachment.getContentType())
                        .fileSize(attachment.getFileSize())
                        .build())
                .toList();

        List<TicketCommentResponse> comments = ticket.getComments().stream()
                .map(this::toCommentResponse)
                .toList();

        return IncidentTicketResponse.builder()
                .id(ticket.getId())
                .reporterId(ticket.getReporter().getId())
                .reporterName(ticket.getReporter().getName())
                .assignedTechnicianId(ticket.getAssignedTechnician() != null ? ticket.getAssignedTechnician().getId() : null)
                .assignedTechnicianName(ticket.getAssignedTechnician() != null ? ticket.getAssignedTechnician().getName() : null)
                .resourceLocation(ticket.getResourceLocation())
                .category(ticket.getCategory())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .preferredContactDetails(ticket.getPreferredContactDetails())
                .status(ticket.getStatus())
                .rejectionReason(ticket.getRejectionReason())
                .resolutionNotes(ticket.getResolutionNotes())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .attachments(attachments)
                .comments(comments)
                .build();
    }

    private TicketCommentResponse toCommentResponse(TicketComment comment) {
        return TicketCommentResponse.builder()
                .id(comment.getId())
                .ticketId(comment.getTicket().getId())
                .authorId(comment.getAuthor().getId())
                .authorName(comment.getAuthor().getName())
                .authorRole(comment.getAuthor().getRole().name())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
