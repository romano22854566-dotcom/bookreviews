package com.example.bookreviews.mapper;

import com.example.bookreviews.dto.LogDto;
import com.example.bookreviews.model.Log;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Component
public final class LogMapper {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public LogDto toDto(final Log log) {
        String formattedDate = (log.getDate() != null) ? log.getDate().format(FORMATTER) : "Unknown";
        String username = (log.getUser() != null) ? log.getUser().getName() : "Система";

        return new LogDto(
                log.getId(),
                log.getStatus().name(),
                formattedDate,
                log.getBody(),
                username
        );
    }
}