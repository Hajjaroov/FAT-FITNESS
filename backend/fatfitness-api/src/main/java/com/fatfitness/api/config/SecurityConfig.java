package com.fatfitness.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		return http
				.csrf(AbstractHttpConfigurer::disable)
				.cors(Customizer.withDefaults())
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						.requestMatchers("/api/status").permitAll()
						.requestMatchers(HttpMethod.POST,
								"/api/auth/register",
								"/api/auth/verify-email",
								"/api/auth/resend-verification",
								"/api/auth/login",
								"/api/auth/refresh",
								"/api/auth/logout",
								"/api/auth/forgot-password",
								"/api/auth/reset-password")
						.permitAll()
						.requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
						.requestMatchers(HttpMethod.POST,
								"/api/community/posts",
								"/api/community/posts/*/comments",
								"/api/community/posts/*/reports",
								"/api/community/comments/*/reports",
								"/api/community/posts/*/like",
								"/api/community/posts/*/bookmark",
								"/api/community/comments/*/like")
						.authenticated()
						.requestMatchers(HttpMethod.GET, "/api/community/bookmarks").authenticated()
						.requestMatchers("/api/moderation/**").authenticated()
						.anyRequest().permitAll())
				.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
				.httpBasic(AbstractHttpConfigurer::disable)
				.formLogin(AbstractHttpConfigurer::disable)
				.build();
	}
}
