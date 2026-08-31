package com.expeditionx.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
@EnableCaching
@EnableScheduling
public class ExpeditionXApplication {
    public static void main(String[] args) {
        SpringApplication.run(ExpeditionXApplication.class, args);
    }

    @Bean
    public CommandLineRunner resetSequences(JdbcTemplate jdbcTemplate) {
        return args -> {
            String[] tables = {
                "users", "places", "hotels", "notifications", "local_events", 
                "trips", "bookings", "wishlists", "gamification_profiles", 
                "reviews", "itinerary_items"
            };
            for (String table : tables) {
                try {
                    Integer maxId = jdbcTemplate.queryForObject("SELECT MAX(id) FROM " + table, Integer.class);
                    int nextId = (maxId == null ? 0 : maxId) + 1;
                    jdbcTemplate.execute("ALTER TABLE " + table + " ALTER COLUMN id RESTART WITH " + nextId);
                } catch (Exception e) {
                    // Ignore if table doesn't exist yet or other errors
                }
            }
        };
    }
}
