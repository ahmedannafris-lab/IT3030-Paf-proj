package com.smartcampus.service.impl;

import com.smartcampus.dto.CreateResourceRequest;
import com.smartcampus.dto.ResourceDto;
import com.smartcampus.dto.ResourceStatusChangeRequest;
import com.smartcampus.dto.UpdateResourceRequest;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.model.AvailabilityWindow;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.service.ResourceService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    private static final String UPLOAD_DIR = "uploads/";

    @Override
    public ResourceDto createResource(CreateResourceRequest request) {
        // Name required (handled by @NotBlank in DTO, but we do explicitly per logic requirements)
        if (resourceRepository.existsByName(request.getName())) {
            throw new RuntimeException("A resource with this name already exists");
        }
        
        validateCapacityAndType(request.getCapacity(), request.getType());
        validateAvailabilityWindows(request.getAvailabilityWindows());

        Resource resource = new Resource();
        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setStatus(ResourceStatus.ACTIVE);
        resource.setDescription(request.getDescription());
        resource.setTags(request.getTags());
        resource.setContactPerson(request.getContactPerson());
        resource.setNotes(request.getNotes());
        resource.setAvailabilityWindows(request.getAvailabilityWindows());

        Resource saved = resourceRepository.save(resource);
        return toDto(saved);
    }

    @Override
    public List<ResourceDto> getAllResources(ResourceType type, String location, Integer minCapacity, ResourceStatus status) {
        Specification<Resource> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (location != null && !location.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%"));
            }
            if (minCapacity != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), minCapacity));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<Resource> resources = resourceRepository.findAll(spec);
        return resources.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public ResourceDto getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        return toDto(resource);
    }

    @Override
    public ResourceDto updateResource(String id, UpdateResourceRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (request.getName() != null && !request.getName().equals(resource.getName())) {
            if (resourceRepository.existsByName(request.getName())) {
                throw new RuntimeException("A resource with this name already exists");
            }
            resource.setName(request.getName());
        }

        if (request.getType() != null) resource.setType(request.getType());
        if (request.getCapacity() != null) {
            validateCapacityAndType(request.getCapacity(), resource.getType());
            resource.setCapacity(request.getCapacity());
        }
        if (request.getLocation() != null) resource.setLocation(request.getLocation());
        if (request.getDescription() != null) resource.setDescription(request.getDescription());
        if (request.getTags() != null) resource.setTags(request.getTags());
        if (request.getContactPerson() != null) resource.setContactPerson(request.getContactPerson());
        if (request.getNotes() != null) resource.setNotes(request.getNotes());
        
        if (request.getAvailabilityWindows() != null) {
            validateAvailabilityWindows(request.getAvailabilityWindows());
            resource.setAvailabilityWindows(request.getAvailabilityWindows());
        }

        resource.setUpdatedAt(LocalDateTime.now());
        return toDto(resourceRepository.save(resource));
    }

    @Override
    public ResourceDto changeResourceStatus(String id, ResourceStatusChangeRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        resource.setStatus(request.getStatus());
        resource.setUpdatedAt(LocalDateTime.now());
        return toDto(resourceRepository.save(resource));
    }

    @Override
    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new RuntimeException("Resource not found");
        }
        resourceRepository.deleteById(id);
    }

    @Override
    public ResourceDto uploadImage(String id, MultipartFile file) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String filename = "resource_" + id + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + filename);
            Files.write(path, file.getBytes());

            String imageUrl = "/uploads/" + filename;
            resource.setImageUrl(imageUrl);
            resource.setUpdatedAt(LocalDateTime.now());
            Resource saved = resourceRepository.save(resource);
            return toDto(saved);

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image");
        }
    }

    // -- Validations --
    private void validateCapacityAndType(Integer capacity, ResourceType type) {
        if (capacity < 0) {
            throw new RuntimeException("Capacity cannot be negative");
        }
        if (type != ResourceType.EQUIPMENT && capacity == 0) {
            throw new RuntimeException("Capacity is required for this resource type");
        }
    }

    private void validateAvailabilityWindows(List<AvailabilityWindow> windows) {
        if (windows == null || windows.isEmpty()) return;
        Set<DayOfWeek> days = new HashSet<>();
        for (AvailabilityWindow w : windows) {
            if (!days.add(w.getDay())) {
                throw new RuntimeException("Duplicate day in availability windows");
            }
            if (!w.getStartTime().isBefore(w.getEndTime())) {
                throw new RuntimeException("Start time must be before end time");
            }
        }
    }

    private ResourceDto toDto(Resource resource) {
        ResourceDto dto = new ResourceDto();
        dto.setId(resource.getId());
        dto.setName(resource.getName());
        dto.setType(resource.getType());
        dto.setCapacity(resource.getCapacity());
        dto.setLocation(resource.getLocation());
        dto.setStatus(resource.getStatus());
        dto.setDescription(resource.getDescription());
        dto.setImageUrl(resource.getImageUrl());
        dto.setTags(resource.getTags());
        dto.setContactPerson(resource.getContactPerson());
        dto.setNotes(resource.getNotes());
        dto.setAvailabilityWindows(resource.getAvailabilityWindows());
        dto.setCreatedAt(resource.getCreatedAt());
        dto.setUpdatedAt(resource.getUpdatedAt());
        return dto;
    }
}