<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let cleared = $state(false);

	function clearLocaleSettings() {
		// Clear localStorage
		localStorage.removeItem('i18n-locale');

		// Clear cookies
		document.cookie = 'i18n-locale=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

		cleared = true;

		// Redirect to home after 2 seconds
		setTimeout(() => {
			goto('/');
		}, 2000);
	}

	onMount(() => {
		// Show current settings
		console.log('Current locale settings:');
		console.log('  localStorage:', localStorage.getItem('i18n-locale'));
		console.log(
			'  cookie:',
			document.cookie.split(';').find((c) => c.trim().startsWith('i18n-locale='))
		);
	});
</script>

<div class="reset-container">
	<h1>重置语言设置 / Reset Locale Settings</h1>

	{#if !cleared}
		<div class="info">
			<p>当前保存的语言设置 / Current saved locale:</p>
			<ul>
				<li>
					localStorage: <code
						>{typeof window !== 'undefined'
							? localStorage.getItem('i18n-locale') || 'none'
							: 'checking...'}</code
					>
				</li>
				<li>
					Cookie: <code
						>{typeof window !== 'undefined'
							? document.cookie
									.split(';')
									.find((c) => c.trim().startsWith('i18n-locale='))
									?.split('=')[1] || 'none'
							: 'checking...'}</code
					>
				</li>
			</ul>

			<p>点击下面的按钮清除所有保存的语言设置，让应用使用默认语言（中文）：</p>
			<p>
				Click the button below to clear all saved locale settings and use the default locale
				(Chinese):
			</p>
		</div>

		<button onclick={clearLocaleSettings} class="reset-btn">
			🔄 清除语言设置 / Clear Locale Settings
		</button>
	{:else}
		<div class="success">
			<p>✅ 语言设置已清除！/ Locale settings cleared!</p>
			<p>正在跳转到首页... / Redirecting to home page...</p>
			<p>应用将使用默认语言：<strong>中文 (zh)</strong></p>
			<p>The app will use the default locale: <strong>Chinese (zh)</strong></p>
		</div>
	{/if}
</div>

<style>
	.reset-container {
		max-width: 600px;
		margin: 2rem auto;
		padding: 2rem;
		background: #f5f5f5;
		border-radius: 8px;
		text-align: center;
	}

	h1 {
		color: #333;
		margin-bottom: 2rem;
	}

	.info {
		background: white;
		padding: 1.5rem;
		border-radius: 4px;
		margin-bottom: 2rem;
		text-align: left;
	}

	.info p {
		margin: 1rem 0;
	}

	.info ul {
		list-style: none;
		padding: 0;
		margin: 1rem 0;
	}

	.info li {
		padding: 0.5rem;
		background: #f0f0f0;
		margin: 0.5rem 0;
		border-radius: 4px;
		font-family: monospace;
	}

	code {
		background: #e0e0e0;
		padding: 0.2rem 0.5rem;
		border-radius: 3px;
		font-weight: bold;
	}

	.reset-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		padding: 1rem 2rem;
		font-size: 1.1rem;
		border-radius: 8px;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.reset-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.success {
		background: #d4edda;
		border: 1px solid #c3e6cb;
		color: #155724;
		padding: 1.5rem;
		border-radius: 4px;
		animation: fadeIn 0.5s;
	}

	.success p {
		margin: 0.5rem 0;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
