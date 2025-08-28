package com.examly.springapp.service;

import com.examly.springapp.model.Booking;
import com.examly.springapp.model.Room;
import com.examly.springapp.repository.BookingRepository;
import com.examly.springapp.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private RoomService roomService;

    public BookingService(BookingRepository bookingRepository, RoomRepository roomRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
    }

    @Autowired
    @Lazy
    public void setRoomService(RoomService roomService) {
        this.roomService = roomService;
    }

    @Transactional
    public Booking createBooking(Booking booking) {
        Room room = roomRepository.findById(booking.getRoom().getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + booking.getRoom().getRoomId()));
        if (!room.getAvailable()) {
            throw new RuntimeException("Room is not available");
        }
        if (!booking.getGuestEmail().matches("^(.+)@(.+)$")) {
            throw new RuntimeException("Invalid email format");
        }
        if (!booking.getCheckOutDate().isAfter(booking.getCheckInDate())) {
            throw new RuntimeException("Check-out date must be after check-in date");
        }

        long nights = booking.getCheckOutDate().toEpochDay() - booking.getCheckInDate().toEpochDay();
        booking.setTotalPrice(nights * room.getPricePerNight());
        booking.setStatus("PENDING");
        booking.setCreatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

   public List<Booking> getAllBookings() {
return bookingRepository.findAll();
}

public Booking getBookingById(Long id) {
return bookingRepository.findById(id)
.orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
}

@Transactional
public Booking updateBookingStatus(Long id, String status) {
try {
Booking booking = bookingRepository.findById(id)
.orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

if (!status.equals("APPROVED") && !status.equals("REJECTED")) {
throw new RuntimeException("Invalid status: " + status);
}

booking.setStatus(status);
Booking savedBooking = bookingRepository.save(booking);

// Update room availability based on booking status
if (booking.getRoom() != null && roomService != null) {
Room room = booking.getRoom();
if ("APPROVED".equals(status)) {
room.setAvailable(false);
} else if ("REJECTED".equals(status)) {
room.setAvailable(true);
}
roomService.saveRoom(room);
}

return savedBooking;
} catch (RuntimeException e) {
throw e;
} catch (Exception e) {
throw new RuntimeException("Failed to update booking status: " + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()), e);
}
}

@Transactional
public void cancelBooking(Long id) {
Booking booking = bookingRepository.findById(id)
.orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

// Make room available if booking was approved
if ("APPROVED".equals(booking.getStatus()) && booking.getRoom() != null && roomService != null) {
Room room = booking.getRoom();
room.setAvailable(true);
roomService.saveRoom(room);
}

bookingRepository.delete(booking);
}
}