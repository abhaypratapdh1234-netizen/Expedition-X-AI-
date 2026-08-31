package com.expeditionx.backend.external;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.BodyInserters;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.Instant;

@Service

public class AmadeusClient {

    private static final Logger log = LoggerFactory.getLogger(AmadeusClient.class);

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    @Value("${app.api.amadeus-client-id}")
    private String clientId;

    @Value("${app.api.amadeus-client-secret}")
    private String clientSecret;

    private String accessToken = null;
    private Instant tokenExpiry = Instant.MIN;

    public AmadeusClient(WebClient.Builder builder, ObjectMapper objectMapper) {
        this.webClient = builder.baseUrl("https://test.api.amadeus.com").build();
        this.objectMapper = objectMapper;
    }

    private synchronized void fetchTokenIfNeeded() {
        if (clientId == null || clientId.isEmpty() || clientSecret == null || clientSecret.isEmpty()) {
            return;
        }

        if (accessToken != null && Instant.now().isBefore(tokenExpiry)) {
            return;
        }

        try {
            String response = webClient.post()
                    .uri("/v1/security/oauth2/token")
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                    .body(BodyInserters.fromFormData("grant_type", "client_credentials")
                            .with("client_id", clientId)
                            .with("client_secret", clientSecret))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode node = objectMapper.readTree(response);
            this.accessToken = node.get("access_token").asText();
            int expiresIn = node.get("expires_in").asInt();
            this.tokenExpiry = Instant.now().plusSeconds(expiresIn - 60); // 1 min buffer
        } catch (Exception e) {
            log.error("Failed to fetch Amadeus token: {}", e.getMessage());
            this.accessToken = null;
        }
    }

    public String searchHotelOffers(String cityCode) {
        fetchTokenIfNeeded();
        if (accessToken == null) {
            return "{\"error\":\"Amadeus integration not configured or token failed.\"}";
        }

        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v2/shopping/hotel-offers")
                            .queryParam("cityCode", cityCode)
                            .build())
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch hotel offers from Amadeus: {}", e.getMessage());
            return "{\"data\":[]}";
        }
    }
}
