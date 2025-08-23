package com.examly.springapp.controller;

import com.examly.springapp.model.Room;
import com.examly.springapp.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class RoomControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RoomRepository roomRepository;

    @BeforeEach
    void setup() {
        roomRepository.deleteAll();
        roomRepository.saveAll(Arrays.asList(
                new Room(null, "101", "Standard", 100.0, 2, true),
                new Room(null, "102", "Deluxe", 150.0, 3, false),
                new Room(null, "201", "Suite", 200.0, 4, true)
        ));
    }

    @Test
    void testGetAllRooms() throws Exception {
        mockMvc.perform(get("/api/rooms"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(3)))
            .andExpect(jsonPath("$[?(@.roomNumber=='101')]").exists())
            .andExpect(jsonPath("$[?(@.roomNumber=='102')]").exists())
            .andExpect(jsonPath("$[?(@.roomType=='Suite')]").exists());
    }

    @Test
    void testGetAvailableRooms() throws Exception {
        mockMvc.perform(get("/api/rooms/available"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[*].available", everyItem(is(true))));
    }

    @Test
    void testGetRoomByIdFound() throws Exception {
        Room room = roomRepository.save(new Room(null, "301", "Deluxe", 175.0, 2, true));
        mockMvc.perform(get("/api/rooms/" + room.getRoomId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.roomNumber", is("301")))
            .andExpect(jsonPath("$.roomType", is("Deluxe")));
    }

    @Test
    void testGetRoomByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/rooms/99999"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message", is("Room not found with id: 99999")));
    }
}
