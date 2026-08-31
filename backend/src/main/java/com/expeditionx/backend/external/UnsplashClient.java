package com.expeditionx.backend.external;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service

public class UnsplashClient {

    private static final Logger log = LoggerFactory.getLogger(UnsplashClient.class);

    private final WebClient webClient;

    public UnsplashClient(WebClient.Builder builder, @Value("${app.api.unsplash}") String accessKey) {
        this.webClient = builder
                .baseUrl("https://api.unsplash.com")
                .defaultHeader("Authorization", "Client-ID " + accessKey)
                .build();
    }

    @Cacheable(value = "imageSearchCache", key = "#query")
    public String searchPhotos(String query) {
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search/photos")
                            .queryParam("query", query)
                            .queryParam("per_page", 5)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch images for {}: {}", query, e.getMessage());
            return "{\"results\":[]}";
        }
    }
}
