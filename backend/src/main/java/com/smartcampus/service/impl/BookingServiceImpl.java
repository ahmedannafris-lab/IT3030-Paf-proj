package com.smartcampus.service.impl;

import com.smartcampus.dto.BookingResponse;
import com.smartcampus.dto.CreateBookingRequest;
import com.smartcampus.dto.ResourceDto;
import com.smartcampus.dto.UserDto;
import com.smartcampus.enums.BookingStatus;
import com.smartcampus.enums.Role;
import com.smartcampus.model.AvailabilityWindow;
import com.smartcampus.model.Booking;
import com.smartcampus.model.User;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.BookingService;
import com.smartcampus.service.ResourceService;
import com.smartcampus.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceService resourceService;
    private final UserService userService;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public List<BookingResponse> createBooking(long userId, CreateBookingRequest request) {
        // 1. Resource exists
        ResourceDto resource = resourceService.getResourceById(request.getResourceId());
        
        // 2. Resource status == ACTIVE
        if (!"ACTIVE".equals(resource.getStatus().name())) {
            throw new RuntimeException("This resource is currently unavailable");
        }
        
        // 3. Date >= today
        if (request.getDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot book for a past date");
        }
        
        // 4. endTime > startTime
        if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().equals(request.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }
        
        // 5. Purpose not empty, max 200 chars
        if (request.getPurpose() == null || request.getPurpose().trim().isEmpty() || request.getPurpose().length() > 200) {
            throw new RuntimeException("Booking purpose is required and cannot exceed 200 characters");
        }
        
        // 6. expectedAttendees >= 0
        if (request.getExpectedAttendees() == null || request.getExpectedAttendees() < 0) {
            throw new RuntimeException("Expected attendees cannot be negative");
        }
        
        // 7. Capacity restriction
        if (!"EQUIPMENT".equals(resource.getType().name()) && request.getExpectedAttendees() > resource.getCapacity()) {
            throw new RuntimeException("Exceeds resource capacity of " + resource.getCapacity());
        }

        // Calculate all dates to book
        List<LocalDate> datesToBook = new java.util.ArrayList<>();
        datesToBook.add(request.getDate());

        if (Boolean.TRUE.equals(request.getIsRecurring())) {
            if (request.getRecurrenceEndDate() == null) {
                throw new RuntimeException("Recurrence end date is required for recurring bookings");
            }
            if (!request.getRecurrenceEndDate().isAfter(request.getDate())) {
                throw new RuntimeException("Recurrence end date must be after start date");
            }
            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(request.getDate(), request.getRecurrenceEndDate());
            if (daysBetween > 30) {
                throw new RuntimeException("Recurring bookings cannot span more than 30 days");
            }

            LocalDate currentDate = request.getDate();
            while (currentDate.isBefore(request.getRecurrenceEndDate())) {
                if ("DAILY".equalsIgnoreCase(request.getRecurrenceType())) {
                    currentDate = currentDate.plusDays(1);
                } else if ("WEEKLY".equalsIgnoreCase(request.getRecurrenceType())) {
                    currentDate = currentDate.plusWeeks(1);
                } else {
                    throw new RuntimeException("Invalid recurrence type. Must be DAILY or WEEKLY");
                }
                if (!currentDate.isAfter(request.getRecurrenceEndDate())) {
                    datesToBook.add(currentDate);
                }
            }
        }

        // Validate ALL dates against windows and conflicts
        for (LocalDate targetDate : datesToBook) {
            if (resource.getAvailabilityWindows() != null && !resource.getAvailabilityWindows().isEmpty()) {
                AvailabilityWindow matchingWindow = null;
                for (AvailabilityWindow window : resource.getAvailabilityWindows()) {
                    if (window.getDay().equals(targetDate.getDayOfWeek())) {
                        matchingWindow = window;
                        break;
                    }
                }

                if (matchingWindow == null) {
                    throw new RuntimeException("Resource not available on " + targetDate.getDayOfWeek() + " (" + targetDate + ")");
                }

                if (request.getStartTime().isBefore(matchingWindow.getStartTime())) {
                    throw new RuntimeException("Booking start time is before allowed opening time on " + targetDate);
                }

                if (request.getEndTime().isAfter(matchingWindow.getEndTime())) {
                    throw new RuntimeException("Booking end time is after allowed closing time on " + targetDate);
                }
            }
            
            checkConflicts(request.getResourceId(), targetDate, request.getStartTime(), request.getEndTime());
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> bookingsToSave = new java.util.ArrayList<>();
        for (LocalDate targetDate : datesToBook) {
            Booking booking = new Booking();
            booking.setResourceId(request.getResourceId());
            booking.setUserId(userId);
            booking.setDate(targetDate);
            booking.setStartTime(request.getStartTime());
            booking.setEndTime(request.getEndTime());
            booking.setPurpose(request.getPurpose());
            booking.setExpectedAttendees(request.getExpectedAttendees());
            booking.setStatus(BookingStatus.PENDING);
            bookingsToSave.add(booking);
        }
        
        List<Booking> savedBookings = bookingRepository.saveAll(bookingsToSave);

        return savedBookings.stream()
                .map(b -> mapToResponse(b, resource.getName(), user.getName()))
                .collect(Collectors.toList());
    }

    private void checkConflicts(String resourceId, LocalDate date, LocalTime newStart, LocalTime newEnd) {
        List<Booking> approved = bookingRepository.findByResourceIdAndDateAndStatus(resourceId, date, BookingStatus.APPROVED);
        for (Booking existing : approved) {
            if (newStart.isBefore(existing.getEndTime()) && newEnd.isAfter(existing.getStartTime())) {
                throw new RuntimeException("Resource already booked for this time");
            }
        }
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(long bookingId, long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
                
        if (booking.getUserId() != userId) {
            throw new RuntimeException("Unauthorized to cancel this booking");
        }
        
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new RuntimeException("Can only cancel APPROVED bookings");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(booking);
        
        User user = userRepository.findById(userId).orElseThrow();
        ResourceDto resource = resourceService.getResourceById(booking.getResourceId());
        
        return mapToResponse(updated, resource.getName(), user.getName());
    }

    @Override
    @Transactional
    public BookingResponse approveBooking(long bookingId, String adminNote) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
                
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Can only approve PENDING bookings");
        }
        
        // Re-check conflicts
        checkConflicts(booking.getResourceId(), booking.getDate(), booking.getStartTime(), booking.getEndTime());
        
        booking.setStatus(BookingStatus.APPROVED);
        if (adminNote != null && !adminNote.trim().isEmpty()) {
            booking.setAdminNote(adminNote);
        }
        
        Booking updated = bookingRepository.save(booking);
        
        User user = userRepository.findById(booking.getUserId()).orElseThrow();
        ResourceDto resource = resourceService.getResourceById(booking.getResourceId());
        
        return mapToResponse(updated, resource.getName(), user.getName());
    }

    @Override
    @Transactional
    public BookingResponse rejectBooking(long bookingId, String adminNote) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
                
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Can only reject PENDING bookings");
        }
        
        if (adminNote == null || adminNote.trim().isEmpty() || adminNote.length() < 5) {
            throw new RuntimeException("Admin note is required for rejection and must be at least 5 characters");
        }
        
        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminNote(adminNote);
        Booking updated = bookingRepository.save(booking);
        
        User user = userRepository.findById(booking.getUserId()).orElseThrow();
        ResourceDto resource = resourceService.getResourceById(booking.getResourceId());
        
        return mapToResponse(updated, resource.getName(), user.getName());
    }

    @Override
    @Transactional
    public BookingResponse adminCancelBooking(long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
                
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new RuntimeException("Admin can only cancel APPROVED bookings");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setAdminNote("Cancelled by admin");
        Booking updated = bookingRepository.save(booking);
        
        User user = userRepository.findById(booking.getUserId()).orElseThrow();
        ResourceDto resource = resourceService.getResourceById(booking.getResourceId());
        
        return mapToResponse(updated, resource.getName(), user.getName());
    }

    @Override
    public List<BookingResponse> getMyBookings(long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::mapToResponseWithLookup)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getBookingsByResourceAndDate(String resourceId, LocalDate date) {
        return bookingRepository.findByResourceIdAndDate(resourceId, date).stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED && b.getStatus() != BookingStatus.REJECTED)
                .map(this::mapToResponseWithLookup)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponseWithLookup)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingById(long id, long userId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
                
        if (!isAdmin && booking.getUserId() != userId) {
            throw new RuntimeException("Unauthorized: Cannot view another user's booking");
        }
        
        return mapToResponseWithLookup(booking);
    }

    @Override
    @Transactional
    public void deleteBooking(long bookingId, long userId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
                
        if (!isAdmin) {
            if (booking.getUserId() != userId) {
                throw new RuntimeException("Unauthorized to delete this booking");
            }
        }
        
        bookingRepository.delete(booking);
    }

    private BookingResponse mapToResponseWithLookup(Booking booking) {
        ResourceDto resource = resourceService.getResourceById(booking.getResourceId());
        UserDto user = userService.getUserById(booking.getUserId());
        return mapToResponse(booking, resource.getName(), user.getName());
    }

    private BookingResponse mapToResponse(Booking booking, String resourceName, String userName) {
        BookingResponse response = new BookingResponse();
        response.setId(String.valueOf(booking.getId()));
        response.setResourceId(booking.getResourceId());
        response.setResourceName(resourceName);
        response.setUserId(String.valueOf(booking.getUserId()));
        response.setUserName(userName);
        response.setDate(booking.getDate());
        response.setStartTime(booking.getStartTime());
        response.setEndTime(booking.getEndTime());
        response.setPurpose(booking.getPurpose());
        response.setExpectedAttendees(booking.getExpectedAttendees());
        response.setStatus(booking.getStatus());
        response.setAdminNote(booking.getAdminNote());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        return response;
    }
}
