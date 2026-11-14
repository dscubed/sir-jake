<script lang="ts">
	import { recruitment } from '#lib/config/recruitment.ts';
	import { countInWords, landing } from '#lib/config/landing.ts';
	import RoleCard from './RoleCard.svelte';

	const { teams } = landing;
	// Adding a role to the config adds a card and updates the count, with no other change (step 3.9).
	const title = teams.title.replace('{count}', countInWords(recruitment.roles.length));
</script>

<section id="teams" aria-labelledby="teams-title">
	<div class="section stack">
		<div class="intro">
			<span class="eyebrow">{teams.eyebrow}</span>
			<h2 id="teams-title" class="section-title">{title}</h2>
			<p>{teams.body}</p>
		</div>
		<div class="grid">
			{#each recruitment.roles as role (role.id)}
				<RoleCard {role} />
			{/each}
		</div>
	</div>
</section>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		gap: 48px;
	}

	.intro {
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-width: 65ch;
	}

	/* The design uses a fixed 32px here, unlike the other section titles. */
	.intro .section-title {
		font-size: 32px;
	}

	.intro p {
		color: var(--muted-on-dark);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
		gap: 40px 72px;
	}
</style>
