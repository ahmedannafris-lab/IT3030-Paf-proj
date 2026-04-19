package com.smartcampus.dto;

import com.smartcampus.enums.Role;

import lombok.Data;

@Data
public class RoleUpdateRequest {

    private Role role;
}