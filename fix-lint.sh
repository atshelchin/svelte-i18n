#!/bin/bash

# Fix ValidationPopup.svelte
sed -i '' 's/as any/as I18nInstance<string> \& { errors: Record<string, string[]> }/g' src/lib/components/ValidationPopup.svelte

# Fix validation-popup-i18n.ts  
sed -i '' 's/as any/as TranslationSchema/g' src/lib/components/validation-popup-i18n.ts

# Fix validation-popup-loader.ts - remove unused error variables
sed -i '' 's/} catch (error) {/} catch {/g' src/lib/components/validation-popup-loader.ts

# Fix store.svelte.ts - remove unused error variable
sed -i '' 's/} catch (error) {/} catch {/g' src/lib/store.svelte.ts

# Fix typed-i18n.ts - replace any with proper types
sed -i '' 's/extractAllKeys(obj: any/extractAllKeys(obj: Record<string, unknown>/g' src/lib/typed-i18n.ts
sed -i '' 's/(i18n as any)/(i18n as { translations?: Record<string, unknown> })/g' src/lib/typed-i18n.ts

# Fix routes files - add each block keys and fix any types
# Fix auto-discovery-demo
sed -i '' 's/{#each packages as pkg}/{#each packages as pkg (pkg.name)}/g' src/routes/auto-discovery-demo/+page.svelte
sed -i '' 's/{#each pkg.translations as \[locale, translations\]}/{#each pkg.translations as [locale, translations] (locale)}/g' src/routes/auto-discovery-demo/+page.svelte
sed -i '' 's/as any/as TranslationSchema/g' src/routes/auto-discovery-demo/+page.svelte

# Fix editor/+page.svelte  
sed -i '' 's/expandedSections = \$state(new SvelteSet())/expandedSections = new SvelteSet()/g' src/routes/editor/+page.svelte
sed -i '' 's/new Map()/new SvelteMap()/g' src/routes/editor/+page.svelte  

# Add SvelteMap import to editor/+page.svelte if not present
if ! grep -q "SvelteMap" src/routes/editor/+page.svelte; then
    sed -i '' '1s/^/import { SvelteMap } from "svelte\/reactivity";\n/' src/routes/editor/+page.svelte
fi

# Fix translation-cache.ts - replace any with unknown
sed -i '' 's/: any/: unknown/g' src/routes/editor/translation-cache.ts

# Fix namespace-demo - remove unused import
sed -i '' "s/, getI18n//g" src/routes/namespace-demo/+page.svelte

# Fix typed-demo - add each keys and handle errors
sed -i '' 's/{#each Object.entries(categorizedKeys()) as \[category, keys\]}/{#each Object.entries(categorizedKeys()) as [category, keys] (category)}/g' src/routes/typed-demo/+page.svelte
sed -i '' 's/{#each keys as key}/{#each keys as key (key)}/g' src/routes/typed-demo/+page.svelte
sed -i '' 's/} catch (e) {/} catch {/g' src/routes/typed-demo/+page.svelte
sed -i '' 's/as any/as string/g' src/routes/typed-demo/+page.svelte

echo "Lint fixes applied!"