AIsignalswired.com Deployment Prompt — Full Stack Web App, Neon FX, Advanced UX
1. Design System & Visual Features

    Neon Glow Aesthetic: All major cards, action buttons, and hero sections feature layered neon box-shadows (cyan & purple), with a persistent, pulsing "breathing" effect via animation. Include :before/:after fog/halo overlays: glow intensifies and expands on hover/focus, emitting an atmospheric misty light.

    Dynamic Feedback: On hover, glows grow brighter/extend and drop subtle colored fog; clicking triggers a soft, momentary “humming” shadow surge for tactile feedback.

    Ambient Animation: Animate background elements (e.g., gradient fog, faint spark patterns, or animated grid lines) for an energetic, always-on feel. Add a glowing “live/status” indicator to dashboards and signals feeds.

    Microinteractions: Animate icons for actions (favorite, copy, expand, save, etc.) with smooth, cybernetic transitions. Provide real-time feedback on all settings changes.

    Gamification: Features include user badges for milestones, visible progress bars, and (optional, opt-in) leaderboards or activity feeds highlighting community wins.

    Widget Flexibility: Cards/modules can be moved/resized/dismissed and the dashboard layout is saved per user.

    Accessibility: Support for dark/light neon modes, toggles for animation speed/intensity, and strong contrast compliance.

2. Workflow & Business Logic

    User Journey: Users register/login, verify email, and start with a limited free tier. Paid upgrades (via Stripe Checkout) instantly unlock more features.

    Subscription & Access: Active subscriptions are tracked in Supabase; Stripe webhooks update expiration automatically. Access to features/data is dynamically limited by tier; expired or canceled users are downgraded in real time.

    Signal Engine: Every 15 minutes (crypto) or 2 hours (stocks), fetches real market data from integrated APIs; evaluates strategies (RSI Breadth, MACD Xover, TEMA, Halving, ATR Breakout), applies stringent risk controls, and writes signals with rationale/confidence scores.

    Notifications: Free/basic get batched emails; premium/elite see instant Discord/webhook/API signal pushes with colorful, formatted embeds.

    Transparent Stats: Public performance dashboards/charts show cumulative win rates, returns, and every historic signal. All strategy logic and risk rules shown in docs for trust.

    Admin Tools: Backoffice/admin can view users, manage subscriptions, enable/disable strategies, and monitor platform health.

3. Advanced Features List

    Neon reactive UI with glowing animated states and fog overlays.

    Microinteractions on all actionable controls and settings.

    Gamified progress, badges, and opt-in leaderboard/social proof.

    Detailed transparency: public performance, show rationale/win rate per signal.

    Automated tier management: real-time Stripe integration, webhooks for instant access update.

    REST API, Webhook, and WebSocket streaming for advanced users.

    Rate limiting, circuit breakers, and monitored error reporting.

    Fully responsive, mobile/tablet/desktop.

4. Non-Negotiable Success Criteria

    All five strategies and all design/system features above are implemented at launch.

    Glowing neon effects animate on all primary surface cards & buttons.

    Subscription/payment system accurately restricts/unlocks features instantly.

    Microinteractions, badges, and feedback are visible and functional.

    All public and paid signals, stats, and performance data auto-update.

    Users can easily view, filter, and understand every signal's logic and win/loss record.

5. Required Documentation

    README.md: System/architecture, full feature tour, deployment.

    STRATEGYDOCS.md: Each trading strategy, win rate stats, and limitation.

    APIDOCS.md: All endpoints, usage rules, access limits, examples.

    .env.example: All required keys and secrets.

Build a full-stack, production-ready, neon-glow-enabled trading signal platform as described, with all UI/UX, system, and business logic as above. Prioritize clarity, confidence, feedback, and transparency for every feature, and ensure all new feature/visual polish elements are integrated at launch.
