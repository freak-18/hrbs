package com.examly.springapp.service;

import com.examly.springapp.model.Booking;
import com.examly.springapp.model.Room;
import com.examly.springapp.repository.BookingRepository;
import com.examly.springapp.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;

// Custom Exceptions
class RoomNotFoundException extends RuntimeException {
    public RoomNotFoundException(String message) { super(message); }
}

class InvalidBookingException extends RuntimeException {
    public InvalidBookingException(String message) { super(message); }
}

class BookingNotFoundException extends RuntimeException {
    public BookingNotFoundException(String message) { super(message); }
}

@Service
public class BookingService {

private final BookingRepository bookingRepository;
private final RoomRepository roomRepository;

public BookingService(BookingRepository bookingRepository, RoomRepository roomRepository) {
this.bookingRepository = bookingRepository;
this.roomRepository = roomRepository;
}

public Booking createBooking(Booking booking) {
Room room = roomRepository.findById(booking.getRoom().getRoomId())
.orElseThrow(() -> new RoomNotFoundException(
"Room not found with id: " + booking.getRoom().getRoomId()));

if (!room.getAvailable()) {
throw new InvalidBookingException("Room is not available");
}

long nights = ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
if (nights <= 0) {
throw new InvalidBookingException("Check-out date must be after check-in date");
}

booking.setTotalPrice(nights * room.getPrice());
booking.setStatus("PENDING");
booking.setRoom(room);

return bookingRepository.save(booking);
}

public List<Booking> getAllBookings() {
return bookingRepository.findAll();
}

public Booking getBookingById(Long bookingId) {
return bookingRepository.findById(bookingId)
.orElseThrow(() -> new BookingNotFoundException(
"Booking not found with id: " + bookingId));
}

public Booking updateStatus(Long bookingId, String status) {
Booking booking = bookingRepository.findById(bookingId)
.orElseThrow(() -> new BookingNotFoundException(
"Booking not found with id: " + bookingId));

if (!status.equalsIgnoreCase("APPROVED") && !status.equalsIgnoreCase("REJECTED")) {
throw new InvalidBookingException("Invalid status: " + status);
}

booking.setStatus(status);

Room room = booking.getRoom();
if ("APPROVED".equalsIgnoreCase(status)) {
room.setAvailable(false);
} else if ("REJECTED".equalsIgnoreCase(status)) {
room.setAvailable(true);
}

roomRepository.save(room);
return bookingRepository.save(booking);
}
}