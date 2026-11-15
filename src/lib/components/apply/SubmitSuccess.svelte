<script lang="ts">
	import { resolve } from '$app/paths';

	let heading: HTMLHeadingElement | undefined = $state();

	// Move focus to the heading so screen-reader users hear the result straight away.
	// The page has already scrolled to the top, so focusing mustn't scroll it again.
	$effect(() => {
		heading?.focus({ preventScroll: true });
	});
</script>

<section class="success" aria-labelledby="success-title">
	<div class="inner">
		<span class="eyebrow">Application received</span>
		<h1 id="success-title" bind:this={heading} tabindex="-1">Thanks for applying</h1>
		<p class="lead">Keep an eye on your student email. Best of luck!</p>
		<a class="pill-button light" href={resolve('/')}>Back to recruitment</a>
	</div>
</section>

<style>
	/* The gradient fades into the page's dark colour, so the space below it matches. */
	:global(main.light):has(.success) {
		background: var(--bg-dark);
	}

	/* The footer is navy under the white form; here it continues the dark background instead. */
	:global(body):has(.success) :global(.site-footer.navy) {
		background: var(--bg-dark);
	}

	/* Same gradient as the landing page hero. */
	.success {
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
