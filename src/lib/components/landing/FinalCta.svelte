<script lang="ts">
	import { landing } from '#lib/config/landing.ts';
	import type { DisplayStatus } from '#lib/domain/window.ts';
	import CtaLink from './CtaLink.svelte';

	let { status }: { status: DisplayStatus } = $props();

	const copy = landing.cta.open;
</script>

<section class="final" aria-labelledby="final-title">
	<div class="inner">
		{#if status === 'open'}
			<h2 id="final-title" class="section-title">{copy.title}</h2>
			<p>{copy.body}</p>
			<CtaLink {status} class="pill-button light" />
		{:else}
			<h2 id="final-title" class="section-title">{landing.cta.closed}</h2>
		{/if}
	</div>
</section>

<style>
	.final {
		background:
			linear-gradient(
				180deg,
				#14141e 0%,
				rgba(20, 20, 30, 0) 30%,
				rgba(20, 20, 30, 0) 60%,
				#14141e 100%
			),
			radial-gradient(
				ellipse 70% 80% at 50% 50%,
				#2f4685 0%,
				#243668 35%,
				#1a2347 65%,
				#14141e 100%
			);
	}

	.inner {
		max-width: 720px;
		margin: 0 auto;
		padding: var(--section-padding) var(--section-gutter);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 18px;
		text-align: center;
	}

	p {
		color: var(--text-on-dark-2);
	}

	.inner :global(.pill-button) {
		margin-top: 6px;
	}
</style>
