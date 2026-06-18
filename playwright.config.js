import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 15000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: 'python -m http.server 8000 --bind 127.0.0.1',
    url: 'http://127.0.0.1:8000',
    reuseExistingServer: true,
    timeout: 10000,
  },
});
