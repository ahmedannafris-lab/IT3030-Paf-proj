package com.smartcampus.service;

import com.smartcampus.dto.UserRegisterRequest;
import com.smartcampus.dto.UserLoginRequest;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

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
                .role(request.getRole())
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
}
