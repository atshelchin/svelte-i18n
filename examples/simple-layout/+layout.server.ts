import { handleSSR } from '@shelchin/svelte-i18n';
import { i18n } from '../translations/i18n.js';

// One line setup for SSR!
export const load = handleSSR(i18n);
