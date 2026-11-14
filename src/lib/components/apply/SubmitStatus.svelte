<script lang="ts">
	import { resolve } from '$app/paths';
	import { site } from '#lib/config/site.ts';
	import { formatMelbourne } from '#lib/domain/window.ts';

	/** Shown instead of the form: after a submission, or when applications aren't open (step 3.6, design §8). */
	interface Props {
		kind: 'success' | 'closed' | 'upcoming';
		/** ISO opening time from the page's load, for the upcoming message. */
		opensAt?: string;
		/** Move focus to the heading. Only after a submission, never on a plain page load. */
		focus?: boolean;
	}

	let { kind, opensAt, focus = true }: Props = $props();

	let heading: HTMLHeadingElement | undefined = $state();

	// Move focus to the new heading so screen-reader users hear the result straight away.
	// The page has already scrolled to the top, so focusing mustn't scroll it again.
	$effect(() => {
		if (focus) heading?.focus({ preventScroll: true });
	});
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- the only other link is the external Discord invite. -->
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
		{:else if kind === 'upcoming'}
			<h2 bind:this={heading} tabindex="-1">Applications aren’t open yet</h2>
			<p class="lead">
				Applications for 2027 Semester 1 open {opensAt ? formatMelbourne(opensAt) : 'soon'}. Join
				our
				<a href={site.discordUrl} target="_blank" rel="noopener noreferrer"
					>Discord<span class="visually-hidden"> (opens in a new tab)</span></a
				>
				to hear the moment they open.
			</p>
		{:else}
			<h2 bind:this={heading} tabindex="-1">Applications are closed</h2>
			<p class="lead">
				Applications for 2027 Semester 1 have closed. Join our
				<a href={site.discordUrl} target="_blank" rel="noopener noreferrer"
					>Discord<span class="visually-hidden"> (opens in a new tab)</span></a
				>
				to hear about the next round.
			</p>
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
