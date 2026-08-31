package com.expeditionx.backend.repository;

import com.expeditionx.backend.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT w FROM Wishlist w JOIN FETCH w.place WHERE w.user.id = :userId")
    List<Wishlist> findByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
    Optional<Wishlist> findByUserIdAndPlaceId(Long userId, Long placeId);
    void deleteByUserIdAndPlaceId(Long userId, Long placeId);
}
