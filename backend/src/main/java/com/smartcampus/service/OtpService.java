package com.smartcampus.service;

import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;

@Service
public class OtpService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    public String sendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        user.setResetOtp(otp);
        user.setOtpExpiry(System.currentTimeMillis() + 5 * 60 * 1000);

        userRepository.save(user);
        emailService.sendOtp(email, otp);

        return "OTP sent to email";
    }

    public boolean verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getResetOtp() == null) return false;
        if (!user.getResetOtp().equals(otp)) return false;
        if (System.currentTimeMillis() > user.getOtpExpiry()) return false;

        return true;
    }

    public String resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(newPassword);
        user.setResetOtp(null);
        user.setOtpExpiry(null);

        userRepository.save(user);

        return "Password reset successful";
    }
}