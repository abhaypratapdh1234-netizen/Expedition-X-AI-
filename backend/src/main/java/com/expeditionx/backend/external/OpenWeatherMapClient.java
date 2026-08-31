package com.expeditionx.backend.external;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service

public class OpenWeatherMapClient {

    private static final Logger log = LoggerFactory.getLogger(OpenWeatherMapClient.class);

    private final WebClient webClient;
    
    @Value("${app.api.openweather}")
    private String apiKey;

    public OpenWeatherMapClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://api.openweathermap.org/data/2.5").build();
    }

    @Cacheable(value = "currentWeatherCache", key = "#city")
    public String getCurrentWeather(String city) {
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/weather")
                            .queryParam("q", city)
                            .queryParam("appid", apiKey)
                            .queryParam("units", "metric")
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch weather for city {}: {}", city, e.getMessage());
            return "{\"error\": \"Rate limit or API unavailable\"}";
        }
    }

    @Cacheable(value = "forecastCache", key = "#city")
    public String getForecast(String city) {
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/forecast")
                            .queryParam("q", city)
                            .queryParam("appid", apiKey)
                            .queryParam("units", "metric")
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch forecast for city {}: {}", city, e.getMessage());
            return "{\"error\": \"Rate limit or API unavailable\"}";
        }
    }
}
