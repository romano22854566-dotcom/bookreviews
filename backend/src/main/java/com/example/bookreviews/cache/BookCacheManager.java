package com.example.bookreviews.cache;

import com.example.bookreviews.dto.BookDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public  class BookCacheManager {

    private static final Logger LOG =
            LoggerFactory.getLogger(BookCacheManager.class);

    private final Map<BookCacheKey, List<BookDto>> cache =
            new ConcurrentHashMap<>();

    public List<BookDto> get(final BookCacheKey key) {
        List<BookDto> result = cache.get(key);
        if (result != null) {
            LOG.info("Cache HIT for key: {}", key);
        } else {
            LOG.info("Cache MISS for key: {}", key);
        }
        return result;
    }

    public void put(final BookCacheKey key,
                    final List<BookDto> value) {
        LOG.info("Cache PUT for key: {}", key);
        cache.put(key, value);
    }

    public void invalidate() {
        LOG.info("Cache INVALIDATED — clearing all {} entries",
                cache.size());
        cache.clear();
    }
}