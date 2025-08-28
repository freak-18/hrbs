package com.examly.springapp.controller;

import com.examly.springapp.model.Room;
import com.examly.springapp.service.RoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class RoomController {
    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public List<Room> getAllRooms(@RequestParam(required = false) Boolean available) {
        if (Boolean.TRUE.equals(available)) {
            return roomService.getAvailableRooms();
        }
        return roomService.getAllRooms();
    }

    @GetMapping("/available")
    public List<Room> getAvailableRooms() {
        return roomService.getAvailableRooms();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRoomById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(roomService.getRoomById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<Room> createRoom(@RequestBody Room room) {
        Room savedRoom = roomService.saveRoom(room);
        return ResponseEntity.ok(savedRoom);
    }

    @PutMapping("/{id}/free")
    public ResponseEntity<?> freeRoom(@PathVariable Long id) {
        try {
            roomService.freeRoom(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to free room: " + e.getMessage()));
        }
    }

    @PutMapping("/free-all")
    public ResponseEntity<?> freeAllRooms() {
        try {
            roomService.freeAllRooms();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to free all rooms: " + e.getMessage()));
        }
    }

    record ErrorResponse(String message) {}
}
