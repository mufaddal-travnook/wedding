This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Guest sign-ins (Appwrite)

When a guest picks a side and enters their name, `NameModal` POSTs to
`/api/guests`, which writes a row to Appwrite from the server. The API key stays
server-side — nothing Appwrite-related is exposed to the browser.

**1. Create the table.** In your Appwrite project, add a database and a table
(Appwrite ≥ 1.8 calls these *tables/rows*; older consoles call them
*collections/documents*) with three string columns:

| Column        | Type   | Size | Required |
| ------------- | ------ | ---- | -------- |
| `name`        | string | 60   | yes      |
| `side`        | string | 16   | yes      |
| `submittedAt` | string | 32   | yes      |

No document-level permissions are needed — the route writes with an API key.

**2. Create an API key** with the `tables.write` (or `documents.write`) scope.

**3. Set the env vars** — copy `.env.example` to `.env.local`, and add the same
five variables in the Vercel project settings:

```
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=…
APPWRITE_API_KEY=…
APPWRITE_DATABASE_ID=…
APPWRITE_GUESTS_TABLE_ID=guests
```

If the vars are missing the route returns `503` and logs a warning — the guest
still gets into the journey, the sign-in just isn't recorded.

## Per-side content

`app/config/default-config.ts` holds a **separate event list per side** under
`sides.groom` and `sides.bride`, so each family can have its own venues, times
and copy (the bride's list runs Mehendi before the Nikah, for example). Event
`id`s must stay within `entrance | nikah | mehendi | reception` — the 3D zone,
lighting, sky and camera presets are keyed by id.

Components read the active side through `useEvents()` /`useSideConfig()` in
`app/lib/hooks/useSideConfig.ts` rather than importing `defaultConfig.events`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
