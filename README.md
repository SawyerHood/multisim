# MultiSim

This is a proof of concept to show what it could be like to have a fully multiplayer version of WebSim (a browser where an LLM generates the webpages).

**How is it multiplayer?**

- There is presence so you can see what pages other people are on.
- If you are on the same page as someone else, you can see their multiplayer cursor
- Multiple people can see a webpage stream in together
- There is multiplayer chat so you can talk to other users

> This is demoware / a proof of concept. I wrote this over a weekend and decided that I don't want to flesh it out, but it is architecturally interesting so it is worth sharing.

## Getting started

Create a `.env.local` file with the following:

```
OPENAI_API_KEY={Your Key}
WEBAPP_URL=http://localhost:3000
NEXT_PUBLIC_PARTY_KIT_HOST=localhost:1999
NEXT_PUBLIC_PARTY_KIT_URL=http://localhost:1999
```

```bash
bun i
bun dev
```

## How does it work?

- The main shell of the app is a Next.js app that you can host anywhere.
- There is a [partykit](https://www.partykit.io/) room that is powering the multiplayer features.
- Right now there is an in memory cache of pages inside of the room.
- All ai generation is handled on the partykit room. This lets llm generation get de-duped across clients.
- There is a very small postMessage protocol for transmitting things like cursor positions between the iframe and the parent

## What is missing?

There isn't any long term persistence of the pages or account management. Right now there is only a single hardcoded room as well. If you want to actually scale this you will need to be able to shard people into different servers. You really want the concept of a "party" or a "universe" where people can all jam on things together.

## Why did you stop working on this?

I started working on this because it would be a fun proof of concept. Once I proved to myself that I knew how to build it I stopped because I don't really want to build out a full fledged websim competitor.
