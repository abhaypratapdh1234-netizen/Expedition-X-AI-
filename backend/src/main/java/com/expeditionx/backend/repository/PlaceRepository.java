package com.expeditionx.backend.repository;

import com.expeditionx.backend.entity.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PlaceRepository extends JpaRepository<Place, Long> {
    List<Place> findByCityContainingIgnoreCase(String city);
    List<Place> findByCategoryContainingIgnoreCase(String category);
    List<Place> findByCityContainingIgnoreCaseAndCategoryContainingIgnoreCase(String city, String category);
    List<Place> findByAvgCostLessThanEqual(Double maxCost);
    List<Place> findByTrendingTrueOrderBySearchCountDesc();
    List<Place> findTop10ByOrderBySearchCountDesc();

    @Query("SELECT p FROM Place p WHERE p.avgCost <= :maxBudget ORDER BY p.rating DESC")
    List<Place> findByBudget(@Param("maxBudget") Double maxBudget);

    @Query("SELECT p FROM Place p WHERE LOWER(p.category) LIKE LOWER(CONCAT('%', :theme, '%')) ORDER BY p.rating DESC")
    List<Place> findByTheme(@Param("theme") String theme);

    @Query("SELECT p FROM Place p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.city) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.state) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.country) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Place> searchByQuery(@Param("query") String query);

    @Query("SELECT p FROM Place p WHERE " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.city) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.state) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.country) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :category, '%'))")
    List<Place> searchByQueryAndCategory(@Param("query") String query, @Param("category") String category);
}
