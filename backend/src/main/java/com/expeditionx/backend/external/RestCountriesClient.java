package com.expeditionx.backend.external;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service

public class RestCountriesClient {

    private static final Logger log = LoggerFactory.getLogger(RestCountriesClient.class);

    private final WebClient webClient;

    public RestCountriesClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://restcountries.com/v3.1").build();
    }

    @Cacheable(value = "countryCache", key = "'name_' + #country")
    public String getCountryByName(String country) {
        try {
            return webClient.get()
                    .uri("/name/{country}", country)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch country {}: {}", country, e.getMessage());
            // Fallback static JSON seed
            return "[{\"name\":{\"common\":\"" + country + "\"}, \"error\":\"Live API unavailable\"}]";
        }
    }

    @Cacheable(value = "countryCache", key = "'alpha_' + #code")
    public String getCountryByAlphaCode(String code) {
        try {
            return webClient.get()
                    .uri("/alpha/{code}", code)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch country code {}: {}", code, e.getMessage());
            return "[{\"error\":\"Live API unavailable\"}]";
        }
    }
}
