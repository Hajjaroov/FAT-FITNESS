Security & Code-Quality Audit — Fat Fitness Community
Version Report (determines several findings up front)
Component	Version in use	2026 CVE status
Spring Boot	4.1.0	Past the fixed lines for all actuator-bypass CVEs (CVE-2026-22731 fixed in 4.0.3, CVE-2026-40976 in 4.0.6). Not EOL. ✅
Spring Framework (spring-core)	7.0.8	CVE-2026-41848 / CVE-2026-41842 (AntPathMatcher / versioned-resource DoS) affect 7.0.0–7.0.7. 7.0.8 is patched. ✅
Spring Security	7.1.0	CVE-2026-22732 (dropped headers) and CVE-2026-22748 (JWT issuer) affect ≤7.0.x. 7.1.0 is not in range. ✅
Tomcat embed	11.0.22	No open advisory matched. ✅
Next.js	16.2.7 (lockfile-confirmed)	The May 2026 batch (13 CVEs) is fixed in 16.2.6. 16.2.7 is patched. ✅
React / react-dom	19.2.4	React RSC DoS/cache-poisoning fixed in 19.2.6. 19.2.4 is one patch behind. See F6. ⚠️
react-server-dom-webpack/turbopack (vendored in Next 16.2.7)	matches Next	Fixed set ships with the patched Next release. ✅
The version-gated items in your TODO are therefore mostly moot — the stack is current except React is 19.2.4 vs. the 19.2.6 that carries the RSC fixes. Impact is low here because you use App Router without a shared CDN cache in front of RSC payloads (F6).

1. Summary Table
#	Item	Status	Severity
F1	Unescaped display-name / subject interpolated into transactional emails (HTML injection → email phishing)	FOUND	Medium
F2	.env DB credentials also hard-coded as defaults in committed application.yml / docker-compose.yml	FOUND	Medium (Low for local-only)
F3	JWT signing secret has a working insecure default (dev-only-change-me…)	FOUND	Medium — "needs discussion" (deploy-dependent)
F4	Refresh cookie Secure flag defaults to false	FOUND	Medium — "needs discussion"
F5	No global @ControllerAdvice; relies on Spring default error handling	FOUND	Low
F6	React 19.2.4 (RSC fixes land in 19.2.6)	FOUND	Low
F7	User enumeration on registration (409 "Email is already registered")	FOUND	Low
F8	No security response headers (CSP, HSTS, X-Frame-Options, etc.) on either tier	FOUND	Low/Medium
F9	Rate limiter & log limiter keyed on getRemoteAddr() / x-forwarded-for — bypassable / spoofable depending on proxy	FOUND	Low
—	SQL injection (no native/concatenated queries)	NOT FOUND	—
—	SpEL / Thymeleaf SSTI (no template engine, no dynamic SpEL)	N/A	—
—	IDOR / BOLA on user-owned resources	NOT FOUND (well-guarded)	—
—	Mass assignment (DTOs used everywhere; no entity binding)	NOT FOUND	—
—	Middleware-as-auth-boundary (no middleware.ts exists)	N/A	—
—	Actuator env/heapdump exposure	NOT FOUND (default exposure + anyRequest().authenticated())	—
—	Password storage (BCrypt)	OK	—
—	Token storage (access token in memory, refresh in HttpOnly cookie)	OK	—
—	File-upload validation (magic-byte re-decode + re-encode)	OK (strong)	—
2. Detailed Findings
F1 — HTML injection into transactional emails · Medium
EmailService.java:180-268

buildBroadcastAnnouncementHtml correctly escapes its body (lines 149-153), but the other four builders interpolate user-controlled strings straight into HTML via .formatted(...) with no escaping:

buildVerificationHtml / buildPasswordResetHtml → displayName
buildNewMessageHtml → recipientDisplayName, senderDisplayName, subject
Data flow (attacker-reachable path): attacker registers with a crafted display name (or starts a conversation with a crafted subject — validated only @Size(min=2,max=160), StartConversationRequest.java) → victim receives a new-message email where senderDisplayName/subject render as live HTML in their mail client. This is a stored HTML/anchor injection into an email you send on the attacker's behalf → phishing / link spoofing. In-app rendering is safe (React auto-escapes), so this is email-only.

Fix: apply the same &/</> escaping already used in buildBroadcastAnnouncementHtml to displayName, recipientDisplayName, senderDisplayName, and subject in all four builders (factor it into a shared escapeHtml helper).

F2 — Real-looking DB credentials committed as config defaults · Medium (Low if truly local-only)
application.yml:5-8 and infrastructure/docker-compose.yml

username: fitness_user / password: fitness_password are hard-coded (not ${ENV}-injected) in both files. Your CLAUDE.md secret rules cover .env but these two credentials live in tracked files. Fine for a throwaway local Postgres, but it becomes a real leak the moment this compose/app config is reused for anything network-reachable. Move both to env vars with no committed default (as you already do for JWT/Resend/owner-seed).

F3 — JWT secret has a functional insecure default · Medium ("needs discussion")
application.yml:28: secret: ${FATFITNESS_JWT_SECRET:dev-only-change-me-secret-keep-at-least-32-characters}

The fallback is ≥32 chars, so @Size(min=32) in AuthProperties.java:40 passes and the app boots and signs tokens even if the env var is never set. If any environment ships without FATFITNESS_JWT_SECRET, this public string forges valid HS256 access tokens for any user/role. Uncertain severity because it depends entirely on whether prod injects the real secret — hence "needs discussion." Recommendation: fail fast in non-dev profiles when the secret equals the default (or drop the default so startup fails without it).

