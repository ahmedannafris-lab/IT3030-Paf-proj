package com.smartcampus.controller;

import com.smartcampus.dto.BookingResponse;
import com.smartcampus.dto.CreateBookingRequest;
import com.smartcampus.dto.UpdateBookingStatusRequest;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @Valid @RequestBody CreateBookingRequest request) {
        try {
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Missing user id"));
            }
            if (!isUser(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only users can create bookings"));
            }
            BookingResponse response = bookingService.createBooking(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyBookings(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Missing user id"));
        }
        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    @GetMapping
    public ResponseEntity<?> getAllBookings(@RequestHeader(value = "X-User-Role", required = false) String role) {
        if (!isAdmin(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
        }
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByResourceAndDate(
            @PathVariable String resourceId,
            @RequestParam LocalDate date) {
        return ResponseEntity.ok(bookingService.getBookingsByResourceAndDate(resourceId, date));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Missing user id"));
        }
        try {
            return ResponseEntity.ok(bookingService.getBookingById(id, userId, isAdmin(role)));
        } catch (Exception e) {
            return handleException(e);
        }
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Missing user id"));
        }
        try {
            return ResponseEntity.ok(bookingService.cancelBooking(id, userId));
        } catch (Exception e) {
            return handleException(e);
        }
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestBody(required = false) UpdateBookingStatusRequest request) {
        if (!isAdmin(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
        }
        try {
            String adminNote = request == null ? null : request.getAdminNote();
            return ResponseEntity.ok(bookingService.approveBooking(id, adminNote));
        } catch (Exception e) {
            return handleException(e);
        }
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestBody UpdateBookingStatusRequest request) {
        if (!isAdmin(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
        }
        try {
            return ResponseEntity.ok(bookingService.rejectBooking(id, request == null ? null : request.getAdminNote()));
        } catch (Exception e) {
            return handleException(e);
        }
    }

    @PatchMapping("/{id}/admin-cancel")
    public ResponseEntity<?> adminCancelBooking(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (!isAdmin(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
        }
        try {
            return ResponseEntity.ok(bookingService.adminCancelBooking(id));
        } catch (Exception e) {
            return handleException(e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Missing user id"));
        }
        try {
            bookingService.deleteBooking(id, userId, isAdmin(role));
            return ResponseEntity.ok(Map.of("message", "Booking deleted successfully"));
        } catch (Exception e) {
            return handleException(e);
        }
    }

    private boolean isAdmin(String role) {
        return role != null && role.equalsIgnoreCase("ADMIN");
    }

    private boolean isUser(String role) {
        return role != null && role.equalsIgnoreCase("USER");
    }

    private ResponseEntity<Map<String, String>> handleException(Exception e) {
        String message = e.getMessage() == null ? "Unexpected error" : e.getMessage();
        String normalizedMessage = message.toLowerCase();
        HttpStatus status = HttpStatus.BAD_REQUEST;

        if (normalizedMessage.contains("missing user id")) {
            status = HttpStatus.UNAUTHORIZED;
        } else if (normalizedMessage.contains("not found")) {
            status = HttpStatus.NOT_FOUND;
        } else if (normalizedMessage.contains("already booked")) {
            status = HttpStatus.CONFLICT;
        } else if (normalizedMessage.contains("unauthorized") || normalizedMessage.contains("admin access required")) {
            status = HttpStatus.FORBIDDEN;
        }

        return ResponseEntity.status(status).body(Map.of("error", message));
    }
}