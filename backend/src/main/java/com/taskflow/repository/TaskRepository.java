package com.taskflow.repository;

import com.taskflow.entity.Task;
import com.taskflow.entity.TaskPriority;
import com.taskflow.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Task> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, TaskStatus status);
    List<Task> findByUserIdAndPriorityOrderByCreatedAtDesc(Long userId, TaskPriority priority);
    Optional<Task> findByIdAndUserId(Long id, Long userId);
    long countByUserIdAndStatus(Long userId, TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.user.id = :userId " +
            "AND (:status IS NULL OR t.status = :status) " +
            "AND (:priority IS NULL OR t.priority = :priority) " +
            "ORDER BY t.createdAt DESC")
    List<Task> findByUserIdWithFilters(
            @Param("userId") Long userId,
            @Param("status") TaskStatus status,
            @Param("priority") TaskPriority priority
    );
}
