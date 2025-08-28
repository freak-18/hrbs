package com.examly.springapp.service;

import com.examly.springapp.model.Room;
import com.examly.springapp.repository.RoomRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class DataInitializationService implements CommandLineRunner {
    
    private final RoomRepository roomRepository;
    
    public DataInitializationService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }
    
    @Override
    public void run(String... args) throws Exception {
        // Initialize sample rooms if database is empty
        if (roomRepository.count() == 0) {
            Room room1 = new Room(null, "101", "Deluxe Room", 3500.0, 2, true);
            room1.setRating(4.5);
            room1.setAmenities(new java.util.ArrayList<>(Arrays.asList("WiFi", "AC", "TV", "Room Service")));
            
            Room room2 = new Room(null, "102", "Premium Suite", 5500.0, 4, true);
            room2.setRating(4.7);
            room2.setAmenities(new java.util.ArrayList<>(Arrays.asList("WiFi", "AC", "TV", "Mini Bar", "Balcony")));
            
            Room room3 = new Room(null, "201", "Executive Room", 4200.0, 3, true);
            room3.setRating(4.3);
            room3.setAmenities(new java.util.ArrayList<>(Arrays.asList("WiFi", "AC", "TV", "Work Desk")));
            
            Room room4 = new Room(null, "202", "Royal Suite", 8500.0, 4, true);
            room4.setRating(4.9);
            room4.setAmenities(new java.util.ArrayList<>(Arrays.asList("WiFi", "AC", "TV", "Jacuzzi", "Butler Service")));
            
            Room room5 = new Room(null, "301", "Business Room", 4800.0, 2, true);
            room5.setRating(4.4);
            room5.setAmenities(new java.util.ArrayList<>(Arrays.asList("WiFi", "AC", "TV", "Conference Setup")));
            
            Room room6 = new Room(null, "302", "Family Suite", 6200.0, 6, true);
            room6.setRating(4.6);
            room6.setAmenities(new java.util.ArrayList<>(Arrays.asList("WiFi", "AC", "TV", "Kitchen", "Kids Area")));
            
            List<Room> sampleRooms = Arrays.asList(room1, room2, room3, room4, room5, room6);
            
            roomRepository.saveAll(sampleRooms);
            System.out.println("Sample rooms with ratings and amenities initialized successfully!");
        }
    }
}