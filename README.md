# Palm Personalization Engine

A full-stack monorepo application showcasing a Senior-level implementation of a personalized rule engine, secure consent boundaries, and an LLM Copy Assistant using Next.js, NestJS, and Gemini 1.5 Pro.

## Project Structure

This project uses `pnpm` workspaces for a monorepo setup:

- `apps/api`: NestJS backend containing the Rule Engine and Consent Boundaries.
- `apps/web`: Next.js 14+ frontend with App Router, featuring the Landing Page and Admin Dashboard.
- `packages/shared`: Shared TypeScript definitions and types used across the stack.

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 10+ (`npm install -g pnpm`)
- Optional: Gemini API Key (for LLM Copy feature)

### Quick Start

1. **Install Dependencies**
   From the root of the project, run:
   ```bash
   pnpm install
   ```

2. **Environment Variables**
   For the LLM Assistant to function properly in the `web` application, set your Gemini API Key.
   Create an `.env.local` file in `apps/web`:
   ```env
   GEMINI_API_KEY=your_genai_api_key_here
   # NEXT_PUBLIC_API_URL=http://localhost:3000 (Defaults to this if omitted)
   ```

3. **Run Development Servers**
   Instead of running them one by one, you can run all applications in parallel from the root:
   ```bash
   pnpm dev
   ```
   * Alternatively, run them separately:
     * API: `pnpm --filter api run start:dev` (runs on `http://localhost:3000`)
     * Web: `pnpm --filter web run dev` (runs on `http://localhost:3001`)

4. **Access the Applications**
   - **Personalized Landing Page**: [http://localhost:3001/](http://localhost:3001/)
   - **Admin Panel**: [http://localhost:3001/admin](http://localhost:3001/admin)

## Dockerization

The project includes a unified, multi-stage `Dockerfile` capable of building and running both applications independently utilizing Docker named stages.

**To build the API Image:**
```bash
docker build --target api-runner -t palm-api .
docker run -p 3000:3000 palm-api
```

**To build the Web Image:**
Before building the web image, ensure standalone output is enabled in `next.config.js` (or `next.config.mjs`) inside `apps/web`: `output: 'standalone'`.

```bash
docker build --target web-runner -t palm-web .
docker run -p 3001:3001 -e PORT=3001 palm-web
```

---

## Technical Architecture & Strategies

> **[View the Visual Architecture & Data Flow Diagram here](./ARCHITECTURE.md)**

### 1. ETag & CDN Strategy

The endpoint `GET /config/:siteId` is designed to distribute rulesets to potentially millions of edge nodes or CDNs with minimum load on the backend. 

- **Hashing**: The endpoint stringifies the active JSON ruleset for the `siteId` and generates an immediate `sha256` hash to populate the `ETag` HTTP header. 
- **Cache-Control**: `Cache-Control: public, s-maxage=60, stale-while-revalidate=30` is utilized. 
  - `public`: Allows any caching layer (CDN, corporate proxies) to cache the response.
  - `s-maxage=60`: Informs intermediate caches (like Cloudflare or AWS CloudFront) that the representation is fresh for 60 seconds.
  - `stale-while-revalidate=30`: If a request arrives after the 60 seconds but within the next 30 seconds, the CDN immediately serves the stale representation from cache *while asynchronously* re-fetching the updated `ETag` and ruleset from the NestJS origin. This ensures absolute zero request latency for users, protecting the backend from "thundering herd" spikes.

### 2. Consent-Safe Personalization (Privacy by Design)

To guarantee GDPR/CCPA compliance unconditionally, PII cannot be inadvertently processed or evaluated by the backend decision systems if the user declines marketing consent.

- **`ConsentInterceptor`**: NestJS's unified interception boundary is leveraged to inject a strict access control protocol before the standard controller layer is reached.
- When `POST /decide` receives a payload containing `{ consent: { marketing: false } }`, the `ConsentInterceptor` cleanly nullifies explicitly sensitive correlation identifiers like the `visitorId` and `userId`.
- This ensures the `DecisionService` evaluates conditions completely anonymously. The strategy patterns function securely, but specific 1-to-1 tracking is aggressively stripped *by design* at the edge of the service router.

## LLM Safety & Observability

We validate all AI outputs by comparing the generated claimId against the strict schema of allowed claims dynamically loaded from the source list.
If the LLM hallucinates an invalid claim, the system automatically triggers a single-retry recovery mechanism with an explicit correction prompt.
If the retry fails or the API times out, the system defaults to a deterministic, pre-approved fallback JSON object containing a safe marketing headline.
All validation errors and fallback triggers are logged to stdout to ensure production observability and facilitate monitoring of LLM token degradation.

---

## Testing

The monorepo contains Jest unit testing verifying the integrity of the PII Consent Interceptor boundary.

Run the test suite:
```bash
pnpm test
# Or inside apps/api: 
pnpm --filter api run test
```
