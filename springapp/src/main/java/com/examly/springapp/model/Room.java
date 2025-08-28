package com.examly.springapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomId;

    private String roomNumber;
    private String roomType;
    private Double pricePerNight;
    private Integer capacity;
    private Boolean available;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Booking> bookings;

    // Custom constructor for tests (no bookings list)
    public Room(Long roomId, String roomNumber, String roomType, Double pricePerNight,
                Integer capacity, Boolean available) {
        this.roomId = roomId;
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.pricePerNight = pricePerNight;
        this.capacity = capacity;
        this.available = available;
    }
}