Positive note: role authority is never trusted from the JWT — every service re-loads the user from the DB and re-checks UserStatus.ACTIVE and roles, so bans/role changes take effect within the 15-min token window and a forged-role token still can't act unless it's the secret-forgery case above.

F4 — Refresh cookie not Secure by default · Medium ("needs discussion")
application.yml:36: secure: ${FATFITNESS_REFRESH_COOKIE_SECURE:false}

The 30-day HttpOnly refresh cookie defaults to Secure=false, so if prod forgets to set FATFITNESS_REFRESH_COOKIE_SECURE=true the long-lived token can traverse plain HTTP. SameSite=Lax is set (good — blocks CSRF on the cross-site refresh POST), and HttpOnly is set (good). Just make Secure default to true and opt out for local dev, rather than opt-in for prod.

F5 — No global exception handler · Low
There is no @ControllerAdvice / @ExceptionHandler anywhere (grep-confirmed). All errors are ResponseStatusException, which Spring renders as clean ProblemDetail JSON without stack traces, and server.error.include-* is left at safe defaults, so no stack-trace leak was found. The residual risk is that an unexpected RuntimeException produces a generic 500 whose shape you don't control. Low, but a small @RestControllerAdvice giving uniform 400/500 bodies is worth adding for consistency.

F6 — React 19.2.4 vs. 19.2.6 · Low
The May 2026 RSC cache-poisoning/DoS fixes are in react/react-dom 19.2.6. You're on 19.2.4. Real-world impact is low: cache poisoning requires a shared cache in front of RSC responses (you run App Router with cache: "no-store" on all API calls and no CDN-cached RSC layer described), and the Next.js 16.2.7 patch already mitigates the Next-side vectors. Bump react/react-dom to 19.2.6 to close the RSC DoS.

F7 — User enumeration on registration · Low
AuthRegistrationService.java:79-81 returns 409 "Email is already registered". Login ("Invalid email or password"), forgot-password, and resend-verification are all correctly non-revealing — only registration leaks existence. Low; often an accepted UX tradeoff, but worth a conscious decision.

F8 — Missing security response headers · Low/Medium
No CSP, HSTS, X-Frame-Options, X-Content-Type-Options, or Referrer-Policy is set on either tier — next.config.ts has only reactCompiler: true and no headers(), and SecurityConfig doesn't add servlet headers (Spring Security's defaults are largely inert for a stateless JSON API behind CORS). Add a headers() block in next.config.ts (X-Frame-Options: DENY, X-Content-Type-Options: nosniff, a CSP, HSTS in prod). Medium if the site is ever framed/embedded; Low for a pure API+SPA over HTTPS.

F9 — Rate-limit / log keys are proxy-dependent · Low
Backend limiter keys on servletRequest.getRemoteAddr() (AuthController.java:99); behind a reverse proxy without ForwardedHeaderFilter this collapses every client to the proxy IP (over-blocks). The frontend /api/log limiter keys on x-forwarded-for (route.ts:44), which is client-spoofable to evade the 30/min cap. Neither is high-impact (login limiter is a defense-in-depth layer, log endpoint only writes to a rotating file), but decide your proxy trust model and key consistently.

What's genuinely solid (verified, not assumed)
IDOR/BOLA: every user-scoped mutation goes through findByIdAndUserId / findByIdAndMealId / findByConversationIdAndUserId (e.g. MyPlanGlp1Service.java:72, diet meal-item nesting at MyPlanDietService.java:250). No endpoint trusts a path-param ID without an ownership predicate. Forum edit/delete correctly gate on author-or-editor-role.
No SQL injection: all persistence is Spring Data derived queries / JPQL with bound params; no native concatenation, no EntityManager string queries.
Mass assignment: controllers bind @Valid DTO records, never JPA entities; roles/status are never settable from a request body.
File upload: magic-byte decode via ImageIO.read + full re-encode to JPEG, 8 MB cap, allow-list content type (AvatarService.java:38-69). Bytes stored in DB, so no path traversal. This is the strong way to do it.
Token model: access token in React memory only, refresh token in HttpOnly+SameSite=Lax cookie, refresh-token rotation with revoke+replace and reuse-after-revoke rejection (AuthRegistrationService.java:186-231). Reset/verification tokens stored only as SHA-256 hashes.
CORS: explicit origin allow-list from env (default http://localhost:3000), not wildcard-with-credentials.
Actuator: default exposure (health only) + anyRequest().authenticated() means even /actuator/health requires auth; no health-group additional path is configured, so CVE-2026-22731 is N/A.
No middleware.ts exists, so the "middleware is not an auth boundary" class of Next.js bugs doesn't apply — every protected server route relies on the Spring backend's per-request JWT check, which is the correct boundary.
3. "Needs Discussion" (severity depends on deployment facts I can't see)
F3 (JWT default secret) and F4 (cookie Secure=false default) — both are only dangerous if a real environment relies on the fallback. If prod provably injects FATFITNESS_JWT_SECRET and FATFITNESS_REFRESH_COOKIE_SECURE=true, they're non-issues; if there's any chance of a misconfigured deploy, they're the highest-severity items here. Tell me your deploy model and I'll firm up the rating.
F8 CSP — the right CSP depends on whether you'll embed third-party widgets, use inline styles (you have one inline theme <script> in layout.tsx:35, which a strict CSP would need a nonce/hash for). Worth a short design conversation before I'd hand you a policy string.
No code has been changed. The single most valuable quick fix is F1 (escape the four email builders — you already have the escaper written); the most important decisions are F3/F4 about production secret/cookie handling.

Sources for version claims: Next.js May 2026 release (Vercel), React RSC cache-poisoning advisory GHSA-wfc6-r584-vfw7, CVE-2026-22731, CVE-2026-40976, CVE-2026-41848, CVE-2026-22732.