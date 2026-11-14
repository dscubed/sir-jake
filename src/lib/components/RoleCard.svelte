<script lang="ts">
	import type { Role } from '#lib/config/types.ts';

	/** One team on the landing page (step 3.9). Plain text with a top rule, as in the design. */
	let { role }: { role: Role } = $props();
</script>

<article class="role">
	<h3>{role.name}</h3>
	<p>{role.description}</p>
</article>

<style>
	.role {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding-top: 24px;
		border-top: 1px solid var(--divider-on-dark);
	}

	h3 {
		font-size: var(--text-xl);
		font-weight: 500;
		line-height: 1.3;
		color: #ffffff;
	}

	p {
		max-width: 60ch;
		line-height: var(--leading-relaxed);
		color: var(--text-on-dark-2);
		text-wrap: pretty;
	}
</style>
