package com.taskflow.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.dto.response.AiSuggestionResponse;
import com.taskflow.entity.TaskPriority;
import com.taskflow.service.impl.AiServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class AiServiceTest {

    private AiServiceImpl aiService;

    @BeforeEach
    void setUp() {
        aiService = new AiServiceImpl(WebClient.builder(), new ObjectMapper());
        ReflectionTestUtils.setField(aiService, "geminiApiKey", "test-key");
        ReflectionTestUtils.setField(aiService, "geminiBaseUrl", "http://localhost/mock");
    }

    @Test
    void generateSuggestion_UrgentTitle_ReturnsCriticalPriority() {
        AiSuggestionResponse response = aiService.generateTaskSuggestion("Fix urgent production bug");
        assertThat(response).isNotNull();
        assertThat(response.getPriority()).isEqualTo(TaskPriority.CRITICAL);
        assertThat(response.getDescription()).isNotBlank();
        assertThat(response.getEstimatedEffort()).isNotBlank();
    }

    @Test
    void generateSuggestion_ClientPresentation_ReturnsHighPriority() {
        AiSuggestionResponse response = aiService.generateTaskSuggestion("Prepare client presentation");
        assertThat(response.getPriority()).isEqualTo(TaskPriority.HIGH);
        assertThat(response.getDescription()).contains("presentation");
    }

    @Test
    void generateSuggestion_MinorTask_ReturnsLowPriority() {
        AiSuggestionResponse response = aiService.generateTaskSuggestion("Fix minor typo in readme");
        assertThat(response.getPriority()).isEqualTo(TaskPriority.LOW);
    }

    @Test
    void generateSuggestion_GenericTask_ReturnsMediumPriority() {
        AiSuggestionResponse response = aiService.generateTaskSuggestion("Update dependencies");
        assertThat(response.getPriority()).isEqualTo(TaskPriority.MEDIUM);
        assertThat(response.getEstimatedEffort()).isNotBlank();
    }

    @Test
    void generateSuggestion_MeetingTitle_ReturnsOneHour() {
        AiSuggestionResponse response = aiService.generateTaskSuggestion("Weekly team sync meeting");
        assertThat(response.getEstimatedEffort()).isEqualTo("1 hour");
    }

    @Test
    void generateSuggestion_AlwaysHasDescription() {
        String[] titles = {"Do the thing", "Task 1", "XYZ", "Fix bug"};
        for (String title : titles) {
            AiSuggestionResponse r = aiService.generateTaskSuggestion(title);
            assertThat(r.getDescription()).isNotBlank();
            assertThat(r.getPriority()).isNotNull();
            assertThat(r.getEstimatedEffort()).isNotBlank();
        }
    }
}
