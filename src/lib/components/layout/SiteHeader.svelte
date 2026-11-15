<script lang="ts">
	import logoWhite from '#lib/assets/brand/logo-white.png';
	import discordIcon from '#lib/assets/brand/discord.png';
	import { site } from '#lib/config/site.ts';
	import type { NavCta, NavLink } from './nav.ts';

	interface Props {
		/** Where the logo links to. */
		homeHref: string;
		/** Text links, hidden on narrow screens where they would not fit. */
		links: NavLink[];
		/** The pill button on the right. */
		cta: NavCta;
	}

	let { homeHref, links, cta }: Props = $props();
</script>

<!--
	eslint-disable svelte/no-navigation-without-resolve --
	Internal hrefs arrive already built with resolve() in +layout.svelte; the rest are external URLs.
-->
<header class="site-header">
	<div class="bar">
		<a class="brand" href={homeHref}>
			<img src={logoWhite} alt="{site.name} home" width="26" height="30" />
		</a>
		<nav aria-label="Main">
			<a
				class="icon-link"
				href={site.discordUrl}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="{site.name} Discord (opens in a new tab)"
			>
				<img src={discordIcon} alt="" width="20" height="16" />
			</a>
			<span class="divider" aria-hidden="true"></span>
			<ul class="links">
				{#each links as link (link.href)}
					<li><a href={link.href}>{link.label}</a></li>
				{/each}
			</ul>
			{#if cta.href}
				<a
					class="pill"
					href={cta.href}
					target={cta.external ? '_blank' : undefined}
					rel={cta.external ? 'noopener noreferrer' : undefined}
					aria-current={cta.current ? 'page' : undefined}
				>
					{cta.label}
					{#if cta.external}<span class="visually-hidden">(opens in a new tab)</span>{/if}
				</a>
			{:else}
				<span class="pill closed">{cta.label}</span>
			{/if}
		</nav>
	</div>
</header>

<style>
	.site-header {
		position: sticky;
		top: 0;
		z-index: 20;
		background: var(--bg-dark);
		border-bottom: 1px solid var(--divider-on-dark-faint);
	}

	.bar {
		max-width: var(--nav-width);
		height: var(--nav-height);
		margin: 0 auto;
		padding: 0 var(--nav-gutter);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
	}

	.brand {
		display: flex;
		align-items: center;
		min-height: 44px;
	}

	.brand img {
		height: 30px;
		width: auto;
	}

	nav {
		display: flex;
		align-items: center;
		gap: 22px;
	}

	.links {
		display: flex;
		align-items: center;
		gap: 22px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* Text links keep the 14px look but get a 44px tall tap target. */
	.links a,
	.icon-link {
		display: flex;
		align-items: center;
		min-height: 44px;
		color: var(--text-on-dark);
		font-size: var(--text-sm);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.icon-link {
		min-width: 44px;
		justify-content: center;
		margin-inline: -12px;
	}

	.icon-link img {
		height: 16px;
		width: auto;
	}

	.links a:hover,
	.icon-link:hover {
		color: #ffffff;
	}

	.divider {
		width: 1px;
		height: 18px;
		background: rgba(255, 255, 255, 0.18);
	}

	.pill {
		position: relative;
		height: 35px;
		display: flex;
		align-items: center;
		padding: 0 16px;
		border-radius: var(--radius-pill);
		background: var(--text-on-dark);
		color: var(--bg-dark);
		font-size: var(--text-sm);
		white-space: nowrap;
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	/* Extends the 35px pill's tap target to 44px without changing how it looks. */
	.pill::after {
		content: '';
		position: absolute;
		inset: -5px 0;
	}

	a.pill:hover {
		background: #ffffff;
		color: var(--bg-dark);
	}

	.pill.closed {
		background: rgba(255, 255, 255, 0.12);
		color: var(--text-on-dark-2);
		cursor: default;
		user-select: none;
	}

	@media (max-width: 719px) {
		.links,
		.divider {
			display: none;
		}
	}
</style>
