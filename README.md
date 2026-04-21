# Gymvy

A social-first lifting app I've been building for the last ~6 months. Live on the App Store, used regularly by me and a small group of friends, with a handful of strangers who found it through word of mouth.

This repo is the client, an Expo / React Native app. The backend is a separate Express.js service I also wrote.

## Why I built it

I started Gymvy last summer during my internship, when I was living in a new city away from all my friends. The gym was the one part of my routine that carried over, except now I was lifting alone, no one to send a PR to, no one to give me shit for skipping legs. I wanted a way to stay connected to my friends through the thing we'd always done together.

Every lifting app I tried felt like a spreadsheet with a login screen. Hevy, Strong, even the newer ones. Logging is fine, but the experience ends the moment you close the app. Training with friends is one of the main reasons people show up to the gym, and none of those apps really acknowledge that.

So I built Gymvy around the part the others left out: sharing what you did, seeing what your friends did, and giving a group of people a reason to open the app outside of logging a set. It's still a full lifting tracker, sessions, programs, progress, 1RM tracking, body weight, but the feed, posts, and communities are treated as first-class instead of bolted on.

## What's in the app

**Workout logging & sessions**
- Live workout sessions with set-by-set logging, rest timers, and exercise history
- Custom split builder with reusable day templates and an exercise picker
- Progress tracking for body weight and per-exercise 1RM, with charts over time

**Social feed & communities**
- Posts tied to workouts, with images, comments, likes
- Profiles, following, a notifications feed
- Community groups with their own feeds
- Reporting and blocking (it's a real app store app, so all of that had to be real)

**The rest of the product surface**
- Auth (email/password, Google, Apple) via Supabase
- Push notifications for social + workout events
- RevenueCat for subscriptions
- PostHog for product analytics
- Onboarding flow and search

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Expo (SDK 53), React Native 0.79, Expo Router |
| Auth | Supabase (email, Google OAuth, Apple OAuth) |
| State | React Context (auth, workout session, preload, push) |
| HTTP | Axios with a shared client + interceptors |
| Payments | RevenueCat |
| Analytics | PostHog |
| Storage | Supabase Postgres + Storage, Async Storage, Secure Store |
| Backend | Express.js (separate repo) |

## Repo layout

```
app/              # Expo Router screens (tabs, auth, onboarding, workout, post, community, ...)
src/
  components/     # Feature-scoped UI (workout, profile, progress, community, ui/, ...)
  contexts/       # React contexts: auth, workout session, preload, push notifications
  services/       # API clients (axios + per-domain modules under services/api)
  lib/            # Cross-cutting: auth wrapper, native module bridges
  hooks/          # Custom hooks (e.g. useWeightUnit)
  utils/          # Helpers (unit conversion, formatters, ...)
  data/           # Static reference data (exercise catalog, etc.)
modules/          # Native iOS modules
ios/ android/     # Native projects (managed workflow, pre-built for dev clients)
```

## Notes for anyone reading this as a portfolio piece

A few things I'm glad I took the time to get right:

- **End-to-end ownership.** Client, backend, auth, payments, push, analytics, store listing, privacy policy — all of it is mine. There's no piece of this app I can't explain.
- **Shipping, not just building.** The app is in the App Store. That forced me to deal with everything the tutorials skip: app review, real push notification infrastructure, subscription edge cases, blocking/reporting, privacy policy hosting, dev vs prod config.
- **Actual users, actual feedback.** Friends use it daily, which means bugs get found fast and dead features get noticed faster. A lot of the current design has been shaped by "hey this is annoying" texts.
- **Premium-feeling UI.** Borderless cards, a consistent shadow/typography system, dark mode that isn't an afterthought. The design system lives in `src/components/ui/` and conventions are documented in my notes.

## Status

- **Version:** 1.8.2
- **Platforms:** iOS (live on the App Store), Android build exists
- **Users:** me + friends + a small amount of word-of-mouth growth
- **Active development:** Yes, I still enjoy adding features when people give me an idea or suggest something they would find useful.
