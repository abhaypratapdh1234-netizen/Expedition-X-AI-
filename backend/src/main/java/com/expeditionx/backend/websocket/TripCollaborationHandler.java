package com.expeditionx.backend.websocket;

import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class TripCollaborationHandler {

    private final SimpMessagingTemplate messagingTemplate;

    public TripCollaborationHandler(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Handle itinerary update messages for live co-editing.
     * Clients send to /app/trips/{tripId}/itinerary-update
     * All subscribers of /topic/trips/{tripId} receive the update.
     */
    @MessageMapping("/trips/{tripId}/itinerary-update")
    @SendTo("/topic/trips/{tripId}")
    public Map<String, Object> handleItineraryUpdate(@DestinationVariable Long tripId, Map<String, Object> update) {
        update.put("tripId", tripId);
        update.put("timestamp", System.currentTimeMillis());
        return update;
    }

    /**
     * Handle presence/join messages.
     * Clients send to /app/trips/{tripId}/presence
     */
    @MessageMapping("/trips/{tripId}/presence")
    @SendTo("/topic/trips/{tripId}/presence")
    public Map<String, Object> handlePresence(@DestinationVariable Long tripId, Map<String, Object> presence) {
        presence.put("tripId", tripId);
        presence.put("timestamp", System.currentTimeMillis());
        return presence;
    }
}
