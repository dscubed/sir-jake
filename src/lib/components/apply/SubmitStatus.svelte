<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatSubmittedAt } from '#lib/apply/outcome.ts';
	import { site } from '#lib/config/site.ts';

	/** Replaces the form once it is finished with (step 3.6, design §8). */
	type Props =
		| {
				kind: 'success';
				submittedAt: Date;
				firstName: string;
				firstPreference: string;
				secondPreference: string;
		  }
		| { kind: 'closed' };

	let props: Props = $props();

	let heading: HTMLHeadingElement | undefined = $state();

	// Move focus to the new heading so screen-reader users hear the result straight away.
	// The page has already scrolled to the top, so focusing mustn't scroll it again.
	$effect(() => {
		heading?.focus({ preventScroll: true });
	});
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- the only other link is the external Discord invite. -->
<div class="status">
	<div class="card">
		{#if props.kind === 'success'}
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
			<h2 bind:this={heading} tabindex="-1">Application received</h2>
			<p class="lead">
				Thanks, {props.firstName}. We received your application on
				{formatSubmittedAt(props.submittedAt)}. A copy of your preferences is below.
			</p>
			<dl class="summary">
				<div>
					<dt>First preference</dt>
					<dd>{props.firstPreference}</dd>
				</div>
				<div>
					<dt>Second preference</dt>
					<dd>{props.secondPreference}</dd>
				</div>
			</dl>
			<p class="muted">
				If you’re shortlisted, we’ll email you about the group interview. In the meantime, say hi on
				<a href={site.discordUrl} target="_blank" rel="noopener noreferrer"
					>Discord<span class="visually-hidden"> (opens in a new tab)</span></a
				>.
			</p>
		{:else}
			<h2 bind:this={heading} tabindex="-1">Applications are closed</h2>
			<p class="lead">
				Applications for 2027 Semester 1 have closed, so we couldn’t accept this one. Join our
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

	.summary {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding: 16px 0;
		border-top: 1px solid var(--divider);
		border-bottom: 1px solid var(--divider);
		font-size: 15px;
	}

	.summary div {
		display: flex;
		justify-content: space-between;
		gap: 16px;
	}

	dt {
		color: var(--muted);
	}

	dd {
		margin: 0;
		color: var(--ink);
	}

	.muted {
		line-height: var(--leading-normal);
		color: var(--muted);
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
