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

	// Every page shows the same links to the landing page's sections.
	const sections = [
		{ label: 'About', id: 'about' },
		{ label: 'Teams', id: 'teams' },
		{ label: 'Process', id: 'process' },
		{ label: 'FAQ', id: 'faq' }
	];
	const links: NavLink[] = $derived(
		sections.map(({ label, id }) => ({ label, href: isLanding ? `#${id}` : `${home}#${id}` }))
	);

	// The pill follows the application window on every page: the form while open, Discord otherwise.
	const cta: NavLink = $derived.by(() => {
		const label = landing.cta[status.current].nav;
		return status.current === 'open'
			? { label, href: resolve('/apply'), current: page.route.id === '/apply' }
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
