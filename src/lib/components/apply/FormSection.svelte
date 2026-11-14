<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SectionId } from '#lib/apply/progress.ts';

	interface Props {
		id: SectionId;
		title: string;
		/** Short guidance under the heading. */
		intro?: Snippet;
		/** Vertical gap between the section's fields. */
		gap?: number;
		children: Snippet;
	}

	let { id, title, intro, gap = 22, children }: Props = $props();
</script>

<!-- tabindex lets the progress menu move keyboard focus to the section it scrolls to. -->
<fieldset {id} class="form-section" tabindex="-1" style:--gap="{gap}px">
	<!-- The h2 makes each section reachable by heading navigation; the legend names the group. -->
	<legend><h2>{title}</h2></legend>
	{#if intro}<p class="intro">{@render intro()}</p>{/if}
	{@render children()}
</fieldset>

<style>
	.form-section {
		display: flex;
		flex-direction: column;
		gap: var(--gap);
		min-width: 0;
		margin: 0;
		padding: 0;
		border: 0;
		/* Lands below the sticky nav (and, on narrow screens, the progress bar). */
		scroll-margin-top: 89px;
	}

	.form-section:focus {
		outline: none;
	}

	legend {
		margin-bottom: 22px;
		padding: 0;
	}

	h2 {
		font-size: var(--text-xl);
		font-weight: 500;
		line-height: var(--leading-heading);
		color: var(--ink);
	}

	.intro {
		margin-top: -8px;
		font-size: 15px;
		line-height: var(--leading-normal);
		color: var(--muted);
	}

	@media (max-width: 899px) {
		.form-section {
			scroll-margin-top: 140px;
		}
	}
</style>
