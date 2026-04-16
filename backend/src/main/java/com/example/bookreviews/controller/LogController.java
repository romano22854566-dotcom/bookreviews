package com.example.bookreviews.controller;

import com.example.bookreviews.dto.LogDto;
import com.example.bookreviews.service.LogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/logs")
@Tag(name = "Логи", description = "Просмотр логов операций")
public  class LogController {

    private final LogService logService;

    public LogController(final LogService logService) {
        this.logService = logService;
    }

    @GetMapping
    @Operation(summary = "Получить все логи")
    public List<LogDto> getAllLogs() {
        return logService.getAllLogs();
    }
}