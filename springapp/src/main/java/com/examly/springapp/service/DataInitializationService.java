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
            Room room1 = new Room(null, "101", "Deluxe Room", 3500.0, 3500.0, 2, true, 4.5, Arrays.asList("WiFi", "AC", "TV", "Room Service"), null);
            Room room2 = new Room(null, "102", "Premium Suite", 5500.0, 5500.0, 4, false, 4.7, Arrays.asList("WiFi", "AC", "TV", "Mini Bar", "Balcony"), null);
            Room room3 = new Room(null, "201", "Executive Room", 4200.0, 4200.0, 3, true, 4.3, Arrays.asList("WiFi", "AC", "TV", "Work Desk"), null);
            Room room4 = new Room(null, "202", "Royal Suite", 8500.0, 8500.0, 4, true, 4.9, Arrays.asList("WiFi", "AC", "TV", "Jacuzzi", "Butler Service"), null);
            Room room5 = new Room(null, "301", "Business Room", 4800.0, 4800.0, 2, false, 4.4, Arrays.asList("WiFi", "AC", "TV", "Conference Setup"), null);
            Room room6 = new Room(null, "302", "Family Suite", 6200.0, 6200.0, 6, true, 4.6, Arrays.asList("WiFi", "AC", "TV", "Kitchen", "Kids Area"), null);
            
            List<Room> sampleRooms = Arrays.asList(room1, room2, room3, room4, room5, room6);
            
            roomRepository.saveAll(sampleRooms);
            System.out.println("Sample rooms with ratings and amenities initialized successfully!");
        }
    }
}