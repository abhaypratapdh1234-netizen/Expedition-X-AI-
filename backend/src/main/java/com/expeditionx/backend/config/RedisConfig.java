package com.expeditionx.backend.config;

import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;

import java.time.Duration;

@Configuration
@EnableCaching
public class RedisConfig {

    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer() {
        return (builder) -> builder
                .withCacheConfiguration("placesCache",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(24)))
                .withCacheConfiguration("placeDetailCache",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(24)))
                .withCacheConfiguration("currentWeatherCache",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(60)))
                .withCacheConfiguration("forecastCache",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(6)))
                .withCacheConfiguration("countryCache",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofDays(7)))
                .withCacheConfiguration("geocodeCache",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofDays(30)))
                .withCacheConfiguration("routeCache",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(1)))
                .withCacheConfiguration("imageSearchCache",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofDays(7)))
                .withCacheConfiguration("exchangeRateCache",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(12)))
                .withCacheConfiguration("holidaysCache",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofDays(7)));
    }
}
