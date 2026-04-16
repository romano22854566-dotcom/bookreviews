package com.example.bookreviews.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class ConcurrencyService {

    private int unsafeCounter = 0;

    private int syncCounter = 0;
    private final AtomicInteger atomicCounter = new AtomicInteger(0);

    public void resetCounters() {
        unsafeCounter = 0;
        syncCounter = 0;
        atomicCounter.set(0);
    }

    public void incrementUnsafe() {
        unsafeCounter++;
    }

    public synchronized void incrementSync() {
        syncCounter++;
    }

    public void incrementAtomic() {
        atomicCounter.incrementAndGet();
    }

    public int getUnsafeCounter() {
        return unsafeCounter;
    }

    public int getSyncCounter() {
        return syncCounter;
    }

    public int getAtomicCounter() {
        return atomicCounter.get();
    }
}