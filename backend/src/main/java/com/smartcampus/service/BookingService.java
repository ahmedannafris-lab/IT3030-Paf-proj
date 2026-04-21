package com.smartcampus.service;

import com.smartcampus.dto.BookingResponse;
import com.smartcampus.dto.CreateBookingRequest;

import java.time.LocalDate;
import java.util.List;

public interface BookingService {
    BookingResponse createBooking(long userId, CreateBookingRequest request);
    BookingResponse cancelBooking(long bookingId, long userId);
    BookingResponse approveBooking(long bookingId, String adminNote);
    BookingResponse rejectBooking(long bookingId, String adminNote);
    BookingResponse adminCancelBooking(long bookingId);
    List<BookingResponse> getMyBookings(long userId);
    List<BookingResponse> getBookingsByResourceAndDate(String resourceId, LocalDate date);
    List<BookingResponse> getAllBookings();
    BookingResponse getBookingById(long id, long userId, boolean isAdmin);
    void deleteBooking(long bookingId, long userId, boolean isAdmin);
}
