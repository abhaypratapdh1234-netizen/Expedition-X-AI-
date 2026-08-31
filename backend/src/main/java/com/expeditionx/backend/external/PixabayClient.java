package com.expeditionx.backend.external;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class PixabayClient {
    private static final Logger log = LoggerFactory.getLogger(PixabayClient.class);
    private final WebClient webClient;
    
    @Value("${app.api.pixabay}")
    private String apiKey;

    public PixabayClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://pixabay.com/api/").build();
    }

    @Cacheable(value = "pixabayCache", key = "#query + '_' + #perPage")
    public String searchPhotos(String query, int perPage) {
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .queryParam("key", apiKey)
                            .queryParam("q", query)
                            .queryParam("image_type", "photo")
                            .queryParam("per_page", perPage)
                            .queryParam("safesearch", "true")
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch images from Pixabay for query {}: {}", query, e.getMessage());
            return "{\"hits\": []}";
        }
    }
}
