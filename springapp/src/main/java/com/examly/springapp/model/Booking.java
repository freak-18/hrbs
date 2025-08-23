package com.examly.springapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    private String guestName;
    private String guestEmail;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private double totalPrice;
    private String status;
    private String notes;

    // Convenience constructor for tests (matches BookingControllerTest)
    public Booking(Long bookingId, Room room, String guestName, String guestEmail,
                   LocalDate checkInDate, LocalDate checkOutDate, double totalPrice,
                   String status, String notes) {
        this.bookingId = bookingId;
        this.room = room;
        this.guestName = guestName;
        this.guestEmail = guestEmail;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.totalPrice = totalPrice;
        this.status = status;
        this.notes = notes;
    }
}
