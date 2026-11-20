<script lang="ts">
	import { resolve } from '$app/paths';

	/** Full-page result screen: shown after a submission, or instead of the form when applications are closed. */
	interface Props {
		eyebrow: string;
		title: string;
		lead: string;
		/** Move focus to the heading. Only after a submission, never on a plain page load. */
		focus?: boolean;
	}

	let { eyebrow, title, lead, focus = true }: Props = $props();

	let heading: HTMLHeadingElement | undefined = $state();

	// Move focus to the heading so screen-reader users hear the result straight away.
	// The page has already scrolled to the top, so focusing mustn't scroll it again.
	$effect(() => {
		if (focus) heading?.focus({ preventScroll: true });
	});
</script>

<section class="status-screen" aria-labelledby="status-title">
	<div class="inner">
		<span class="eyebrow">{eyebrow}</span>
		<h1 id="status-title" bind:this={heading} tabindex="-1">{title}</h1>
		<p class="lead">{lead}</p>
		<a class="pill-button light" href={resolve('/')}>Back to recruitment</a>
	</div>
</section>

<style>
	/* The gradient fades into the page's dark colour, so the space below it matches. */
	:global(main.light):has(.status-screen) {
		background: var(--bg-dark);
	}

	/* The footer is navy under the white form; here it continues the dark background instead. */
	:global(body):has(.status-screen) :global(.site-footer.navy) {
		background: var(--bg-dark);
	}

	/* Same gradient as the landing page hero. */
	.status-screen {
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

	.inner {
		max-width: 820px;
		margin: 0 auto;
		padding: clamp(96px, 12vw, 152px) var(--section-gutter) clamp(112px, 13vw, 168px);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		text-align: center;
	}

	h1 {
		font-size: var(--text-h1);
		line-height: var(--leading-tight);
		letter-spacing: -0.01em;
		color: var(--text-on-dark);
		text-wrap: balance;
	}

	h1:focus {
		outline: none;
	}

	.lead {
		max-width: 520px;
		font-size: var(--text-lg);
		line-height: var(--leading-normal);
		color: var(--text-on-dark-2);
	}

	.pill-button {
		margin-top: 10px;
	}
</style>
