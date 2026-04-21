package com.smartcampus.service;

import com.smartcampus.dto.UpdateUserRequest;
import com.smartcampus.dto.UserDto;
import com.smartcampus.dto.UserLoginRequest;
import com.smartcampus.dto.UserRegisterRequest;
import com.smartcampus.enums.Role;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User registerUser(UserRegisterRequest request) {
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Email already taken!");
        }

        User newUser = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                // In production, encrypt the password here (e.g., passwordEncoder.encode(request.getPassword()))
                .password(request.getPassword())
                .role(request.getRole() != null ? request.getRole() : Role.USER)
                .enabled(true)
                .build();

        return userRepository.save(newUser);
    }

    public User loginUser(UserLoginRequest request) {
        User existingUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password!"));

        // In production, use passwordEncoder.matches()
        if (!existingUser.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid email or password!");
        }

        return existingUser;
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        return toDto(user);
    }

    public UserDto updateUser(Long id, UpdateUserRequest request) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        if (request.getName() != null && !request.getName().isEmpty()) {
            existingUser.setName(request.getName());
        }
        if (request.getEmail() != null && !request.getEmail().isEmpty() && !request.getEmail().equals(existingUser.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email already in use by another account!");
            }
            existingUser.setEmail(request.getEmail());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            existingUser.setPassword(request.getPassword()); // Hash it in prod
        }

        return toDto(userRepository.save(existingUser));
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with ID: " + id);
        }
        userRepository.deleteById(id);
    }

    public UserDto changeUserRole(Long id, Role newRole) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        existingUser.setRole(newRole);
        return toDto(userRepository.save(existingUser));
    }

    public UserDto toggleUserStatus(Long id, boolean enabled) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        existingUser.setEnabled(enabled);
        return toDto(userRepository.save(existingUser));
    }

    private UserDto toDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        if (user.getRole() != null) {
            dto.setRole(user.getRole().name());
        }
        dto.setEnabled(user.isEnabled());
        return dto;
    }
}
