package com.expeditionx.backend.service;

import com.expeditionx.backend.dto.MiscDTOs.*;
import com.expeditionx.backend.dto.PlaceDTOs;
import com.expeditionx.backend.entity.*;
import com.expeditionx.backend.exception.ResourceNotFoundException;
import com.expeditionx.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class WishlistService {
    private final WishlistRepository wishlistRepo;
    private final UserRepository userRepo;
    private final PlaceRepository placeRepo;
    private final PlaceService placeService;

    public WishlistService(WishlistRepository wishlistRepo, UserRepository userRepo,
                           PlaceRepository placeRepo, PlaceService placeService) {
        this.wishlistRepo = wishlistRepo;
        this.userRepo = userRepo;
        this.placeRepo = placeRepo;
        this.placeService = placeService;
    }

    public WishlistResponse addToWishlist(Long userId, Long placeId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Place place = placeRepo.findById(placeId).orElseThrow(() -> new ResourceNotFoundException("Place", "id", placeId));

        // Check duplicate
        if (wishlistRepo.findByUserIdAndPlaceId(userId, placeId).isPresent()) {
            throw new com.expeditionx.backend.exception.BadRequestException("Already in wishlist");
        }

        Wishlist w = new Wishlist();
        w.setUser(user);
        w.setPlace(place);
        w = wishlistRepo.save(w);
        return new WishlistResponse(w.getId(), placeService.toResponse(place), w.getAddedAt().toString());
    }

    @org.springframework.beans.factory.annotation.Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public List<WishlistResponse> getUserWishlist(Long userId) {
        String sql = "SELECT w.id as wishlist_id, w.added_at, p.* FROM wishlists w JOIN places p ON w.place_id = p.id WHERE w.user_id = ?";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            PlaceDTOs.PlaceResponse pr = new PlaceDTOs.PlaceResponse(
                rs.getLong("id"), rs.getString("name"), rs.getString("city"),
                rs.getString("country"), rs.getString("state"), rs.getString("category"),
                rs.getString("description"), rs.getDouble("latitude"), rs.getDouble("longitude"),
                rs.getDouble("avg_cost"), rs.getString("image_url"), rs.getDouble("rating"),
                rs.getInt("review_count"), rs.getString("best_time"), rs.getString("safety_advisory"),
                rs.getBoolean("trending")
            );
            return new WishlistResponse(rs.getLong("wishlist_id"), pr, rs.getTimestamp("added_at").toString());
        }, userId);
    }

    @Transactional
    public void removeFromWishlist(Long id) {
        wishlistRepo.deleteById(id);
    }
}
