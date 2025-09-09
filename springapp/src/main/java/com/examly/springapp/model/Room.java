package com.examly.springapp.model;

import jakarta.persistence.*;
import java.util.Arrays;
import java.util.List;

@Entity
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long roomId;

    @Column(name = "room_number")
    private String roomNumber;
    
    @Column(name = "room_type")
    private String roomType;
    
    @Column(name = "price_per_night")
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

    public Room() {}

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

    // Getters and Setters
    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }
    
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    
    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }
    
    public Double getPricePerNight() { return pricePerNight; }
    public void setPricePerNight(Double pricePerNight) { 
        this.pricePerNight = pricePerNight;
        this.price = pricePerNight;
    }
    
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    
    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
    
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    
    public List<String> getAmenities() { return amenities; }
    public void setAmenities(List<String> amenities) { this.amenities = amenities; }
    
    public List<Booking> getBookings() { return bookings; }
    public void setBookings(List<Booking> bookings) { this.bookings = bookings; }
}
