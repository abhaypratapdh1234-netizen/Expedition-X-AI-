package com.expeditionx.backend.ml;

import com.expeditionx.backend.dto.MiscDTOs.ChatResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

/**
 * True AI chatbot powered by Google Gemini (LLM) integration.
 * Falls back to an advanced mock engine if the API key is missing.
 */
@Component
public class ChatbotEngine {

    private final WebClient webClient;
    private final String geminiApiKey;
    private final ObjectMapper objectMapper;

    private static final String SYSTEM_PROMPT = "You are ExpeditionX AI, a world-class travel assistant for a billion-dollar platform. " +
        "Always be concise, extremely helpful, and format your output with emojis. " +
        "You help with travel itineraries, finding the cheapest tickets (recommend booking 4 weeks early, flights, trains), " +
        "hotel costs, and packing lists. " +
        "If someone asks about tickets, explain flight and train options clearly. " +
        "User question: ";

    public ChatbotEngine(WebClient.Builder webClientBuilder, 
                         @Value("${app.api.gemini-api-key:}") String geminiApiKey,
                         ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.baseUrl("https://generativelanguage.googleapis.com").build();
        this.geminiApiKey = geminiApiKey;
        this.objectMapper = objectMapper;
    }

    public ChatResponse process(String message) {
        // Check if API key is missing or set to the default placeholder
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.contains("your_gemini")) {
            return fallbackMock(message);
        }

        try {
            String fullPrompt = SYSTEM_PROMPT + message;
            
            // Build the exact JSON structure expected by Gemini API
            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(
                        Map.of("text", fullPrompt)
                    ))
                )
            );

            String response = webClient.post()
                .uri("/v1beta/models/gemini-3.5-flash:generateContent?key=" + geminiApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .retryWhen(reactor.util.retry.Retry.backoff(3, java.time.Duration.ofSeconds(1)))
                .block();

            JsonNode root = objectMapper.readTree(response);
            String aiReply = root.path("candidates").get(0)
                                 .path("content").path("parts").get(0)
                                 .path("text").asText();

            return new ChatResponse(aiReply, "GEMINI_AI", null);

        } catch (Exception e) {
            e.printStackTrace();
            return fallbackMock(message);
        }
    }

    private ChatResponse fallbackMock(String message) {
        String lower = message.toLowerCase();
        String reply;
        
        // Smart fallback logic to fulfill the user's requirement even without API key
        if (lower.contains("ticket") || lower.contains("flight") || lower.contains("train") || lower.contains("cheap")) {
            reply = "To find the cheapest tickets ✈️🚆, I recommend booking flights at least 3-4 weeks in advance! For trains in India, IRCTC opens bookings 120 days early. Where are you planning to travel from?";
        } else if (lower.contains("delhi")) {
            reply = "A 3-day itinerary for Delhi is a great idea! Day 1: Explore Old Delhi (Red Fort, Jama Masjid). Day 2: New Delhi (India Gate, Qutub Minar). Day 3: Shopping at Connaught Place. 🕌";
        } else if (lower.contains("goa") || lower.contains("budget")) {
            reply = "A budget trip to Goa under ₹10,000 is totally doable! Stay in lively hostels in North Goa (like Anjuna or Vagator), rent a scooter for cheap local transport, and eat at local shacks. 🌴";
        } else if (lower.contains("manali") || lower.contains("weather")) {
            reply = "In December, Manali transforms into a winter wonderland! Temperatures range from -5°C to 5°C. Expect snowfall, especially in Solang Valley. It's perfect for winter sports! ❄️";
        } else {
            reply = "I am currently running in offline rule-based mode because the Gemini API key is missing or invalid! However, I can still help you with questions about places like Delhi, Goa, Manali, or how to get the cheapest tickets! 🤖\n\nTo activate true AI, please generate a valid Google Gemini API key (starting with AIza) from Google AI Studio and add it to your .env file.";
        }
        
        return new ChatResponse(reply, "FALLBACK_MOCK", null);
    }
}
