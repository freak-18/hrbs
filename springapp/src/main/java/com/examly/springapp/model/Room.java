package com.examly.springapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.Arrays;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomId;

    private String roomNumber;
    private String roomType;
    private Double pricePerNight;
    private Double price; // Alias for frontend compatibility
    private Integer capacity;
    private Boolean available;
    private Double rating;
    
    @ElementCollection
    private List<String> amenities;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Booking> bookings;
    
    @PostLoad
    private void setPrice() {
        this.price = this.pricePerNight;
    }

    // Custom constructor for tests (no bookings list)
    public Room(Long roomId, String roomNumber, String roomType, Double pricePerNight,
                Integer capacity, Boolean available) {
        this.roomId = roomId;
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.pricePerNight = pricePerNight;
        this.price = pricePerNight;
        this.capacity = capacity;
        this.available = available;
        this.rating = 4.0;
        this.amenities = new java.util.ArrayList<>(Arrays.asList("WiFi", "AC", "TV"));
    }
    

}
