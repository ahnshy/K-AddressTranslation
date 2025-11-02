# K-AddressTranslation <br/>
 Korean-to-English address search & translation app powered by the Korea Juso Address APIs, built with Next.js and MUI.
 This is a template for an address search input (providing a ZIP code and a pop-up window). Additionally, if a Korean address is selected, it is automatically converted into an English address.
<br/>
<br/>

## 📢 [Overview]
- Autocomplete search in **Korean** (동/면/도로명/건물명). As you type, candidates are fetched from the Juso API.
- Selecting a candidate fills **Address 1 (Korean)**, auto-fills **English Address**, and **Postal Code**.
- **Address 2** is for user-provided details (apt/unit/floor, etc.).
- Includes a **popup address search dialog**, **responsive layout**, and **Night/Dark/Light** themes (Night by default).
<br/><br/>

## 🛠️ Stacks
<img src="https://img.shields.io/badge/Next.js-000000?logo=Next.js&logoColor=white"/> <img src="https://img.shields.io/badge/React.js-%2320232a.svg?&logo=react&logoColor=%2361DAFB"/> <img src="https://img.shields.io/badge/MUI-007FFF?logo=mui&logoColor=white" /> <img src="https://img.shields.io/badge/TypeScript-%23007ACC.svg?logo=typescript&logoColor=white"/> <img src="https://img.shields.io/badge/Vercel-000000?logo=Vercel&logoColor=white"/> <br/><br/>

## 🚩 [Objective]
- Provide a **fast and accurate** UX for Korean address autocompletion with **instant English translation** for global shipping/documents.
- Support **responsive/mobile-first** interaction and a **popup** workflow for power users.
- Offer a clean API layer (`/api/address`) so other apps can reuse the search endpoint.
<br/>

## 🛠️ [Technologies]
- **Next.js (App Router)** — Serverless API route for proxying/normalizing the Juso responses; app UI in the `/app` directory.
- **React 18** — Interactive autocomplete experience with optimistic updates and debounced search.
- **MUI** — Accessible components, responsive Dialog, slot-customized Autocomplete popper/listbox.
- **TypeScript** — Safer types across components and the API route.
<br/>

## 🙏 Special Thanks
- Powered by **Korea Juso Address APIs** (국가주소정보) — `addrLinkApi.do` (KO) & `addrEngApi.do` (EN). <br/>
- Inspired by the structure of the user's README template (sectioning & icon style). fileciteturn0file0
<br/>

## ⚙️ [Instructions]

### 1. Install dependencies
You can use `npm`, `yarn`, `pnpm`, or `bun`. Example using `npm`:
```bash
npm install
```

### 2. Environment variables
Copy the example and fill in your Juso API keys:
```bash
cp .env.local.example .env.local
```
`.env.local`:
```ini
# Separate keys for KO & EN (recommended)
JUSO_CONF_KEY_KO=YOUR_KOREAN_SEARCH_KEY
JUSO_CONF_KEY_EN=YOUR_ENGLISH_SEARCH_KEY

# (Optional) single key fallback
JUSO_CONF_KEY=YOUR_SINGLE_KEY_OPTIONAL

# Base URLs (defaulted; override if needed)
JUSO_BASE_URL=https://www.juso.go.kr/addrlink/addrLinkApi.do
JUSO_BASE_URL_EN=https://www.juso.go.kr/addrlink/addrEngApi.do

# Page size (1~50)
JUSO_COUNT_PER_PAGE=10
```

### 3. Run the dev server
`--turbo` is available for Next.js v14+:
```bash
npm run dev
# or
next dev --turbo
```

### 4. Production build
```bash
npm run build
# or
next build
```
<br/>

## 📡 [Public API for reuse]
The app exposes a normalized REST endpoint for both KO/EN queries:

```
GET /api/address?q=<keyword>&lang=ko|en&page=<1..n>&size=<1..50>
```

**Notes**
- When `lang=en` and the English endpoint returns no results **or** when `q` contains Hangul, the server **bridges**: it fetches KO results first and then re-queries the EN endpoint using the best KO keys (zip, road name, building) to synthesize EN candidates.
- Response payload:
```json
{
  "items": [
    {
      "lang": "ko|en",
      "roadAddr": "string",
      "jibunAddr": "string|null",
      "zipNo": "string|null",
      "sido": "string|null",
      "sigungu": "string|null",
      "eupmyeon": "string|null",
      "roadName": "string|null",
      "buildingName": "string|null"
    }
  ],
  "totalCount": 123,
  "page": 1,
  "size": 10,
  "lang": "ko"
}
```
<br/>

## 🧩 [Key Features]
* **Autocomplete (KO)** with debounced fetching and server-side normalization
* **One-click English translation** after selection (auto-lookup by `zipNo` » `roadAddr` » `buildingName`)
* **Popup search dialog** — power-user flow with the same KO search inside a responsive modal
* **Night theme by default**, with **Dark/Light** toggles
* **Themed “Search” button** in Night mode (Orange #FFA500 / Hover #E59400)
* **Responsive** listbox/popup: controlled max-heights & scrolling for small screens
* **Reset** button clears all inputs/list state cleanly
<br/>

## 💻 [Demo and Preview]
- Live Demo: (optional) Deploy to Vercel and paste your URL here. <br/>
- Desktop:
  - Search field with inline Autocomplete, “Search” & “Popup” buttons
  - Address 1 (KO) and English Address auto-filled on selection
- Mobile:
  - Popup becomes **full screen**, listbox scroll is optimized for touch

> Tip: If you embed this widget elsewhere, you can reuse `/api/address` and the `AddressSearch` component.

## 🔑 [License]
Apache-2.0 license (same spirit as the template).
