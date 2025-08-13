/**
 * Test script to verify SSR with Korean language
 */

// Use built-in fetch (Node 18+)

async function testSSRKorean() {
	console.log('Testing SSR with Korean language...\n');
	
	try {
		// Test with Korean cookie
		const response = await fetch('http://localhost:5179/', {
			headers: {
				'Cookie': 'i18n-locale=ko'
			}
		});
		
		const html = await response.text();
		
		// Check if Korean content is in the HTML
		const hasKoreanWelcome = html.includes('환영합니다');
		const hasKoreanTitle = html.includes('SvelteKit로 만든 i18n 라이브러리');
		const hasEnglishWelcome = html.includes('Welcome to SvelteKit');
		
		console.log('Response status:', response.status);
		console.log('Has Korean welcome text:', hasKoreanWelcome);
		console.log('Has Korean title:', hasKoreanTitle);
		console.log('Has English welcome text:', hasEnglishWelcome);
		
		if (hasKoreanWelcome && !hasEnglishWelcome) {
			console.log('\n✅ SSR is correctly rendering Korean content!');
		} else if (hasEnglishWelcome && !hasKoreanWelcome) {
			console.log('\n❌ SSR is still rendering English content instead of Korean');
			console.log('This means auto-discovered languages are not being loaded during SSR');
		} else {
			console.log('\n⚠️ Unexpected state - both languages found or neither found');
		}
		
		// Save HTML for inspection
		const fs = await import('fs');
		fs.writeFileSync('ssr-output-korean.html', html);
		console.log('\nHTML output saved to ssr-output-korean.html for inspection');
		
	} catch (error) {
		console.error('Test failed:', error);
	}
}

testSSRKorean();