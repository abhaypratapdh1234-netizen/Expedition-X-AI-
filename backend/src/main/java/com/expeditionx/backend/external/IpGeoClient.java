package com.expeditionx.backend.external;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class IpGeoClient {
    private static final Logger log = LoggerFactory.getLogger(IpGeoClient.class);
    private final WebClient webClient;
    
    @Value("${app.api.ipgeo}")
    private String apiKey;

    public IpGeoClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://api.ipgeolocation.io").build();
    }

    // Cache for 1h per IP to stay under rate limits
    @Cacheable(value = "ipGeoCache", key = "#ip")
    public String getGeoByIp(String ip) {
        try {
            // Strip localhost IPv6 to avoid API errors
            String queryIp = (ip.equals("0:0:0:0:0:0:0:1") || ip.equals("127.0.0.1")) ? "" : ip;
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/ipgeo")
                            .queryParam("apiKey", apiKey)
                            .queryParam("ip", queryIp)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch IP Geolocation for {}: {}", ip, e.getMessage());
            return null; // Return null on failure to allow graceful degradation
        }
    }
}
