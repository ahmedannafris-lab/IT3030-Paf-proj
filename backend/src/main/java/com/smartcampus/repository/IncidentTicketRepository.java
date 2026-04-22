package com.smartcampus.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.enums.TicketStatus;
import com.smartcampus.model.IncidentTicket;

public interface IncidentTicketRepository extends JpaRepository<IncidentTicket, Long> {

    List<IncidentTicket> findAllByOrderByCreatedAtDesc();

    List<IncidentTicket> findByStatusOrderByCreatedAtDesc(TicketStatus status);

    List<IncidentTicket> findByAssignedTechnicianId(Long assignedTechnicianId);

    List<IncidentTicket> findByReporterIdOrderByCreatedAtDesc(Long reporterId);

    List<IncidentTicket> findByReporterIdAndStatusOrderByCreatedAtDesc(Long reporterId, TicketStatus status);
}
