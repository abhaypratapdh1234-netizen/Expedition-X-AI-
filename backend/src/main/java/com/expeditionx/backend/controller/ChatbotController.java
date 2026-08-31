package com.expeditionx.backend.controller;

import com.expeditionx.backend.dto.MiscDTOs.*;
import com.expeditionx.backend.entity.ChatHistory;
import com.expeditionx.backend.entity.User;
import com.expeditionx.backend.ml.ChatbotEngine;
import com.expeditionx.backend.repository.ChatHistoryRepository;
import com.expeditionx.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/chatbot")
public class ChatbotController {

    private final ChatbotEngine chatbot;
    private final ChatHistoryRepository chatRepo;
    private final UserRepository userRepo;

    public ChatbotController(ChatbotEngine chatbot, ChatHistoryRepository chatRepo, UserRepository userRepo) {
        this.chatbot = chatbot;
        this.chatRepo = chatRepo;
        this.userRepo = userRepo;
    }

    @PostMapping("/query")
    public ResponseEntity<ChatResponse> query(Authentication auth, @RequestBody ChatRequest req) {
        ChatResponse response = chatbot.process(req.message());

        // Save to history only if logged in
        if (auth != null && auth.getCredentials() != null && auth.getCredentials() instanceof Long) {
            Long userId = (Long) auth.getCredentials();
            User user = userRepo.findById(userId).orElse(null);
            if (user != null) {
                ChatHistory ch = new ChatHistory();
                ch.setUser(user);
                ch.setMessage(req.message());
                ch.setResponse(response.reply());
                ch.setIntent(response.intent());
                chatRepo.save(ch);
            }
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatHistoryItem>> getHistory(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(chatRepo.findTop20ByUserIdOrderByTimestampDesc(userId).stream()
            .map(ch -> new ChatHistoryItem(ch.getMessage(), ch.getResponse(), ch.getIntent(), ch.getTimestamp().toString()))
            .collect(Collectors.toList()));
    }
}
