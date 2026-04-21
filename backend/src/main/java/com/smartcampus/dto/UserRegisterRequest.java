package com.smartcampus.dto;

import com.smartcampus.enums.Role;
import lombok.Data;

@Data
public class UserRegisterRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
}
