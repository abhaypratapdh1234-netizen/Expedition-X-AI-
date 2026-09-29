package com.expeditionx.backend.external;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Component
public class AviationstackClient {

    private static final Logger log = LoggerFactory.getLogger(AviationstackClient.class);
    private final WebClient webClient;

    @Value("${app.api.aviationstack:}")
    private String apiKey;

    public AviationstackClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("http://api.aviationstack.com/v1").build();
    }

    public JsonNode searchFlights(String depIata, String arrIata, String flightDate, String flightIata, String flightStatus) {
        if (apiKey == null || apiKey.isBlank()) {
            log.info("Aviationstack API key is not configured; using schedule engine.");
            return null;
        }

        try {
            return webClient.get()
                    .uri(uriBuilder -> {
                        uriBuilder.path("/flights")
                                .queryParam("access_key", apiKey)
                                .queryParam("limit", "100");
                        if (depIata != null && !depIata.isBlank()) {
                            uriBuilder.queryParam("dep_iata", depIata);
                        }
                        if (arrIata != null && !arrIata.isBlank()) {
                            uriBuilder.queryParam("arr_iata", arrIata);
                        }
                        // Note: Aviationstack free plan triggers 403 Forbidden if flight_date is passed.
                        // We therefore do not pass flight_date to the external API; date matching/adaptation
                        // is performed in FlightService.
                        if (flightIata != null && !flightIata.isBlank()) {
                            uriBuilder.queryParam("flight_iata", flightIata);
                        }
                        if (flightStatus != null && !flightStatus.isBlank()) {
                            uriBuilder.queryParam("flight_status", flightStatus);
                        }
                        return uriBuilder.build();
                    })
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.warn("Aviationstack returned HTTP {}: {}", e.getStatusCode(), e.getStatusText());
            return null;
        } catch (Exception e) {
            log.warn("Aviationstack API call failed: {}", e.getMessage());
            return null;
        }
    }
}
