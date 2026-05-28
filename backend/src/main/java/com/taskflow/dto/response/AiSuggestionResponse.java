package com.taskflow.dto.response;

import com.taskflow.entity.TaskPriority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiSuggestionResponse {
    private String description;
    private TaskPriority priority;
    private String estimatedEffort;
    private boolean aiGenerated;
    private String fallbackReason;
}
