<script lang="ts">
	interface Props {
		/** Matches the `aria-describedby` on the field this error belongs to. */
		id: string;
		error?: string | string[];
	}

	let { id, error }: Props = $props();

	const messages = $derived(error === undefined ? [] : Array.isArray(error) ? error : [error]);
</script>

{#if messages.length}
	<p {id} class="field-error">{messages.join(' ')}</p>
{/if}

<style>
	.field-error {
		font-size: var(--text-sm);
		color: var(--error);
	}
</style>
