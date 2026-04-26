package com.smartcampus.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.dto.CreateTechnicianRequest;
import com.smartcampus.dto.TechnicianResponse;
import com.smartcampus.dto.UpdateTechnicianRequest;
import com.smartcampus.service.TechnicianService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/technicians")
@RequiredArgsConstructor
@Validated
public class TechnicianController {

    private final TechnicianService technicianService;

    @GetMapping
    public ResponseEntity<List<TechnicianResponse>> listTechnicians(@RequestParam Long requesterId) {
        return ResponseEntity.ok(technicianService.listTechnicians(requesterId));
    }

    @PostMapping
    public ResponseEntity<TechnicianResponse> createTechnician(@Valid @RequestBody CreateTechnicianRequest request) {
        return ResponseEntity.ok(technicianService.createTechnician(request));
    }

    @PutMapping("/{technicianId}")
    public ResponseEntity<TechnicianResponse> updateTechnician(
            @PathVariable Long technicianId,
            @Valid @RequestBody UpdateTechnicianRequest request) {
        return ResponseEntity.ok(technicianService.updateTechnician(technicianId, request));
    }

    @DeleteMapping("/{technicianId}")
    public ResponseEntity<Void> deleteTechnician(
            @PathVariable Long technicianId,
            @RequestParam Long actorUserId) {
        technicianService.deleteTechnician(technicianId, actorUserId);
        return ResponseEntity.noContent().build();
    }
}