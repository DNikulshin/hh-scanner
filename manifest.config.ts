import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

export default defineManifest({
  manifest_version: 3,
  name: 'HH Scanner — Smart Vacancy Filter',
  description: 'Умный парсер вакансий hh.ru с персонализированным скорингом',
  version: pkg.version,
  icons: {
    16: 'public/icons/icon16.png',
    32: 'public/icons/icon32.png',
    48: 'public/icons/icon48.png',
    128: 'public/icons/icon128.png',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'HH Scanner',
    default_icon: {
      16: 'public/icons/icon16.png',
      32: 'public/icons/icon32.png',
    },
  },
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['https://hh.ru/search/vacancy*', 'https://*.hh.ru/search/vacancy*'],
      js: ['src/content/content-script.ts'],
      run_at: 'document_idle',
    },
  ],
  permissions: ['storage', 'tabs', 'activeTab', 'scripting'],
  host_permissions: ['https://hh.ru/*', 'https://*.hh.ru/*'],
  web_accessible_resources: [
    {
      resources: ['src/dashboard/index.html'],
      matches: ['https://hh.ru/*', 'https://*.hh.ru/*'],
    },
  ],
});
