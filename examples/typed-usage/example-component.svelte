<script lang="ts">
	// This is how external applications should use the library
	// Import from YOUR app's i18n module, not from @shelchin/svelte-i18n directly
	import { getI18n } from './app-i18n.js';

	const i18n = getI18n();

	// Full type safety! Your editor will:
	// 1. Show autocomplete for all available keys
	// 2. Show errors for invalid keys
	// 3. Check parameter types

	// ✅ Valid keys (these would be from YOUR translation files)
	const title = i18n.t('app.title');
	const welcome = i18n.t('app.welcome', { name: 'World' });

	// ❌ This would show a TypeScript error:
	// const invalid = i18n.t('app.nonExistentKey');
	// Error: Argument of type '"app.nonExistentKey"' is not assignable to parameter of type 'I18nPath'
</script>

<h1>{title}</h1>
<p>{welcome}</p>
