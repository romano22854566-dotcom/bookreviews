package com.example.bookreviews.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ConcurrencyServiceTest {

    private ConcurrencyService concurrencyService;

    @BeforeEach
    void setUp() {
        concurrencyService = new ConcurrencyService();
    }

    @Test
    @DisplayName("Тест небезопасного счетчика")
    void testUnsafeCounter() {
        concurrencyService.incrementUnsafe();
        concurrencyService.incrementUnsafe();
        assertEquals(2, concurrencyService.getUnsafeCounter());
    }

    @Test
    @DisplayName("Тест счетчика synchronized")
    void testSyncCounter() {
        concurrencyService.incrementSync();
        assertEquals(1, concurrencyService.getSyncCounter());
    }

    @Test
    @DisplayName("Тест счетчика AtomicInteger")
    void testAtomicCounter() {
        concurrencyService.incrementAtomic();
        concurrencyService.incrementAtomic();
        concurrencyService.incrementAtomic();
        assertEquals(3, concurrencyService.getAtomicCounter());
    }

    @Test
    @DisplayName("Тест сброса всех счетчиков")
    void testResetCounters() {
        concurrencyService.incrementUnsafe();
        concurrencyService.incrementSync();
        concurrencyService.incrementAtomic();

        concurrencyService.resetCounters();

        assertEquals(0, concurrencyService.getUnsafeCounter());
        assertEquals(0, concurrencyService.getSyncCounter());
        assertEquals(0, concurrencyService.getAtomicCounter());
    }
}