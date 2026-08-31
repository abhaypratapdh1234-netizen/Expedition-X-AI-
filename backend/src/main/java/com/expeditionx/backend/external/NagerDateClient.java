package com.expeditionx.backend.external;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service

public class NagerDateClient {

    private static final Logger log = LoggerFactory.getLogger(NagerDateClient.class);

    private final WebClient webClient;

    public NagerDateClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://date.nager.at/api/v3").build();
    }

    @Cacheable(value = "holidaysCache", key = "#countryCode + '_' + #year")
    public String getPublicHolidays(int year, String countryCode) {
        try {
            return webClient.get()
                    .uri("/PublicHolidays/{year}/{countryCode}", year, countryCode)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch holidays for {} {}: {}", countryCode, year, e.getMessage());
            return "[]";
        }
    }

    @Cacheable(value = "countryCache", key = "'availableHolidays'")
    public String getAvailableCountries() {
        try {
            return webClient.get()
                    .uri("/AvailableCountries")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch available holiday countries: {}", e.getMessage());
            return "[]";
        }
    }
}
