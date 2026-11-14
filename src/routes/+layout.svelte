<script lang="ts">
	import '../app.css';
	import { resolve } from '$app/paths';
	import favicon from '#lib/assets/favicon.svg';
	import logo from '#lib/assets/logo.svg';
	import { site } from '#lib/config/site.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const hasEmail = site.contactEmail.includes('@');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{site.name} Recruitment</title>
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>

<header class="site-header">
	<div class="bar">
		<a class="brand" href={resolve('/')}>
			<img src={logo} alt="" width="32" height="32" />
			<span>{site.name}</span>
		</a>
		<nav aria-label="Main">
			<a class="apply" href={resolve('/apply')}>Apply</a>
		</nav>
	</div>
</header>

<main id="main" tabindex="-1">
	{@render children()}
</main>

<footer class="site-footer">
	<div class="bar">
		<p>
			Questions about recruitment?
			{#if hasEmail}
				Email <a href="mailto:{site.contactEmail}">{site.contactEmail}</a>.
			{:else}
				Contact the {site.name} committee.
			{/if}
		</p>
		<p class="copyright">© {new Date().getFullYear()} {site.name}</p>
	</div>
</footer>

<style>
	:global(body) {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		min-height: 100dvh;
	}

	.bar {
		width: 100%;
		max-width: calc(var(--page-width) + 2 * var(--gutter));
		margin-inline: auto;
		padding-inline: var(--gutter);
	}

	.skip-link {
		position: absolute;
		left: var(--space-2);
		top: -100%;
		padding: var(--space-2) var(--space-3);
		background: var(--color-bg);
		border-radius: var(--radius-sm);
		z-index: 10;
	}

	.skip-link:focus {
		top: var(--space-2);
	}

	.site-header {
		border-bottom: 1px solid var(--color-border);
	}

	.site-header .bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		min-height: 4rem;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-text);
		font-size: var(--text-lg);
		font-weight: 700;
		text-decoration: none;
	}

	.apply {
		display: inline-block;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		background: var(--color-accent);
		color: var(--color-on-accent);
		font-weight: 600;
		text-decoration: none;
	}

	.apply:hover {
		background: var(--color-accent-hover);
		color: var(--color-on-accent);
	}

	main {
		flex: 1;
		padding-block: var(--space-7);
	}

	main:focus {
		outline: none;
	}

	.site-footer {
		border-top: 1px solid var(--color-border);
		background: var(--color-surface);
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		padding-block: var(--space-6);
	}

	.copyright {
		margin: 0;
	}
</style>
