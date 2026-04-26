package com.smartcampus.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.model.IncidentAttachment;

public interface IncidentAttachmentRepository extends JpaRepository<IncidentAttachment, Long> {

    Optional<IncidentAttachment> findByIdAndTicketId(Long id, Long ticketId);
}
