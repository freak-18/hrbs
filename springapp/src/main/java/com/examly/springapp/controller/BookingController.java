package com.examly.springapp.controller;

import com.examly.springapp.model.Booking;
import com.examly.springapp.model.Room;
import com.examly.springapp.service.BookingService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = {"http://localhost:8081","http://localhost:3000"})
public class BookingController {

    private final BookingService bookingService;
    
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Create Booking
    @PostMapping
    public Map<String, Object> createBooking(@RequestBody Booking bookingBody) {
        Booking saved = bookingService.createBooking(bookingBody);

        Map<String, Object> resp = new HashMap<>();
        resp.put("bookingId", saved.getBookingId());
        resp.put("status", saved.getStatus());
        resp.put("totalPrice", saved.getTotalPrice());
        return resp;
    }

    // Get All Bookings
    @GetMapping
    public List<Map<String, Object>> getAllBookings() {
        return bookingService.getAllBookings().stream().map(b -> {
            Map<String, Object> m = new HashMap<>();
            m.put("bookingId", b.getBookingId());
            m.put("guestName", b.getGuestName());

            Map<String, Object> roomMap = new HashMap<>();
            Room r = b.getRoom(); // Directly from booking
            roomMap.put("roomNumber", r != null ? r.getRoomNumber() : null);

            m.put("room", roomMap);
            m.put("checkInDate", b.getCheckInDate() != null ? b.getCheckInDate().toString() : null);
            m.put("checkOutDate", b.getCheckOutDate() != null ? b.getCheckOutDate().toString() : null);
            m.put("status", b.getStatus());
            return m;
        }).toList();
    }

    // Update Booking Status
    @PutMapping("/{id}/status")
    public Booking updateStatus(@PathVariable Long id, @RequestParam String status) {
        return bookingService.updateStatus(id, status);
    }
}
