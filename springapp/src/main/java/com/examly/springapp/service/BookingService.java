package com.examly.springapp.service;

import com.examly.springapp.model.*;
import com.examly.springapp.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.regex.Pattern;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

    public BookingService(BookingRepository bookingRepository, RoomRepository roomRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional
    public Booking createBooking(Booking booking) {
        validateBooking(booking);

        Room room = roomRepository.findById(booking.getRoom().getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (!room.getAvailable()) {
            throw new RuntimeException("Room is not available");
        }

        // Calculate total price based on number of nights
        long nights = ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        booking.setTotalPrice(nights * room.getPrice());
        booking.setRoom(room);

        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking updateBookingStatus(Long bookingId, String status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!status.equals("APPROVED") && !status.equals("REJECTED") && !status.equals("PENDING")) {
            throw new RuntimeException("Invalid booking status");
        }

        booking.setStatus(status);

    if (status.equals("APPROVED")) {
Room room = booking.getRoom();
room.setAvailable(false);
roomRepository.save(room);
} else if (status.equals("REJECTED")) {
Room room = booking.getRoom();
room.setAvailable(true);
roomRepository.save(room);
}

return bookingRepository.save(booking);
}

private void validateBooking(Booking booking) {
if (!EMAIL_PATTERN.matcher(booking.getGuestEmail()).matches()) {
throw new RuntimeException("Invalid email address");
}

LocalDate checkIn = booking.getCheckInDate();
LocalDate checkOut = booking.getCheckOutDate();

if (checkIn == null || checkOut == null || !checkOut.isAfter(checkIn)) {
throw new RuntimeException("Check-out date must be after check-in date");
}
}
}