package com.example.bookreviews.service;

import com.example.bookreviews.dto.LogDto;
import com.example.bookreviews.mapper.LogMapper;
import com.example.bookreviews.repository.LogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LogService {
    private final LogRepository logRepository;
    private final LogMapper logMapper;

    public LogService(final LogRepository logRepository, final LogMapper logMapper) {
        this.logRepository = logRepository;
        this.logMapper = logMapper;
    }

    public List<LogDto> getAllLogs() {

        return logRepository.findAll().stream().map(logMapper::toDto).toList();
    }
}