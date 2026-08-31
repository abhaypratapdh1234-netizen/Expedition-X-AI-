package com.expeditionx.backend;

import com.expeditionx.backend.entity.Place;
import com.expeditionx.backend.entity.Review;
import com.expeditionx.backend.entity.User;
import com.expeditionx.backend.repository.PlaceRepository;
import com.expeditionx.backend.repository.ReviewRepository;
import com.expeditionx.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ReviewRepository reviewRepository;
    private final PlaceRepository placeRepository;
    private final UserRepository userRepository;

    public DataSeeder(ReviewRepository reviewRepository, PlaceRepository placeRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.placeRepository = placeRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (reviewRepository.count() == 0) {
            System.out.println("Seeding real reviews into the database...");
            
            // Get first user (or create a dummy one if none exists)
            User user = userRepository.findById(1L).orElse(null);
            if (user == null) {
                user = new User();
                user.setName("System Admin");
                user.setEmail("admin@expeditionx.com");
                user.setPasswordHash("password");
                user = userRepository.save(user);
            }

            // Real mock data for various places
            List<Place> places = placeRepository.findAll();
            if (places.isEmpty()) return;

            String[] positiveComments = {
                "Absolutely magnificent! The history and architecture are breathtaking. Go early morning to avoid crowds.",
                "Most otherworldly landscape I've ever seen. Magical.",
                "Worth every rupee. Sunrise visit is spectacular.",
                "Beautiful place, totally worth the hype!",
                "Amazing experience! Definitely coming back.",
                "A must-visit for everyone. The scenery is unreal.",
                "Loved the vibe! Great food nearby as well.",
                "Incredible spot for photography. 10/10."
            };
            
            String[] mixedComments = {
                "Beautiful but gets very crowded in peak season. The plastic litter is disappointing.",
                "Nice place, but the entry fee is a bit steep.",
                "Good for a one-time visit, nothing too spectacular.",
                "Enjoyed it, but parking was a nightmare."
            };

            Random random = new Random();

            for (Place place : places) {
                int numReviews = random.nextInt(3) + 1; // 1 to 3 reviews per place
                
                for (int i = 0; i < numReviews; i++) {
                    Review review = new Review();
                    review.setUser(user);
                    review.setPlace(place);
                    
                    if (random.nextDouble() > 0.3) {
                        review.setRating(random.nextInt(2) + 4); // 4 or 5
                        review.setComment(positiveComments[random.nextInt(positiveComments.length)]);
                        review.setSentimentLabel("Positive");
                        review.setSentimentScore(0.8 + random.nextDouble() * 0.2);
                    } else {
                        review.setRating(random.nextInt(2) + 3); // 3 or 4
                        review.setComment(mixedComments[random.nextInt(mixedComments.length)]);
                        review.setSentimentLabel("Neutral");
                        review.setSentimentScore(0.0 + random.nextDouble() * 0.3);
                    }
                    
                    review.setUpvotes(random.nextInt(50));
                    review.setCreatedAt(LocalDateTime.now().minusDays(random.nextInt(30)));
                    reviewRepository.save(review);
                }
            }
            System.out.println("Successfully seeded reviews.");
        }
    }
}
