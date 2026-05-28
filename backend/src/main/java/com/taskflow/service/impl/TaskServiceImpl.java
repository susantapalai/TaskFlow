package com.taskflow.service.impl;

import com.taskflow.dto.request.TaskRequest;
import com.taskflow.dto.response.TaskResponse;
import com.taskflow.entity.*;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import com.taskflow.service.TaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public TaskResponse createTask(TaskRequest request, String username) {
        User user = getUser(username);

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
                .dueDate(request.getDueDate())
                .estimatedEffort(request.getEstimatedEffort())
                .aiGenerated(request.isAiGenerated())
                .user(user)
                .build();

        Task saved = taskRepository.save(task);
        log.info("Task created: {} by user: {}", saved.getId(), username);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public TaskResponse updateTask(Long taskId, TaskRequest request, String username) {
        User user = getUser(username);
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setEstimatedEffort(request.getEstimatedEffort());

        Task updated = taskRepository.save(task);
        log.info("Task updated: {} by user: {}", taskId, username);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteTask(Long taskId, String username) {
        User user = getUser(username);
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        taskRepository.delete(task);
        log.info("Task deleted: {} by user: {}", taskId, username);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long taskId, String username) {
        User user = getUser(username);
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        return mapToResponse(task);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getUserTasks(String username, TaskStatus status, TaskPriority priority) {
        User user = getUser(username);
        List<Task> tasks = taskRepository.findByUserIdWithFilters(user.getId(), status, priority);
        return tasks.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TaskResponse updateTaskStatus(Long taskId, TaskStatus status, String username) {
        User user = getUser(username);
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        task.setStatus(status);
        Task updated = taskRepository.save(task);
        log.info("Task {} status updated to {} by user: {}", taskId, status, username);
        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getTaskStats(String username) {
        User user = getUser(username);
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", taskRepository.countByUserIdAndStatus(user.getId(), TaskStatus.TODO)
                + taskRepository.countByUserIdAndStatus(user.getId(), TaskStatus.IN_PROGRESS)
                + taskRepository.countByUserIdAndStatus(user.getId(), TaskStatus.DONE));
        stats.put("todo", taskRepository.countByUserIdAndStatus(user.getId(), TaskStatus.TODO));
        stats.put("inProgress", taskRepository.countByUserIdAndStatus(user.getId(), TaskStatus.IN_PROGRESS));
        stats.put("done", taskRepository.countByUserIdAndStatus(user.getId(), TaskStatus.DONE));
        return stats;
    }

    private User getUser(String username) {
        return userRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .estimatedEffort(task.getEstimatedEffort())
                .aiGenerated(task.isAiGenerated())
                .userId(task.getUser().getId())
                .username(task.getUser().getUsername())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
