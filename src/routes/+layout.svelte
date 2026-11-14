<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import favicon from '#lib/assets/favicon.svg';
	import SiteHeader from '#lib/components/layout/SiteHeader.svelte';
	import SiteFooter from '#lib/components/layout/SiteFooter.svelte';
	import type { NavLink } from '#lib/components/layout/nav.ts';
	import { site } from '#lib/config/site.ts';
	import { landing } from '#lib/config/landing.ts';
	import { liveWindowStatus } from '#lib/state/windowStatus.svelte.ts';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const status = liveWindowStatus(() => data.windowStatus);

	const home = resolve('/');
	// Only the landing page is dark all the way down; every other page (including /apply) has a white body.
	const isLanding = $derived(page.route.id === '/');

	// The landing page links to its own sections; the application page links back to them.
	const links: NavLink[] = $derived(
		isLanding
			? [
					{ label: 'About', href: '#about' },
					{ label: 'Teams', href: '#teams' },
					{ label: 'Process', href: '#process' },
					{ label: 'FAQ', href: '#faq' }
				]
			: [
					{ label: 'Teams', href: `${home}#teams` },
					{ label: 'FAQ', href: `${home}#faq` }
				]
	);

	// On the landing page the pill follows the application window: the form while open, Discord otherwise.
	const cta: NavLink = $derived.by(() => {
		if (!isLanding) return { label: 'Back to recruitment', href: home };
		const label = landing.cta[status.current].nav;
		return status.current === 'open'
			? { label, href: resolve('/apply') }
			: { label, href: site.discordUrl, external: true };
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>

<SiteHeader homeHref={home} {links} {cta} />

<main id="main" tabindex="-1" class:light={!isLanding}>
	{@render children()}
</main>

<SiteFooter variant={isLanding ? 'dark' : 'navy'} />

<style>
	:global(body) {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		min-height: 100dvh;
	}

	.skip-link {
		position: absolute;
		left: var(--space-2);
		top: -100%;
		z-index: 30;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		background: #ffffff;
		color: var(--ink);
	}

	.skip-link:focus {
		top: var(--space-2);
	}

	main {
		flex: 1;
		background: var(--bg-dark);
		color: var(--text-on-dark);
	}

	main.light {
		background: #ffffff;
		color: var(--ink);
	}

	main:focus {
		outline: none;
	}
</style>
