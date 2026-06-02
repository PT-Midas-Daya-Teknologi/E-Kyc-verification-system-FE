# E-KYC Verification Frontend

A Vite-powered React frontend for the KYC liveness verification flow.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API configuration

The app uses the Vite proxy configuration in `vite.config.js` to forward requests to the backend at `http://localhost:8098/openapi/dev`.

If you want to override the backend origin, set `VITE_API_BASE_URL` in a `.env` file.

## Available scripts

- `npm run dev` — start the Vite development server
- `npm run build` — build the production bundle
- `npm run preview` — preview the production build locally

## Notes

- This project uses `@aws-amplify/ui-react-liveness` for live face verification.
- The frontend assumes the Spring Boot backend is running locally on port `8098`.
- `src/App.jsx` is the main application entry.
