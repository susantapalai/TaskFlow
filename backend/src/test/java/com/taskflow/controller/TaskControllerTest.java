package com.taskflow.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.dto.request.RegisterRequest;
import com.taskflow.dto.request.TaskRequest;
import com.taskflow.entity.TaskPriority;
import com.taskflow.entity.TaskStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class TaskControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private String authToken;

    @BeforeEach
    void setUp() throws Exception {
        RegisterRequest reg = new RegisterRequest();
        reg.setUsername("taskuser");
        reg.setEmail("task@example.com");
        reg.setPassword("password123");

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andReturn();

        String body = result.getResponse().getContentAsString();
        authToken = objectMapper.readTree(body).path("data").path("token").asText();
    }

    @Test
    void createTask_ValidRequest_Returns201() throws Exception {
        TaskRequest req = new TaskRequest();
        req.setTitle("Test Task");
        req.setDescription("Test Description");
        req.setPriority(TaskPriority.HIGH);
        req.setStatus(TaskStatus.TODO);

        mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("Test Task"))
                .andExpect(jsonPath("$.data.priority").value("HIGH"));
    }

    @Test
    void createTask_NoAuth_Returns403() throws Exception {
        TaskRequest req = new TaskRequest();
        req.setTitle("Test Task");

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    void getTasks_Authenticated_ReturnsList() throws Exception {
        mockMvc.perform(get("/api/tasks")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void updateTaskStatus_ValidTask_ReturnsUpdated() throws Exception {
        TaskRequest req = new TaskRequest();
        req.setTitle("Status Task");
        req.setStatus(TaskStatus.TODO);

        MvcResult created = mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andReturn();

        Long taskId = objectMapper.readTree(created.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        mockMvc.perform(patch("/api/tasks/" + taskId + "/status")
                        .header("Authorization", "Bearer " + authToken)
                        .param("status", "IN_PROGRESS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"));
    }

    @Test
    void deleteTask_ValidTask_Returns200() throws Exception {
        TaskRequest req = new TaskRequest();
        req.setTitle("Delete Me");
        req.setStatus(TaskStatus.TODO);

        MvcResult created = mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andReturn();

        Long taskId = objectMapper.readTree(created.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        mockMvc.perform(delete("/api/tasks/" + taskId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getStats_ReturnsStatMap() throws Exception {
        mockMvc.perform(get("/api/tasks/stats")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").exists())
                .andExpect(jsonPath("$.data.todo").exists())
                .andExpect(jsonPath("$.data.done").exists());
    }
}
