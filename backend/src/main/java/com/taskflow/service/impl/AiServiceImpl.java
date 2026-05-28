package com.taskflow.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.dto.response.AiSuggestionResponse;
import com.taskflow.entity.TaskPriority;
import com.taskflow.service.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiServiceImpl implements AiService {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.gemini.api-key}")
    private String geminiApiKey;

    @Value("${app.ai.gemini.base-url}")
    private String geminiBaseUrl;

    @Override
    public AiSuggestionResponse generateTaskSuggestion(String taskTitle) {
        try {
            if (geminiApiKey == null || geminiApiKey.equals("your-gemini-api-key-here")
                    || geminiApiKey.startsWith("test")) {
                log.warn("Gemini API key not configured, using intelligent fallback");
                return buildFallbackResponse(taskTitle, "AI service not configured");
            }
            return callGeminiApi(taskTitle);
        } catch (Exception e) {
            log.error("AI service call failed for title '{}': {}", taskTitle, e.getMessage());
            return buildFallbackResponse(taskTitle, "AI service temporarily unavailable");
        }
    }

    private AiSuggestionResponse callGeminiApi(String taskTitle) {
        String prompt = buildPrompt(taskTitle);

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", prompt)
                        })
                },
                "generationConfig", Map.of(
                        "temperature", 0.3,
                        "maxOutputTokens", 1000
                )
        );

        String url = geminiBaseUrl + "?key=" + geminiApiKey;

        String responseBody = webClientBuilder.build()
                .post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(15))
                .onErrorResume(e -> {
                    log.error("Gemini API request failed: {}", e.getMessage());
                    return Mono.error(e);
                })
                .block();

        return parseGeminiResponse(responseBody, taskTitle);
    }

    private String buildPrompt(String taskTitle) {
        return String.format("""
        Generate task details in VALID JSON only.
    
        Task Title: "%s"
    
        Return ONLY this exact JSON:
        {
          "description": "short professional description",
          "priority": "HIGH",
          "estimatedEffort": "2 hours"
        }
    
        Rules:
        - No markdown
        - No extra text
        - Valid JSON only
        - Keep description under 2 sentences
        """, taskTitle);
    }

    private AiSuggestionResponse parseGeminiResponse(String responseBody, String taskTitle) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String text = root
                    .path("candidates").get(0)
                    .path("content")
                    .path("parts").get(0)
                    .path("text").asText();

            // Clean markdown if present
            text = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            System.out.println("RAW AI RESPONSE = " + text);

            JsonNode parsed = objectMapper.readTree(text);

            String priorityStr = parsed.path("priority").asText("MEDIUM").toUpperCase();
            TaskPriority priority;
            try {
                priority = TaskPriority.valueOf(priorityStr);
            } catch (IllegalArgumentException e) {
                priority = TaskPriority.MEDIUM;
            }

            return AiSuggestionResponse.builder()
                    .description(parsed.path("description").asText())
                    .priority(priority)
                    .estimatedEffort(parsed.path("estimatedEffort").asText())
                    .aiGenerated(true)
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
            return buildFallbackResponse(taskTitle, "Failed to parse AI response");
        }
    }

    private AiSuggestionResponse buildFallbackResponse(String taskTitle, String reason) {
        log.info("Using fallback for task: '{}' - Reason: {}", taskTitle, reason);

        String lowerTitle = taskTitle.toLowerCase();
        TaskPriority priority = inferPriority(lowerTitle);
        String description = generateFallbackDescription(taskTitle, lowerTitle);
        String effort = inferEffort(lowerTitle);

        return AiSuggestionResponse.builder()
                .description(description)
                .priority(priority)
                .estimatedEffort(effort)
                .aiGenerated(false)
                .fallbackReason(reason)
                .build();
    }

    private TaskPriority inferPriority(String lowerTitle) {
        if (lowerTitle.matches(".*(urgent|critical|asap|emergency|blocker|production|hotfix).*")) {
            return TaskPriority.CRITICAL;
        } else if (lowerTitle.matches(".*(client|presentation|demo|release|deadline|important|meeting).*")) {
            return TaskPriority.HIGH;
        } else if (lowerTitle.matches(".*(minor|cleanup|refactor|typo|cosmetic|nice-to-have).*")) {
            return TaskPriority.LOW;
        }
        return TaskPriority.MEDIUM;
    }

    private String generateFallbackDescription(String taskTitle, String lowerTitle) {
        if (lowerTitle.contains("test") || lowerTitle.contains("qa")) {
            return "Write and execute test cases for " + taskTitle + ". Ensure all edge cases are covered and document the results for review.";
        } else if (lowerTitle.contains("design") || lowerTitle.contains("ui") || lowerTitle.contains("ux")) {
            return "Create design mockups and specifications for " + taskTitle + ". Collaborate with stakeholders for review and iterate based on feedback.";
        } else if (lowerTitle.contains("fix") || lowerTitle.contains("bug")) {
            return "Investigate and resolve the issue described in '" + taskTitle + "'. Document the root cause and ensure regression tests are in place.";
        } else if (lowerTitle.contains("meeting") || lowerTitle.contains("review")) {
            return "Prepare and conduct " + taskTitle + ". Create an agenda, gather necessary materials, and document action items from the session.";
        } else if (lowerTitle.contains("report") || lowerTitle.contains("document")) {
            return "Compile and prepare " + taskTitle + ". Gather relevant data, structure the content clearly, and review before distribution.";
        }
        return "Complete the task: " + taskTitle + ". Break down the work into actionable steps, coordinate with relevant team members, and deliver by the due date.";
    }

    private String inferEffort(String lowerTitle) {
        if (lowerTitle.matches(".*(meeting|call|sync|standup|review).*")) return "1 hour";
        if (lowerTitle.matches(".*(presentation|demo|report|document).*")) return "4 hours";
        if (lowerTitle.matches(".*(feature|implement|develop|build|create).*")) return "2 days";
        if (lowerTitle.matches(".*(design|mockup|prototype).*")) return "3 hours";
        if (lowerTitle.matches(".*(test|qa|verify).*")) return "2 hours";
        if (lowerTitle.matches(".*(fix|bug|patch).*")) return "3 hours";
        return "2 hours";
    }
}
