package com.example.bookreviews;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class BookReviewsApplication {

    public static void main(final String[] args) {
        SpringApplication.run(BookReviewsApplication.class, args);
    }
}