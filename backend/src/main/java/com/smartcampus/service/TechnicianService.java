package com.smartcampus.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.smartcampus.dto.CreateTechnicianRequest;
import com.smartcampus.dto.TechnicianResponse;
import com.smartcampus.dto.UpdateTechnicianRequest;
import com.smartcampus.enums.Role;
import com.smartcampus.model.IncidentTicket;
import com.smartcampus.model.User;
import com.smartcampus.repository.IncidentTicketRepository;
import com.smartcampus.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TechnicianService {

    private final UserRepository userRepository;
    private final IncidentTicketRepository incidentTicketRepository;

    @Transactional(readOnly = true)
    public List<TechnicianResponse> listTechnicians(Long requesterId) {
        ensureAdmin(requesterId);

        return userRepository.findByRoleAndEnabledTrueOrderByNameAsc(Role.TECHNICIAN)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TechnicianResponse createTechnician(CreateTechnicianRequest request) {
        ensureAdmin(request.getActorUserId());

        String normalizedEmail = normalizeEmail(request.getEmail());
        ensureEmailUnique(normalizedEmail, null);

        User technician = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .password(request.getPassword())
                .role(Role.TECHNICIAN)
                .enabled(true)
                .build();

        User saved = userRepository.save(technician);
        return toResponse(saved);
    }

    @Transactional
    public TechnicianResponse updateTechnician(Long technicianId, UpdateTechnicianRequest request) {
        ensureAdmin(request.getActorUserId());

        User technician = getTechnicianOrThrow(technicianId);
        String normalizedEmail = normalizeEmail(request.getEmail());
        ensureEmailUnique(normalizedEmail, technician.getId());

        technician.setName(request.getName().trim());
        technician.setEmail(normalizedEmail);
        technician.setEnabled(true);

        if (StringUtils.hasText(request.getPassword())) {
            technician.setPassword(request.getPassword());
        }

        User saved = userRepository.save(technician);
        return toResponse(saved);
    }

    @Transactional
    public void deleteTechnician(Long technicianId, Long actorUserId) {
        ensureAdmin(actorUserId);

        User technician = getTechnicianOrThrow(technicianId);

        List<IncidentTicket> assignedTickets = incidentTicketRepository.findByAssignedTechnicianId(technicianId);
        for (IncidentTicket ticket : assignedTickets) {
            ticket.setAssignedTechnician(null);
        }

        if (!assignedTickets.isEmpty()) {
            incidentTicketRepository.saveAll(assignedTickets);
        }

        technician.setEnabled(false);
        userRepository.save(technician);
    }

    private User ensureAdmin(Long actorUserId) {
        if (actorUserId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Actor user id is required");
        }

        User actor = userRepository.findById(actorUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (actor.getRole() != Role.ADMIN || !actor.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can manage technicians");
        }

        return actor;
    }

    private User getTechnicianOrThrow(Long technicianId) {
        User user = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Technician not found"));

        if (user.getRole() != Role.TECHNICIAN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected user is not a technician");
        }

        return user;
    }

    private void ensureEmailUnique(String normalizedEmail, Long ignoredUserId) {
        userRepository.findByEmailIgnoreCase(normalizedEmail).ifPresent(existingUser -> {
            if (ignoredUserId == null || !existingUser.getId().equals(ignoredUserId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
            }
        });
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private TechnicianResponse toResponse(User user) {
        return TechnicianResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .enabled(user.isEnabled())
                .build();
    }
}