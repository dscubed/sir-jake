<script lang="ts">
	import { resolve } from '$app/paths';
	import { landing } from '#lib/config/landing.ts';
	import type { DisplayStatus } from '#lib/domain/window.ts';

	interface Props {
		/** Open links to the form; otherwise it's a plain "Applications closed" label. */
		status: DisplayStatus;
		class?: string;
	}

	let { status, class: className = '' }: Props = $props();
</script>

{#if status === 'open'}
	<a class={className} href={resolve('/apply')}>{landing.cta.open.label}</a>
{:else}
	<!-- Drops the button variant (e.g. "light") so the label doesn't light up on hover like a link. -->
	<span class="pill-button closed">{landing.cta.closed}</span>
{/if}

<style>
	.closed {
		background: rgba(255, 255, 255, 0.12);
		color: var(--text-on-dark-2);
		cursor: default;
		user-select: none;
	}
</style>
