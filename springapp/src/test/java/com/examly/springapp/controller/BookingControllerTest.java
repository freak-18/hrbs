package com.examly.springapp.controller;

import com.examly.springapp.model.Booking;
import com.examly.springapp.model.Room;
import com.examly.springapp.repository.BookingRepository;
import com.examly.springapp.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class BookingControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private BookingRepository bookingRepository;

    private Room testRoom;
    private Room unavailableRoom;

    @BeforeEach
    void setup() {
        bookingRepository.deleteAll();
        roomRepository.deleteAll();
        testRoom = roomRepository.save(new Room(null, "101", "Standard", 100.0, 2, true));
        unavailableRoom = roomRepository.save(new Room(null, "102", "Suite", 300.0, 4, false));
    }

    @Test
    void testCreateBookingSuccess() throws Exception {
        String body = String.format("{" +
                "\"roomId\": %d, " +
                "\"guestName\": \"Alice\", " +
                "\"guestEmail\": \"alice@example.com\", " +
                "\"checkInDate\": \"2023-12-01\", " +
                "\"checkOutDate\": \"2023-12-04\" }", testRoom.getRoomId());
        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.bookingId").exists())
            .andExpect(jsonPath("$.room.roomNumber", is("101")))
            .andExpect(jsonPath("$.totalPrice", is(300.0)))
            .andExpect(jsonPath("$.status", is("PENDING")))
            .andExpect(jsonPath("$.createdAt").exists());
    }

    @Test
    void testCreateBookingRoomNotFound() throws Exception {
        String body = "{\"roomId\":99999,\"guestName\":\"Bob\",\"guestEmail\":\"bob@example.com\",\"checkInDate\":\"2023-12-01\",\"checkOutDate\":\"2023-12-04\"}";
        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message", is("Room not found with id: 99999")));
    }

    @Test
    void testCreateBookingRoomNotAvailable() throws Exception {
        String body = String.format("{" +
                "\"roomId\": %d, " +
                "\"guestName\": \"Bob\", " +
                "\"guestEmail\": \"bob@example.com\", " +
                "\"checkInDate\": \"2023-12-01\", " +
                "\"checkOutDate\": \"2023-12-04\" }", unavailableRoom.getRoomId());
        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message", is("Room is not available")));
    }

    @Test
    void testCreateBookingInvalidEmailFormat() throws Exception {
        String body = String.format("{" +
                "\"roomId\": %d, " +
                "\"guestName\": \"Charlie\", " +
                "\"guestEmail\": \"bademail\", " +
                "\"checkInDate\": \"2023-12-01\", " +
                "\"checkOutDate\": \"2023-12-04\" }", testRoom.getRoomId());
        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message", containsString("Invalid email format")));
    }

    @Test
    void testCreateBookingInvalidDateOrder() throws Exception {
        String body = String.format("{" +
                "\"roomId\": %d, " +
                "\"guestName\": \"Daniel\", " +
                "\"guestEmail\": \"daniel@example.com\", " +
                "\"checkInDate\": \"2023-12-07\", " +
                "\"checkOutDate\": \"2023-12-01\" }", testRoom.getRoomId());
        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message", containsString("Check-out date must be after check-in date")));
    }

    @Test
    void testGetAllBookings() throws Exception {
        Booking booking1 = new Booking(null, testRoom, "Ann", "ann@example.com", LocalDate.of(2023,12,1), LocalDate.of(2023,12,2), 100.0, "PENDING", null);
        Booking booking2 = new Booking(null, testRoom, "Ben", "ben@example.com", LocalDate.of(2023,12,2), LocalDate.of(2023,12,3), 100.0, "APPROVED", null);
        bookingRepository.saveAll(Arrays.asList(booking1, booking2));

        mockMvc.perform(get("/api/bookings"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].guestName", anyOf(is("Ann"), is("Ben"))))
            .andExpect(jsonPath("$[1].room.roomId", is(testRoom.getRoomId().intValue())));
    }

    @Test
    void testGetBookingByIdFound() throws Exception {
        Booking booking = bookingRepository.save(new Booking(null, testRoom, "Cleo", "cleo@example.com", LocalDate.of(2023,12,10), LocalDate.of(2023,12,13), 300.0, "PENDING", null));
        mockMvc.perform(get("/api/bookings/" + booking.getBookingId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.guestName", is("Cleo")))
            .andExpect(jsonPath("$.totalPrice", is(300.0)));
    }

    @Test
    void testGetBookingByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/bookings/88888"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message", is("Booking not found with id: 88888")));
    }

    @Test
    void testUpdateBookingStatusApprove() throws Exception {
        Booking booking = bookingRepository.save(new Booking(null, testRoom, "Tim", "tim@example.com", LocalDate.of(2023,12,1), LocalDate.of(2023,12,4), 300.0, "PENDING", null));
        String body = "{\"status\":\"APPROVED\"}";
        mockMvc.perform(put("/api/bookings/" + booking.getBookingId() + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status", is("APPROVED")));
        Room after = roomRepository.findById(testRoom.getRoomId()).get();
        org.junit.jupiter.api.Assertions.assertFalse(after.getAvailable(), "Room should be unavailable after approval");
    }

    @Test
    void testUpdateBookingStatusReject() throws Exception {
        Booking booking = bookingRepository.save(new Booking(null, testRoom, "Rob", "rob@example.com", LocalDate.of(2023,12,1), LocalDate.of(2023,12,2), 100.0, "PENDING", null));
        String body = "{\"status\":\"REJECTED\"}";
        mockMvc.perform(put("/api/bookings/" + booking.getBookingId() + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status", is("REJECTED")));
        Room after = roomRepository.findById(testRoom.getRoomId()).get();
        org.junit.jupiter.api.Assertions.assertTrue(after.getAvailable(), "Room should stay available after rejection");
    }

    @Test
    void testUpdateBookingStatusInvalid() throws Exception {
        Booking booking = bookingRepository.save(new Booking(null, testRoom, "Lin", "lin@example.com", LocalDate.of(2023,12,1), LocalDate.of(2023,12,2), 100.0, "PENDING", null));
        String body = "{\"status\":\"WRONG\"}";
        mockMvc.perform(put("/api/bookings/" + booking.getBookingId() + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message", containsString("Invalid status")));
    }

    @Test
    void testUpdateBookingStatusNotFound() throws Exception {
        String body = "{\"status\":\"APPROVED\"}";
        mockMvc.perform(put("/api/bookings/77777/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message", is("Booking not found with id: 77777")));
    }
}
