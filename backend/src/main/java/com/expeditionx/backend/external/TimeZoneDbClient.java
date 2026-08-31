package com.expeditionx.backend.external;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class TimeZoneDbClient {
    private static final Logger log = LoggerFactory.getLogger(TimeZoneDbClient.class);
    private final WebClient webClient;
    
    @Value("${app.api.timezonedb}")
    private String apiKey;

    public TimeZoneDbClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("http://api.timezonedb.com/v2.1").build();
    }

    // Cache for 24h as timezones for coordinates rarely change
    @Cacheable(value = "timezoneCache", key = "#lat + '_' + #lng")
    public String getTimeZoneByPosition(double lat, double lng) {
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/get-time-zone")
                            .queryParam("key", apiKey)
                            .queryParam("format", "json")
                            .queryParam("by", "position")
                            .queryParam("lat", lat)
                            .queryParam("lng", lng)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch timezone from TimeZoneDB for {},{}: {}", lat, lng, e.getMessage());
            return "{\"status\": \"FAILED\"}";
        }
    }
}
