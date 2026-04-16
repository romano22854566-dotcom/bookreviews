package com.example.bookreviews.service;

import com.example.bookreviews.repository.BookRepository;
import com.example.bookreviews.repository.CommentRepository;
import com.example.bookreviews.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AsyncReportService {

    private static final Logger LOG = LoggerFactory.getLogger(AsyncReportService.class);

    private static final int SIMULATION_DELAY_MS = 10000;

    private final Map<String, String> taskStatuses = new ConcurrentHashMap<>();
    private final Map<String, String> taskResults = new ConcurrentHashMap<>();

    private final BookRepository bookRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    public AsyncReportService(
            final BookRepository bookRepository,
            final CommentRepository commentRepository,
            final UserRepository userRepository) {
        this.bookRepository = bookRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }

    public void initTask(String taskId) {
        taskStatuses.put(taskId, "В процессе");
    }

    @Async
    public CompletableFuture<String> processRealReportAsync(String taskId) {
        LOG.info("Сбор аналитики начался в фоне (Task ID: {})", taskId);
        try {
            Thread.sleep(SIMULATION_DELAY_MS);

            long booksCount = bookRepository.count();
            long commentsCount = commentRepository.count();
            long usersCount = userRepository.count();

            String result = String.format(
                    "Отчет готов! В базе данных найдено: Книг - %d, Комментариев - %d, Пользователей - %d",
                    booksCount, commentsCount, usersCount
            );

            taskResults.put(taskId, result);
            taskStatuses.put(taskId, "Завершенно успешно");
            LOG.info("Отчет сформирован (Task ID: {})", taskId);

            return CompletableFuture.completedFuture(result);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            taskStatuses.put(taskId, "Прервано");
            return CompletableFuture.failedFuture(e);
        } catch (Exception e) {
            taskStatuses.put(taskId, "Ошибка");
            return CompletableFuture.failedFuture(e);
        }
    }

    public String getStatus(String taskId) {
        return taskStatuses.getOrDefault(taskId, "Задача не найдена");
    }

    public String getResult(String taskId) {
        return taskResults.getOrDefault(taskId, "Результат еще не готов");
    }
}