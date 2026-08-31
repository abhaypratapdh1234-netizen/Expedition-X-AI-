package com.expeditionx.backend.external;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service

public class OpenTripMapClient {

    private static final Logger log = LoggerFactory.getLogger(OpenTripMapClient.class);

    private final WebClient webClient;
    
    @Value("${app.api.opentripmap}")
    private String apiKey;

    public OpenTripMapClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://api.opentripmap.com/0.1/en/places").build();
    }

    @Cacheable(value = "placesCache", key = "#city")
    public String getCityCoordinates(String city) {
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/geoname")
                            .queryParam("name", city)
                            .queryParam("apikey", apiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch coordinates for city {}: {}", city, e.getMessage());
            return "{\"error\": \"Rate limit or API unavailable\"}";
        }
    }

    @Cacheable(value = "placesCache", key = "#lat + '_' + #lon + '_' + #radius")
    public String getPlacesInRadius(double lat, double lon, int radius, String kinds) {
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/radius")
                            .queryParam("radius", radius)
                            .queryParam("lon", lon)
                            .queryParam("lat", lat)
                            .queryParam("kinds", kinds)
                            .queryParam("apikey", apiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch places for lat/lon: {}", e.getMessage());
            return "{\"error\": \"Rate limit or API unavailable\"}";
        }
    }

    @Cacheable(value = "placeDetailCache", key = "#xid")
    public String getPlaceDetails(String xid) {
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/xid/{xid}")
                            .queryParam("apikey", apiKey)
                            .build(xid))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch details for place {}: {}", xid, e.getMessage());
            return "{\"error\": \"Rate limit or API unavailable\"}";
        }
    }
}
