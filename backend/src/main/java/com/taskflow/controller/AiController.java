package com.taskflow.controller;

import com.taskflow.dto.request.AiGenerateRequest;
import com.taskflow.dto.response.AiSuggestionResponse;
import com.taskflow.dto.response.ApiResponse;
import com.taskflow.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<AiSuggestionResponse>> generateTaskDetails(
            @Valid @RequestBody AiGenerateRequest request) {
        AiSuggestionResponse suggestion = aiService.generateTaskSuggestion(request.getTitle());
        String message = suggestion.isAiGenerated()
                ? "AI suggestions generated successfully"
                : "Suggestions generated using smart fallback";
        return ResponseEntity.ok(ApiResponse.success(suggestion, message));
    }
}
