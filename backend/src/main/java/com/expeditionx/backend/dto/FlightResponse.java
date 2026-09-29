package com.expeditionx.backend.dto;

import java.util.List;

public class FlightResponse {
    private boolean success;
    private String message;
    private List<FlightData> data;

    public FlightResponse() {}

    public FlightResponse(boolean success, String message, List<FlightData> data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public List<FlightData> getData() { return data; }
    public void setData(List<FlightData> data) { this.data = data; }
}
