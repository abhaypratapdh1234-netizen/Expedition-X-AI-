package com.expeditionx.backend.controller;

import com.expeditionx.backend.dto.PlaceDTOs.*;
import com.expeditionx.backend.service.PlaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/places")
public class PlaceController {

    private final PlaceService placeService;

    public PlaceController(PlaceService placeService) {
        this.placeService = placeService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<PlaceResponse>> search(
            @RequestParam(required = false, name = "query") String query,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(placeService.search(query, category));
    }

    @GetMapping("/theme/{theme}")
    public ResponseEntity<List<PlaceResponse>> getByTheme(@PathVariable String theme) {
        return ResponseEntity.ok(placeService.getByTheme(theme));
    }

    @GetMapping("/by-budget")
    public ResponseEntity<List<PlaceResponse>> getByBudget(@RequestParam Double max) {
        return ResponseEntity.ok(placeService.getByBudget(max));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlaceDetailResponse> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(placeService.getDetail(id));
    }

    @GetMapping("/{id}/timezone")
    public ResponseEntity<String> getTimezone(@PathVariable Long id) {
        return ResponseEntity.ok(placeService.getTimezone(id));
    }

    @GetMapping("/{id}/gallery")
    public ResponseEntity<String> getMegaGallery(
            @PathVariable Long id, 
            @RequestParam(defaultValue = "1") int page, 
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(placeService.getMegaGallery(id, page, pageSize));
    }
}
