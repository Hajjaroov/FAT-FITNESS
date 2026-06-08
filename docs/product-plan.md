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
- Knowledge base
- Disclaimer
- Contact later

Current structure:

- The homepage currently acts as the landing page, story page, and journal surface.
- Separate About / Journey and Blog pages are intentionally omitted for now to avoid duplication.
- Navigation should stay simple for now: `Home` and `Community`.

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

### Knowledge Base

This is more structured than the blog and should be beginner-friendly.

Examples:

- Beginner exercise library
- Dumbbell workouts for overweight beginners
- Simple meal ideas
- High-protein food list
- GLP-1 FAQ based on personal experience
- Things to ask your doctor
- Weight tracking basics
- Gym anxiety / starting at high weight

Knowledge base content must be careful with health claims. It can organize personal learning and general educational information, but it should avoid giving medical instructions.

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
2. Community
3. Knowledge base
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

## Next Product Milestone

Keep the homepage as the single public intro and journal page for now.

Goals:

- Explain the project honestly
- Include the personal starting point: 203 kg
- Include the current known point: 161 kg after almost 6 months
- State clearly that this is personal experience, not coaching or medical advice
- Keep the page simple, readable, and trustworthy
- Use fewer, wider content blocks for long text
- Keep navigation simple: `Home` and `Community`
- Do not create separate About / Journey or Blog pages right now

Content direction:

- Tone should be a balanced mix of personal story and practical reflections.
- Practical reflections should not read like a course or coaching program.
- It is okay to use basic placeholder copy that the owner can edit later.
- Mention GLP-1 only as a tool used personally, not as a recommendation or medical instruction.
- Photos may be included later, but do not add photos in the first homepage implementation.
