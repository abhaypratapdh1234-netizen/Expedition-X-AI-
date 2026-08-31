package com.expeditionx.backend.external;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service

public class OsrmClient {

    private static final Logger log = LoggerFactory.getLogger(OsrmClient.class);

    private WebClient webClient;
    private final WebClient.Builder builder;

    @Value("${app.api.osrm-base-url}")
    private String baseUrl;

    public OsrmClient(WebClient.Builder builder) {
        this.builder = builder;
    }

    private WebClient getWebClient() {
        if (webClient == null) {
            webClient = builder.baseUrl(baseUrl).build();
        }
        return webClient;
    }

    @Cacheable(value = "routeCache", key = "#lon1 + ',' + #lat1 + ';' + #lon2 + ',' + #lat2")
    public String getRoute(double lon1, double lat1, double lon2, double lat2) {
        try {
            return getWebClient().get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/route/v1/driving/{coords}")
                            .queryParam("overview", "full")
                            .queryParam("geometries", "geojson")
                            .build(lon1 + "," + lat1 + ";" + lon2 + "," + lat2))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch route: {}", e.getMessage());
            return "{\"error\":\"Routing unavailable\"}";
        }
    }

    @Cacheable(value = "routeCache", key = "'matrix_' + #coords")
    public String getDistanceMatrix(String coords) {
        // coords format: lon1,lat1;lon2,lat2;lon3,lat3
        try {
            return getWebClient().get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/table/v1/driving/{coords}")
                            .build(coords))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch distance matrix: {}", e.getMessage());
            return "{\"error\":\"Matrix unavailable\"}";
        }
    }
}
