<script lang="ts">
	import type { Role } from '#lib/config/types.ts';

	let { role }: { role: Role } = $props();
</script>

<article class="role">
	<h3>{role.name} Officers</h3>
	<p class="description">{role.description}</p>
	<details>
		<summary>What we’re looking for</summary>
		<div class="details">
			<p class="intro">{role.lookingFor.intro}</p>
			<ul>
				{#each role.lookingFor.points as point (point)}
					<li>{point}</li>
				{/each}
			</ul>
		</div>
	</details>
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

	p,
	li {
		max-width: 60ch;
		line-height: var(--leading-relaxed);
		color: var(--text-on-dark-2);
		text-wrap: pretty;
	}

	summary {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 4px 0;
		font-weight: 500;
		color: #ffffff;
		cursor: pointer;
		list-style: none;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	/* A chevron that points down when closed and up when open. */
	summary::after {
		content: '';
		width: 7px;
		height: 7px;
		margin-top: -4px;
		border-right: 1.5px solid currentColor;
		border-bottom: 1.5px solid currentColor;
		transform: rotate(45deg);
		transition: transform 150ms ease;
	}

	details[open] summary::after {
		margin-top: 3px;
		transform: rotate(-135deg);
	}

	summary:hover {
		text-decoration: underline;
		text-underline-offset: 4px;
	}

	.details {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding-top: 8px;
	}

	.intro {
		font-weight: 600;
		color: var(--text-on-dark);
	}

	ul {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin: 0;
		padding-left: 1.25em;
	}
</style>
