package com.taskflow.controller;

import com.taskflow.dto.request.TaskRequest;
import com.taskflow.dto.response.ApiResponse;
import com.taskflow.dto.response.TaskResponse;
import com.taskflow.entity.TaskPriority;
import com.taskflow.entity.TaskStatus;
import com.taskflow.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TaskResponse task = taskService.createTask(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(task, "Task created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasks(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<TaskResponse> tasks = taskService.getUserTasks(
                userDetails.getUsername(), status, priority);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        TaskResponse task = taskService.getTaskById(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(task));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TaskResponse task = taskService.updateTask(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(task, "Task updated successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TaskResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam TaskStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        TaskResponse task = taskService.updateTaskStatus(id, status, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(task, "Task status updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        taskService.deleteTask(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Task deleted successfully"));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Long> stats = taskService.getTaskStats(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
