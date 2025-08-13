import { handleUniversal } from '@shelchin/svelte-i18n';
import { i18n } from '../translations/i18n.js';
import { browser } from '$app/environment';

// One line universal setup (for static sites)!
export const load = handleUniversal(i18n, browser);
