package com.smartcampus.service;

import com.smartcampus.dto.CreateResourceRequest;
import com.smartcampus.dto.ResourceDto;
import com.smartcampus.dto.ResourceStatusChangeRequest;
import com.smartcampus.dto.UpdateResourceRequest;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ResourceService {
    ResourceDto createResource(CreateResourceRequest request);
    List<ResourceDto> getAllResources(ResourceType type, String location, Integer minCapacity, ResourceStatus status);
    ResourceDto getResourceById(String id);
    ResourceDto updateResource(String id, UpdateResourceRequest request);
    ResourceDto changeResourceStatus(String id, ResourceStatusChangeRequest request);
    void deleteResource(String id);
    ResourceDto uploadImage(String id, MultipartFile file);
}