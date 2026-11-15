<script lang="ts">
	import { resolve } from '$app/paths';
	import { landing } from '#lib/config/landing.ts';

	/** Shown instead of the form: after a submission, or when applications aren't open. */
	interface Props {
		kind: 'success' | 'closed' | 'upcoming';
		/** Move focus to the heading. Only after a submission, never on a plain page load. */
		focus?: boolean;
	}

	let { kind, focus = true }: Props = $props();

	let heading: HTMLHeadingElement | undefined = $state();

	// Move focus to the new heading so screen-reader users hear the result straight away.
	// The page has already scrolled to the top, so focusing mustn't scroll it again.
	$effect(() => {
		if (focus) heading?.focus({ preventScroll: true });
	});
</script>

<div class="status">
	<div class="card">
		{#if kind === 'success'}
			<span class="tick" aria-hidden="true">
				<svg viewBox="0 0 16 16" width="20" height="20"
					><path
						d="M3.5 8.5l3 3 6-7"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/></svg
				>
			</span>
			<h2 bind:this={heading} tabindex="-1">Thank you for applying</h2>
			<p class="lead">We wish you the best of luck.</p>
		{:else}
			<h2 bind:this={heading} tabindex="-1">{landing.cta.closed}</h2>
		{/if}
		<div class="actions">
			<a class="button" href={resolve('/')}>Back to recruitment</a>
		</div>
	</div>
</div>

<style>
	.status {
		max-width: var(--form-width);
		margin: 0 auto;
		padding: 16px var(--section-gutter) 120px;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: clamp(28px, 4vw, 44px);
		border: 1px solid var(--divider);
		border-radius: var(--radius-xl);
		background: var(--surface-light);
	}

	.tick {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--blue);
		color: #ffffff;
	}

	h2 {
		font-size: var(--text-xl);
		font-weight: 500;
		color: var(--ink);
	}

	h2:focus {
		outline: none;
	}

	.lead {
		line-height: var(--leading-normal);
		color: var(--ink-2);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 8px;
	}

	.button {
		height: 44px;
		display: inline-flex;
		align-items: center;
		padding: 0 22px;
		border-radius: var(--radius-pill);
		background: var(--navy);
		color: #ffffff;
		font-size: 15px;
		font-weight: 500;
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.button:hover {
		background: var(--blue);
		color: #ffffff;
	}
</style>
