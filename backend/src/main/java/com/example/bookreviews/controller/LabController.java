package com.example.bookreviews.controller;

import com.example.bookreviews.service.AsyncReportService;
import com.example.bookreviews.service.ConcurrencyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/lab")
@Tag(name = "Асинхронность и Многопоточность")
public class LabController {
    private static final String TASK_ID_KEY = "ID Задачи";
    private static final int THREAD_COUNT = 50;
    private static final int ITERATION_COUNT = 10000;
    private static final int AWAIT_TIMEOUT_SECONDS = 20;
    private final AsyncReportService asyncService;
    private final ConcurrencyService concurrencyService;

    public LabController(AsyncReportService asyncService, ConcurrencyService concurrencyService) {
        this.asyncService = asyncService;
        this.concurrencyService = concurrencyService;
    }

    @PostMapping("/async/start")
    @Operation(summary = "Запустить генерацию отчета по БД")
    public Map<String, String> startAsync() {
        String taskId = UUID.randomUUID().toString();

        asyncService.initTask(taskId);

        asyncService.processRealReportAsync(taskId);

        return Map.of(TASK_ID_KEY, taskId, "Сообщение", "Отчет генерируется в фоне. Проверьте через пару секунд.");
    }

    @GetMapping("/async/status/{id}")
    @Operation(summary = "Проверить статус задачи")
    public Map<String, String> checkStatus(@PathVariable String id) {
        return Map.of(TASK_ID_KEY, id, "Статус", asyncService.getStatus(id));
    }

    @GetMapping("/async/result/{id}")
    @Operation(summary = "Получить готовый отчет")
    public Map<String, String> getResult(@PathVariable String id) {
        return Map.of(TASK_ID_KEY, id, "Результат", asyncService.getResult(id));
    }

    @PostMapping("/concurrency/test")
    @Operation(summary = "Демонстрация Race Condition (50 потоков)")
    public Map<String, Object> testConcurrency() throws InterruptedException {

        concurrencyService.resetCounters();

        ExecutorService executor = Executors.newFixedThreadPool(THREAD_COUNT);

        for (int i = 0; i < THREAD_COUNT; i++) {
            executor.submit(() -> {
                for (int j = 0; j < ITERATION_COUNT; j++) {
                    concurrencyService.incrementUnsafe();
                    concurrencyService.incrementSync();
                    concurrencyService.incrementAtomic();
                }
            });
        }

        executor.shutdown();

        boolean terminated = executor.awaitTermination(AWAIT_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        if (!terminated) {
            executor.shutdownNow();
        }

        int expected = THREAD_COUNT * ITERATION_COUNT;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("Ожидаемое значение (" + THREAD_COUNT + " потоков * " + ITERATION_COUNT + " раз)", expected);
        result.put("1. Небезопасный счетчик (Race Condition!)", concurrencyService.getUnsafeCounter());
        result.put("   -> ПОТЕРЯНО ДАННЫХ", expected - concurrencyService.getUnsafeCounter());
        result.put("2. Безопасный (synchronized)", concurrencyService.getSyncCounter());
        result.put("3. Безопасный (AtomicInteger)", concurrencyService.getAtomicCounter());

        return result;
    }
}