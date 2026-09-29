package com.expeditionx.backend.dto;

public class FlightData {
    private String flightDate;
    private String status;
    private Airline airline;
    private FlightDetail flight;
    private Airport departure;
    private Airport arrival;
    private Aircraft aircraft;

    public String getFlightDate() { return flightDate; }
    public void setFlightDate(String flightDate) { this.flightDate = flightDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Airline getAirline() { return airline; }
    public void setAirline(Airline airline) { this.airline = airline; }
    public FlightDetail getFlight() { return flight; }
    public void setFlight(FlightDetail flight) { this.flight = flight; }
    public Airport getDeparture() { return departure; }
    public void setDeparture(Airport departure) { this.departure = departure; }
    public Airport getArrival() { return arrival; }
    public void setArrival(Airport arrival) { this.arrival = arrival; }
    public Aircraft getAircraft() { return aircraft; }
    public void setAircraft(Aircraft aircraft) { this.aircraft = aircraft; }

    public static class Airline {
        private String name;
        private String iata;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getIata() { return iata; }
        public void setIata(String iata) { this.iata = iata; }
    }
    
    public static class FlightDetail {
        private String number;
        private String iata;
        public String getNumber() { return number; }
        public void setNumber(String number) { this.number = number; }
        public String getIata() { return iata; }
        public void setIata(String iata) { this.iata = iata; }
    }
    
    public static class Airport {
        private String airport;
        private String iata;
        private String scheduled;
        public String getAirport() { return airport; }
        public void setAirport(String airport) { this.airport = airport; }
        public String getIata() { return iata; }
        public void setIata(String iata) { this.iata = iata; }
        public String getScheduled() { return scheduled; }
        public void setScheduled(String scheduled) { this.scheduled = scheduled; }
    }
    
    public static class Aircraft {
        private String registration;
        private String iata;
        public String getRegistration() { return registration; }
        public void setRegistration(String registration) { this.registration = registration; }
        public String getIata() { return iata; }
        public void setIata(String iata) { this.iata = iata; }
    }
}
