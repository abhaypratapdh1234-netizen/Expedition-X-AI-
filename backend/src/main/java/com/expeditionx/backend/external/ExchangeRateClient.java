package com.expeditionx.backend.external;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service

public class ExchangeRateClient {

    private static final Logger log = LoggerFactory.getLogger(ExchangeRateClient.class);

    private final WebClient webClient;

    public ExchangeRateClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://open.er-api.com/v6/latest").build();
    }

    @Cacheable(value = "exchangeRateCache", key = "#baseCurrency")
    public String getRates(String baseCurrency) {
        try {
            return webClient.get()
                    .uri("/{baseCurrency}", baseCurrency)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch exchange rates for {}: {}", baseCurrency, e.getMessage());
            return "{\"rates\":{}}";
        }
    }
}
