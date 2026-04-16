package com.example.bookreviews.service;

import com.example.bookreviews.repository.BookRepository;
import com.example.bookreviews.repository.CommentRepository;
import com.example.bookreviews.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AsyncReportServiceTest {

    @Mock
    private BookRepository bookRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AsyncReportService asyncReportService;

    @Test
    @DisplayName("Тест инициализации задачи")
    void testInitTask() {
        String taskId = "test-task-1";
        asyncReportService.initTask(taskId);

        assertEquals("В процессе", asyncReportService.getStatus(taskId));
        assertEquals("Результат еще не готов", asyncReportService.getResult(taskId));
    }

    @Test
    @DisplayName("Тест успешной генерации отчета")
    void testProcessRealReportAsync_Success() throws ExecutionException, InterruptedException {
        String taskId = "test-task-2";

        when(bookRepository.count()).thenReturn(15L);
        when(commentRepository.count()).thenReturn(30L);
        when(userRepository.count()).thenReturn(5L);

        asyncReportService.initTask(taskId);

        CompletableFuture<String> future = asyncReportService.processRealReportAsync(taskId);

        String result = future.get();

        assertTrue(result.contains("Книг - 15"));
        assertTrue(result.contains("Комментариев - 30"));
        assertTrue(result.contains("Пользователей - 5"));

        assertEquals("Завершенно успешно", asyncReportService.getStatus(taskId));
        assertEquals(result, asyncReportService.getResult(taskId));
    }

    @Test
    @DisplayName("Тест генерации отчета с ошибкой БД (попадание в catch)")
    void testProcessRealReportAsync_Exception() {
        String taskId = "test-task-3";

        when(bookRepository.count()).thenThrow(new RuntimeException("БД упала"));

        CompletableFuture<String> future = asyncReportService.processRealReportAsync(taskId);

        assertTrue(future.isCompletedExceptionally());

        assertEquals("Ошибка", asyncReportService.getStatus(taskId));
    }

    @Test
    @DisplayName("Тест получения статуса/результата для несуществующей задачи")
    void testMissingTask() {
        assertEquals("Задача не найдена", asyncReportService.getStatus("unknown-id"));
        assertEquals("Результат еще не готов", asyncReportService.getResult("unknown-id"));
    }
    @Test
    @DisplayName("Тест прерывания потока (InterruptedException)")
    void testProcessRealReportAsync_InterruptedException() throws InterruptedException {
        String taskId = "interrupt-task";

        Thread thread = new Thread(() -> asyncReportService.processRealReportAsync(taskId));

        thread.start();

        thread.interrupt();

        thread.join();

        assertEquals("Прервано", asyncReportService.getStatus(taskId));
    }
}