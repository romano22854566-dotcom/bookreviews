package com.example.bookreviews.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class ServiceLoggingAspect {

    private static final Logger LOG =
            LoggerFactory.getLogger(ServiceLoggingAspect.class);

    @Around("execution(* com.example.bookreviews.service.*.*(..)) "
            + "&& !execution(* com.example.bookreviews.service.ConcurrencyService.*(..))")
    public Object logExecutionTime(final ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        long start = System.currentTimeMillis();

        LOG.info(">> Вызов метода: {}", methodName);

        try {
            Object result = joinPoint.proceed();
            long elapsed = System.currentTimeMillis() - start;
            LOG.info("<< Метод {} выполнен за {} мс",
                    methodName, elapsed);
            return result;
        } catch (Throwable ex) {
            long elapsed = System.currentTimeMillis() - start;
            LOG.warn("<< Метод {} завершился с ошибкой за {} мс",
                    methodName, elapsed);
            throw ex;
        }
    }
}