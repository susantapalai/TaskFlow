package com.taskflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiGenerateRequest {

    @NotBlank(message = "Task title is required for AI generation")
    private String title;
}
