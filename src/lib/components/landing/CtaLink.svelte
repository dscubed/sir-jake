<script lang="ts">
	import { resolve } from '$app/paths';
	import { site } from '#lib/config/site.ts';
	import type { DisplayStatus } from '#lib/domain/window.ts';

	interface Props {
		/** Open links to the form; upcoming and closed link to the Discord invite. */
		status: DisplayStatus;
		label: string;
		class?: string;
	}

	let { status, label, class: className = '' }: Props = $props();

	const external = $derived(status !== 'open');
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- the alternative to resolve('/apply') is the external Discord invite. -->
<a
	class={className}
	href={external ? site.discordUrl : resolve('/apply')}
	target={external ? '_blank' : undefined}
	rel={external ? 'noopener noreferrer' : undefined}
>
	{label}
	{#if external}<span class="visually-hidden">(opens in a new tab)</span>{/if}
</a>
