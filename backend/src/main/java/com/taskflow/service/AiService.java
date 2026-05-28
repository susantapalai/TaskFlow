package com.taskflow.service;

import com.taskflow.dto.response.AiSuggestionResponse;

public interface AiService {
    AiSuggestionResponse generateTaskSuggestion(String taskTitle);
}
