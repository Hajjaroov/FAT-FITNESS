package com.fatfitness.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		return http
				.csrf(csrf -> csrf.disable())
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
						.requestMatchers(HttpMethod.PATCH, "/api/users/me/profile").authenticated()
						.requestMatchers(HttpMethod.POST,
								"/api/users/me/change-password",
								"/api/users/me/sessions/revoke-all",
								"/api/users/me/avatar")
						.authenticated()
						.requestMatchers(HttpMethod.GET, "/api/avatars/**").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/users/*/profile").permitAll()
						.requestMatchers(HttpMethod.POST,
								"/api/community/posts",
								"/api/community/posts/*/comments",
								"/api/community/posts/*/reports",
								"/api/community/comments/*/reports",
								"/api/community/posts/*/like",
								"/api/community/posts/*/bookmark",
								"/api/community/comments/*/like")
						.authenticated()
						.requestMatchers(HttpMethod.PATCH, "/api/community/posts/*").authenticated()
						.requestMatchers(HttpMethod.DELETE, "/api/community/posts/*").authenticated()
						.requestMatchers(HttpMethod.PATCH, "/api/community/comments/*").authenticated()
						.requestMatchers(HttpMethod.DELETE, "/api/community/comments/*").authenticated()
						.requestMatchers(HttpMethod.GET, "/api/community/bookmarks").authenticated()
						.requestMatchers("/api/moderation/**").authenticated()
						.anyRequest().permitAll())
				.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
				.httpBasic(basic -> basic.disable())
				.formLogin(login -> login.disable())
				.build();
	}
}
