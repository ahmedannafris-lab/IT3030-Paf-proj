package com.smartcampus.controller;

import com.smartcampus.dto.CreateResourceRequest;
import com.smartcampus.dto.ResourceDto;
import com.smartcampus.dto.ResourceStatusChangeRequest;
import com.smartcampus.dto.UpdateResourceRequest;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
// Note: PreAuthorize requires Spring Security, which is permitted all in SecurityConfig. 
// Ensure JWT decoding is set up properly for roles if this blocks valid admins.
public class AdminResourceController {

    private final ResourceService resourceService;

    @PostMapping
    public ResponseEntity<?> createResource(@Valid @RequestBody CreateResourceRequest request) {
        try {
            ResourceDto created = resourceService.createResource(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            if (e.getMessage().contains("already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateResource(
            @PathVariable String id, 
            @Valid @RequestBody UpdateResourceRequest request) {
        
        try {
            ResourceDto updated = resourceService.updateResource(id, request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> changeResourceStatus(
            @PathVariable String id, 
            @Valid @RequestBody ResourceStatusChangeRequest request) {
        
        try {
            ResourceDto updated = resourceService.changeResourceStatus(id, request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResource(@PathVariable String id) {
        try {
            resourceService.deleteResource(id);
            return ResponseEntity.ok("Resource deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<?> uploadImage(
            @PathVariable String id, 
            @RequestParam("file") MultipartFile file) {
        
        try {
            ResourceDto updated = resourceService.uploadImage(id, file);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}