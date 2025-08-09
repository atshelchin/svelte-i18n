<script lang="ts">
	import { onMount } from 'svelte';
	import { setupI18n } from '$lib';
	import { ValidationPopup } from '$lib';
	import { loadValidationPopupLanguage } from '$lib/components/validation-popup-i18n.js';

	// Main application i18n instance
	let mainI18n = setupI18n({
		defaultLocale: 'en',
		fallbackLocale: 'en',
		namespace: 'app' // Application namespace
	});

	// Load main app translations
	onMount(async () => {
		// Load application translations
		await mainI18n.loadLanguage('en', {
			welcome: 'Welcome to the namespace demo!',
			description: 'This demo shows how ValidationPopup uses its own namespace.',
			mainNamespace: 'Main app namespace: {namespace}',
			popupNamespace: 'ValidationPopup namespace: svelte-i18n-validation',
			explanation: 'The ValidationPopup component maintains its own translations independently.',
			changeLocale: 'Change locale to see how both namespaces sync:',
			currentLocale: 'Current locale: {locale}'
		});

		await mainI18n.loadLanguage('zh', {
			welcome: '欢迎来到命名空间演示！',
			description: '此演示展示了 ValidationPopup 如何使用自己的命名空间。',
			mainNamespace: '主应用命名空间：{namespace}',
			popupNamespace: 'ValidationPopup 命名空间：svelte-i18n-validation',
			explanation: 'ValidationPopup 组件独立维护自己的翻译。',
			changeLocale: '更改语言以查看两个命名空间如何同步：',
			currentLocale: '当前语言：{locale}'
		});

		// Add some validation errors to demonstrate the popup
		await mainI18n.loadLanguage('fr', {
			welcome: 'Bienvenue'
			// Intentionally missing some keys to trigger validation errors
		});

		// Load additional language for ValidationPopup
		await loadValidationPopupLanguage('fr', {
			_meta: {
				name: 'Français',
				englishName: 'French',
				direction: 'ltr',
				flag: '🇫🇷',
				code: 'fr'
			},
			validationPopup: {
				header: {
					title: 'Rapport de validation des traductions',
					issues: '{count} problèmes',
					languages: '{count} langues',
					close: 'Fermer'
				},
				controls: {
					languageLabel: 'Langue :',
					languageOption: '{flag} {name} ({count} erreurs)',
					export: 'Exporter'
				},
				exportMenu: {
					downloadJSON: 'Télécharger JSON',
					downloadText: 'Télécharger le rapport texte',
					copyJSON: 'Copier JSON dans le presse-papiers',
					copied: 'Copié dans le presse-papiers !'
				},
				pagination: {
					page: 'Page {current} / {total}',
					previous: 'Précédent',
					next: 'Suivant'
				},
				emptyState: {
					selectLanguage: 'Veuillez sélectionner une langue dans le menu déroulant ci-dessus',
					noErrors: 'Aucune erreur de validation pour cette langue'
				},
				floatingIndicator: {
					translationIssues: 'Problèmes de traduction'
				},
				report: {
					title: 'Rapport des traductions manquantes',
					language: 'Langue : {name} ({code})',
					totalMissing: 'Total des clés manquantes : {count}',
					details: 'Détails :',
					generatedAt: 'Généré le : {date}',
					todoTranslate: '[À FAIRE : Traduire en {language}]'
				}
			}
		});
	});

	let currentLocale = $state('en');

	function changeLocale(locale: string) {
		currentLocale = locale;
		mainI18n.setLocale(locale);
	}
</script>

<div class="demo-container">
	<h1>{mainI18n.t('welcome')}</h1>
	<p>{mainI18n.t('description')}</p>

	<div class="namespace-info">
		<div class="info-card">
			<h3>{mainI18n.t('mainNamespace', { namespace: mainI18n.getNamespace() || 'none' })}</h3>
		</div>
		<div class="info-card">
			<h3>{mainI18n.t('popupNamespace')}</h3>
		</div>
	</div>

	<p class="explanation">{mainI18n.t('explanation')}</p>

	<div class="locale-switcher">
		<p>{mainI18n.t('changeLocale')}</p>
		<div class="locale-buttons">
			<button class:active={currentLocale === 'en'} onclick={() => changeLocale('en')}>
				🇬🇧 English
			</button>
			<button class:active={currentLocale === 'zh'} onclick={() => changeLocale('zh')}>
				🇨🇳 中文
			</button>
			<button class:active={currentLocale === 'fr'} onclick={() => changeLocale('fr')}>
				🇫🇷 Français
			</button>
		</div>
		<p class="current-locale">{mainI18n.t('currentLocale', { locale: currentLocale })}</p>
	</div>

	<!-- ValidationPopup will use its own namespace -->
	<ValidationPopup />
</div>

<style>
	.demo-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	h1 {
		color: #667eea;
		margin-bottom: 1rem;
	}

	.namespace-info {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin: 2rem 0;
	}

	.info-card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 1.5rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.info-card h3 {
		margin: 0;
		font-size: 1rem;
	}

	.explanation {
		background: #f7fafc;
		padding: 1rem;
		border-radius: 8px;
		border-left: 4px solid #667eea;
		margin: 2rem 0;
	}

	.locale-switcher {
		margin: 2rem 0;
		padding: 1.5rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.locale-buttons {
		display: flex;
		gap: 1rem;
		margin: 1rem 0;
	}

	.locale-buttons button {
		padding: 0.75rem 1.5rem;
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.locale-buttons button:hover {
		border-color: #667eea;
		background: #f7fafc;
	}

	.locale-buttons button.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-color: transparent;
	}

	.current-locale {
		margin-top: 1rem;
		padding: 0.75rem;
		background: #edf2f7;
		border-radius: 6px;
		font-weight: 500;
	}
</style>
