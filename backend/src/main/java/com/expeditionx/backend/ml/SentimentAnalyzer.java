package com.expeditionx.backend.ml;

import org.springframework.stereotype.Component;

/**
 * VADER-style sentiment analyzer using keyword-based scoring.
 * Tags reviews as POSITIVE / NEGATIVE / NEUTRAL with a score from -1.0 to 1.0.
 */
@Component
public class SentimentAnalyzer {

    private static final String[] POSITIVE = {
        "amazing", "wonderful", "beautiful", "excellent", "love", "loved", "great",
        "fantastic", "awesome", "perfect", "incredible", "stunning", "recommend",
        "best", "superb", "outstanding", "delightful", "enjoyable", "pleasant",
        "clean", "friendly", "helpful", "comfortable", "gorgeous", "breathtaking",
        "spectacular", "magnificent", "charming", "cozy", "spacious", "worth"
    };

    private static final String[] NEGATIVE = {
        "terrible", "awful", "horrible", "bad", "worst", "dirty", "rude",
        "disappointing", "overpriced", "crowded", "noisy", "boring", "dangerous",
        "disgusting", "waste", "avoid", "poor", "slow", "cold", "uncomfortable",
        "broken", "scam", "unsafe", "smelly", "expensive", "mediocre"
    };

    private static final String[] INTENSIFIERS = {"very", "really", "extremely", "absolutely", "totally", "so"};
    private static final String[] NEGATORS = {"not", "no", "never", "neither", "nor", "don't", "doesn't", "wasn't"};

    public SentimentResult analyze(String text) {
        if (text == null || text.isBlank()) {
            return new SentimentResult(0.0, "NEUTRAL");
        }

        String lower = text.toLowerCase();
        String[] words = lower.split("\\W+");

        double score = 0;
        boolean negated = false;
        boolean intensified = false;

        for (int i = 0; i < words.length; i++) {
            String word = words[i];

            // Check for negators
            for (String neg : NEGATORS) {
                if (word.equals(neg)) { negated = true; continue; }
            }
            // Check for intensifiers
            for (String intens : INTENSIFIERS) {
                if (word.equals(intens)) { intensified = true; continue; }
            }

            double wordScore = 0;
            for (String pos : POSITIVE) {
                if (word.contains(pos)) { wordScore = 1.0; break; }
            }
            if (wordScore == 0) {
                for (String neg : NEGATIVE) {
                    if (word.contains(neg)) { wordScore = -1.0; break; }
                }
            }

            if (wordScore != 0) {
                if (intensified) { wordScore *= 1.5; intensified = false; }
                if (negated) { wordScore *= -1; negated = false; }
                score += wordScore;
            }
        }

        // Normalize to -1.0 to 1.0
        double normalized = Math.max(-1.0, Math.min(1.0, score / Math.max(words.length * 0.1, 1)));

        String label;
        if (normalized > 0.1) label = "POSITIVE";
        else if (normalized < -0.1) label = "NEGATIVE";
        else label = "NEUTRAL";

        return new SentimentResult(Math.round(normalized * 100.0) / 100.0, label);
    }

    public record SentimentResult(double score, String label) {}
}
