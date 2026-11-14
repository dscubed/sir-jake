<script module lang="ts">
	// `window.turnstile` is typed in src/app.d.ts.
	const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
	let loading: Promise<TurnstileApi> | undefined;

	/** Loads Cloudflare's script once per page, however many times the widget mounts. */
	function loadTurnstile(): Promise<TurnstileApi> {
		if (window.turnstile) return Promise.resolve(window.turnstile);
		loading ??= new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = SCRIPT_URL;
			script.async = true;
			script.onload = () =>
				window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile missing'));
			script.onerror = () => {
				loading = undefined;
				reject(new Error('Turnstile failed to load'));
			};
			document.head.append(script);
		});
		return loading;
	}
</script>

<script lang="ts">
	import { dev } from '$app/env';
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$app/env/public';

	/**
	 * Cloudflare's published test key that always passes, used in development when
	 * PUBLIC_TURNSTILE_SITE_KEY isn't set. Previews and production set the real key (step 0.4).
	 */
	const TEST_SITE_KEY_PASS = '1x00000000000000000000AA';
	const siteKey = PUBLIC_TURNSTILE_SITE_KEY || (dev ? TEST_SITE_KEY_PASS : '');

	let container: HTMLDivElement | undefined = $state();
	let widgetId: string | undefined;
	let failed = $state(false);

	/** A token can only be verified once, so the widget is reset after every failed submission (step 3.7). */
	export function reset() {
		if (widgetId !== undefined) window.turnstile?.reset(widgetId);
	}

	$effect(() => {
		if (!container || !siteKey) return;
		let cancelled = false;
		loadTurnstile()
			.then((api) => {
				if (cancelled || !container) return;
				// Renders a hidden `cf-turnstile-response` input inside the form for the server to verify.
				widgetId = api.render(container, { sitekey: siteKey, theme: 'light' });
			})
			.catch(() => (failed = true));
		return () => {
			cancelled = true;
			if (widgetId !== undefined) window.turnstile?.remove(widgetId);
			widgetId = undefined;
		};
	});
</script>

<div class="turnstile">
	<div bind:this={container} class="widget"></div>
	{#if failed}
		<p class="problem" role="alert">
			The verification check couldn’t load. Check your connection or turn off content blockers for
			this page, then reload.
		</p>
	{:else if !siteKey}
		<p class="problem">Verification isn’t configured on this deployment.</p>
	{/if}
</div>

<!--
	Honeypot (design D6): people never see or reach this field, but simple bots fill in every
	input. The server rejects any submission where it isn't empty.
-->
<div class="honeypot" aria-hidden="true">
	<label>
		Website
		<input type="text" name="website" tabindex="-1" autocomplete="off" />
	</label>
</div>

<style>
	/* Reserves the widget's 65px height so the page doesn't jump when it loads. */
	.widget {
		min-height: 65px;
	}

	.problem {
		font-size: var(--text-sm);
		color: var(--error);
	}

	.honeypot {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}
</style>
