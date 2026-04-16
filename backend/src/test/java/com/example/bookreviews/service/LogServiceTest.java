package com.example.bookreviews.service;

import com.example.bookreviews.dto.LogDto;
import com.example.bookreviews.mapper.LogMapper;
import com.example.bookreviews.model.Log;
import com.example.bookreviews.model.Status;
import com.example.bookreviews.model.Role;
import com.example.bookreviews.model.User;
import com.example.bookreviews.repository.LogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LogServiceTest {

    @Mock
    private LogRepository logRepository;
    @Mock
    private LogMapper logMapper;

    @InjectMocks
    private LogService logService;

    private Log testLog;
    private LogDto testLogDto;

    @BeforeEach
    void setUp() {
        User admin = new User("Admin", Role.ADMIN);
        admin.setId(1L);

        testLog = new Log(Status.SUCCESS,
                "Создана книга: Война и мир", admin);
        testLog.setId(1L);

        testLogDto = new LogDto(
                1L, "SUCCESS",
                "2025-01-01 12:00:00",
                "Создана книга: Война и мир",
                "Admin");
    }

    @Test
    @DisplayName("getAllLogs — возвращает список")
    void getAllLogs_returnsList() {
        when(logRepository.findAll())
                .thenReturn(List.of(testLog));
        when(logMapper.toDto(testLog))
                .thenReturn(testLogDto);

        List<LogDto> result = logService.getAllLogs();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("SUCCESS", result.get(0).status());
        assertEquals("Создана книга: Война и мир",
                result.get(0).body());
        assertEquals("Admin", result.get(0).username());
    }

    @Test
    @DisplayName("getAllLogs — пустой список")
    void getAllLogs_empty() {
        when(logRepository.findAll())
                .thenReturn(Collections.emptyList());

        List<LogDto> result = logService.getAllLogs();

        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("getAllLogs — несколько логов")
    void getAllLogs_multipleLogs() {
        User admin = new User("Admin", Role.ADMIN);
        admin.setId(1L);

        Log log1 = new Log(Status.SUCCESS,
                "Создана книга", admin);
        log1.setId(1L);
        Log log2 = new Log(Status.FAILURE,
                "Ошибка поиска", admin);
        log2.setId(2L);
        Log log3 = new Log(Status.IN_PROGRESS,
                "В процессе", admin);
        log3.setId(3L);

        LogDto dto1 = new LogDto(1L, "SUCCESS",
                "2025-01-01 12:00:00",
                "Создана книга", "Admin");
        LogDto dto2 = new LogDto(2L, "FAILURE",
                "2025-01-01 12:01:00",
                "Ошибка поиска", "Admin");
        LogDto dto3 = new LogDto(3L, "IN_PROGRESS",
                "2025-01-01 12:02:00",
                "В процессе", "Admin");

        when(logRepository.findAll())
                .thenReturn(List.of(log1, log2, log3));
        when(logMapper.toDto(log1)).thenReturn(dto1);
        when(logMapper.toDto(log2)).thenReturn(dto2);
        when(logMapper.toDto(log3)).thenReturn(dto3);

        List<LogDto> result = logService.getAllLogs();

        assertEquals(3, result.size());
        assertEquals("SUCCESS", result.get(0).status());
        assertEquals("FAILURE", result.get(1).status());
        assertEquals("IN_PROGRESS", result.get(2).status());
    }
}