package com.taskflow.service;

import com.taskflow.dto.request.TaskRequest;
import com.taskflow.dto.response.TaskResponse;
import com.taskflow.entity.TaskPriority;
import com.taskflow.entity.TaskStatus;

import java.util.List;
import java.util.Map;

public interface TaskService {
    TaskResponse createTask(TaskRequest request, String username);
    TaskResponse updateTask(Long taskId, TaskRequest request, String username);
    void deleteTask(Long taskId, String username);
    TaskResponse getTaskById(Long taskId, String username);
    List<TaskResponse> getUserTasks(String username, TaskStatus status, TaskPriority priority);
    TaskResponse updateTaskStatus(Long taskId, TaskStatus status, String username);
    Map<String, Long> getTaskStats(String username);
}
