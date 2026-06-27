package com.fatfitness.api.config;

import java.io.IOException;
import java.util.UUID;

import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class MdcRequestFilter extends OncePerRequestFilter {

	private static final String REQUEST_ID_HEADER = "X-Request-Id";

	@Override
	protected void doFilterInternal(
			HttpServletRequest request,
			HttpServletResponse response,
			FilterChain chain) throws ServletException, IOException {

		String requestId = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
		MDC.put("requestId", requestId);
		MDC.put("method", request.getMethod());
		MDC.put("uri", request.getRequestURI());

		response.setHeader(REQUEST_ID_HEADER, requestId);

		try {
			chain.doFilter(request, response);
		} finally {
			MDC.clear();
		}
	}
}
