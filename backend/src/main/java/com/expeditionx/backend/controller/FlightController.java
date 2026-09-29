package com.expeditionx.backend.controller;

import com.expeditionx.backend.dto.FlightResponse;
import com.expeditionx.backend.service.FlightService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/flights")
public class FlightController {

    private final FlightService flightService;

    public FlightController(FlightService flightService) {
        this.flightService = flightService;
    }

    @GetMapping
    public ResponseEntity<FlightResponse> searchFlights(
            @RequestParam(required = false) String departure,
            @RequestParam(required = false) String arrival,
            @RequestParam(required = false) String flightDate,
            @RequestParam(required = false) String flightNumber,
            @RequestParam(required = false) String status) {
        
        FlightResponse response = flightService.searchFlights(departure, arrival, flightDate, flightNumber, status);
        
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }
}
