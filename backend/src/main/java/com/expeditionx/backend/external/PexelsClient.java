package com.expeditionx.backend.external;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class PexelsClient {
    private static final Logger log = LoggerFactory.getLogger(PexelsClient.class);
    private final WebClient webClient;
    
    @Value("${app.api.pexels}")
    private String apiKey;

    public PexelsClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://api.pexels.com/v1/").build();
    }

    @Cacheable(value = "pexelsCache", key = "#query + '_' + #perPage")
    public String searchPhotos(String query, int perPage) {
        try {
            if (apiKey == null || apiKey.isEmpty() || apiKey.equals("your_key_here")) {
                return "{\"photos\": []}";
            }
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("search")
                            .queryParam("query", query)
                            .queryParam("per_page", perPage)
                            .build())
                    .header("Authorization", apiKey)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch images from Pexels for query {}: {}", query, e.getMessage());
            return "{\"photos\": []}";
        }
    }
}
