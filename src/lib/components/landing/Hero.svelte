<script module lang="ts">
	/** About 60 faint "stars" at fixed, pseudo-random positions (same formula as the design file). */
	const stars = Array.from({ length: 60 }, (_, i) => {
		const r = (n: number) => {
			const x = Math.sin(i * 9301 + n * 49297) * 233280;
			return x - Math.floor(x);
		};
		return {
			x: `${(r(1) * 100).toFixed(2)}%`,
			y: `${(r(2) * 100).toFixed(2)}%`,
			size: r(3) > 0.85 ? 2 : 1,
			opacity: (0.25 + r(4) * 0.5).toFixed(2)
		};
	});
</script>

<script lang="ts">
	import { landing } from '#lib/config/landing.ts';
	import type { DisplayStatus } from '#lib/domain/window.ts';
	import CtaLink from './CtaLink.svelte';

	let { status }: { status: DisplayStatus } = $props();
</script>

<section class="hero" aria-labelledby="hero-title">
	<div class="stars" aria-hidden="true">
		{#each stars as star, i (i)}
			<span
				style:left={star.x}
				style:top={star.y}
				style:width="{star.size}px"
				style:height="{star.size}px"
				style:opacity={star.opacity}
			></span>
		{/each}
	</div>
	<div class="inner">
		<h1 id="hero-title">{landing.hero.title}</h1>
		<p class="lead">{landing.hero.lead}</p>
		<div class="actions">
			<CtaLink {status} label={landing.cta[status].hero} class="pill-button light" />
			<a class="pill-button outline" href="#teams">Explore teams</a>
		</div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		overflow: hidden;
		background:
			linear-gradient(180deg, rgba(20, 20, 30, 0) 0%, rgba(20, 20, 30, 0) 55%, #14141e 100%),
			radial-gradient(
				ellipse 80% 100% at 50% 20%,
				#2f4685 0%,
				#243668 35%,
				#1a2347 65%,
				#14141e 100%
			);
	}

	.stars span {
		position: absolute;
		border-radius: 50%;
		background: #ffffff;
	}

	.inner {
		position: relative;
		max-width: 820px;
		margin: 0 auto;
		padding: clamp(96px, 12vw, 152px) var(--section-gutter) clamp(112px, 13vw, 168px);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		text-align: center;
	}

	h1 {
		max-width: 20ch;
		font-size: var(--text-h1);
		line-height: var(--leading-tight);
		letter-spacing: -0.01em;
		color: var(--text-on-dark);
		text-wrap: balance;
	}

	.lead {
		max-width: 580px;
		font-size: var(--text-lg);
		line-height: var(--leading-normal);
		color: var(--text-on-dark-2);
		text-wrap: pretty;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 12px;
		margin-top: 6px;
	}
</style>
