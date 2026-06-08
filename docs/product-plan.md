# Product Plan

## Positioning

Fat Fitness Community is a personal weight-loss journey and peer-support platform.

Use this framing:

> I am not a coach or athlete. I am documenting my own weight-loss journey from 203 kg and building a community for people who want realistic, beginner-friendly support.

The product should share personal experience, lessons, experiments, failures, and community discussion. It should not present itself as medical advice, professional coaching, or a guaranteed weight-loss method.

Avoid claims like:

- "I will tell people how to lose weight."
- "You should use this medication/diet/training plan."
- "This is the correct way to lose weight."

Prefer language like:

- "This is what worked for me."
- "This is what failed for me."
- "This is what I am learning."
- "Talk to a qualified professional for medical decisions."

## Product Areas

### Public Website

Purpose: explain the project, build trust, and make the personal journey easy to understand.

Initial pages:

- Homepage
- Community
- Learn
- Disclaimer
- Contact later

Current structure:

- The homepage currently acts as the landing page, story page, and journal surface.
- Separate About / Journey and Blog pages are intentionally omitted for now to avoid duplication.
- Navigation should stay simple for now: `Home`, `Learn`, and `Community`.
- `Learn` has a static overview page plus initial detail pages for `Food & Diet`, `Training`, and `Medical Journey`.

### Homepage Story / Journal

This is public content rooted in personal experience.

Examples:

- My weight-loss journey from 203 kg
- Weekly progress updates
- What I ate this week
- Training as a very overweight beginner
- Mistakes I made
- GLP-1 experience: side effects, appetite, habits, mental side
- Product reviews for benches, dumbbells, food tracking apps, protein products

Current content approach:

- Homepage: project introduction, core story, key disclaimers, and journal direction.
- Journal content: updates, reflections, experiments, product reviews, lessons, and progress notes over time.
- Separate story/blog pages should only be introduced later if there is enough distinct content to justify them.

### Learn

This is the structured learning/content area. Public-facing language should use `Learn` instead of `Knowledge Base`, because the project is personal and beginner-friendly rather than an expert help center.

Use three main sections:

#### Food & Diet

Purpose: explain personal diet experience, food structure, supplements, and practical nutrition reflections without presenting a universal diet plan.

Possible content:

- Personal diet overview
- Current personal diet example captured in `docs/content-notes.md`
- What worked and what failed
- Simple meal ideas
- High-protein food list
- Supplements used as part of nutrition habits
- Product reviews for protein products, food tracking apps, and similar tools
- Later: a nutrition-target tool that helps generate similar meal structures for selected goals

Supplements rule:

- Put supplements under `Food & Diet` when they are general nutrition or habit topics, such as protein powder, electrolytes, fiber, creatine, vitamins, or meal replacements.
- Move or cross-reference supplements under `Medical Journey` when they are tied to blood tests, deficiencies, prescriptions, OP/surgery preparation or recovery, medication interactions, GLP-1 side effects, or doctor guidance.

#### Training

Purpose: explain personal training experience from a high starting weight and provide beginner-friendly exercise references.

Possible content:

- Current training situation
- Training 3-4 times per week
- Beginner exercise library
- Dumbbell workouts for overweight beginners
- Exercise photos later
- Gym anxiety / starting at high weight
- Equipment and tool reviews

#### Medical Journey

Purpose: document personal medical context without giving medical advice.

Possible content:

- GLP-1 experience from a personal perspective
- OP/surgery situation and reflections, if relevant
- Shot timeline and weight reached at different points
- Side effects and questions to discuss with a qualified professional
- Things learned from doctor conversations
- Weight tracking basics where it connects to medical context

Learn content must be careful with health claims. It can organize personal learning and general educational information, but it should avoid giving medical instructions, dosing instructions, or claims that one method is correct for everyone.

### Community

Start with a forum-style community, not a Reddit clone or infinite feed.

Forum categories for MVP:

- Introductions
- Weight-loss journey logs
- Training at high bodyweight
- Diet and meal ideas
- GLP-1 experience
- Questions and support
- Progress wins
- Equipment and tools

MVP community features:

- Categories
- Posts
- Comments
- Likes/bookmarks
- Reporting
- Moderator/admin actions

Not MVP:

- Infinite feed
- Algorithmic ranking
- Karma
- DMs
- Groups
- Stories
- Subreddits
- Native mobile app

### Personal Tools

Later, not MVP.

Possible tools:

- Weight tracker
- Progress photo timeline
- Workout log
- Meal log
- Habit tracker
- GLP-1 injection/side-effect journal
- Weekly check-in
- BMI/weight-loss calculator
- Goal planner

These tools involve sensitive health-related data, so they should be planned carefully before implementation.

## MVP Scope

Build in this order:

1. Homepage with integrated story and journal
2. Learn
3. Community
4. User accounts
5. Forum categories, posts, and comments
6. Likes/bookmarks
7. Reporting and moderation
8. PWA
9. Tracking tools
10. React Native / Expo mobile app later

The first useful version is:

> A personal weight-loss journey homepage with a focused support forum for overweight beginners, GLP-1 users, and people starting from zero.

## Community Safety

Moderation is required from the beginning of community work.

Risk areas:

- Dangerous dieting advice
- Eating disorder behavior
- Medical misinformation
- Body shaming
- Scam supplement promotion
- Prescription medication misuse
- Before/after photo abuse
- Harassment

Minimum moderation features:

- Report post/comment
- Hide/delete content
- Ban user
- Lock thread
- Pin post
- Moderator notes
- Community rules page
- Medical disclaimer

Community rules should include:

- No medical advice as fact
- No shaming
- No extreme diet promotion
- No steroid/supplement scams
- No harassment
- No "you must do X" coaching
- Encourage doctor consultation for medication topics

For GLP-1 content, personal experience is okay. Do not tell people whether they should use it, how to dose it, or how to get it.

## Legal And Trust Pages

Plan early, especially for Germany/EU.

Needed before a public community launch:

- Impressum
- Datenschutzerklaerung
- Cookie policy if non-essential cookies are used
- Terms of use
- Community guidelines
- Medical disclaimer
- Content moderation policy
- GDPR data deletion/export process

Treat weight logs, progress photos, GLP-1 notes, and health-related community posts as sensitive data.

## Main Product Risks

- Building too much before anyone uses it
- Making the community too complex
- Letting medical/diet misinformation become a problem
- Not having moderation tools
- Treating mobile apps as necessary too early
- Spending months on infrastructure instead of content and users

The personal story is the strongest asset. The technology should support that, not dominate it.

## Current Product Milestone

Build Learn as static frontend content before the forum/community implementation.

Goals:

- Keep Learn beginner-friendly and rooted in personal experience
- Split Learn into `Food & Diet`, `Training`, and `Medical Journey`
- Start with static frontend content
- Do not add backend persistence, MDX, or CMS yet
- Do not add photos yet
- Do not frame diet, training, supplements, GLP-1, or OP/surgery topics as advice or guaranteed methods

Content direction:

- Current Learn pages: overview, `Food & Diet`, `Training`, and `Medical Journey`.
- `Food & Diet` uses the diet and supplement source material in `docs/content-notes.md`.
- `Training` uses the extracted workout PDF source material in `docs/content-notes.md`, but exact current loads should be verified before publishing.
- `Medical Journey` can use the GLP-1 timeline in `docs/content-notes.md`, but must stay especially careful.
- Photos and deeper tools can be added later after the static content is reviewed.
