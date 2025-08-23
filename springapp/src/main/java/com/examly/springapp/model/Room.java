package com.examly.springapp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor

public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomId;

    private String roomNumber;
    private String roomType;
    private double price;
    private int capacity;
    private boolean available;

    // Extra convenience constructor for tests
    public Room(Long roomId, String roomNumber, String roomType, double price, int capacity, boolean available) {
        this.roomId = roomId;
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.price = price;
        this.capacity = capacity;
        this.available = available;
    }

    public Long getRoomId() {
        return roomId;
    }

    public boolean getAvailable() {
        return available;
    }
}
