<script lang="ts">
	import { resolve } from '$app/paths';
	import SelectField from '#lib/components/form/SelectField.svelte';
	import type { ApplicationForm } from '#lib/apply/form.svelte.ts';
	import { recruitment } from '#lib/config/recruitment.ts';
	import FormSection from './FormSection.svelte';

	let { form }: { form: ApplicationForm } = $props();

	const roles = recruitment.roles.map((r) => ({ value: r.id, label: r.name }));
	// The second list hides the team chosen first, so the same team can't be picked twice (FR3).
	const secondRoles = $derived(roles.filter((r) => r.value !== form.values.firstPreference));
</script>

<FormSection id="roles" title="Role preferences">
	{#snippet intro()}
		Choose two different teams. Not sure? Read about each team on the
		<a href="{resolve('/')}#teams">recruitment page</a>.
	{/snippet}
	<div class="pair">
		<SelectField
			name="firstPreference"
			label="First preference"
			placeholder="Select a team"
			required
			options={roles}
			bind:value={() => form.values.firstPreference, (id) => form.setFirstPreference(id)}
			error={form.shownErrors.firstPreference}
		/>
		<SelectField
			name="secondPreference"
			label="Second preference"
			placeholder="Select a team"
			required
			options={secondRoles}
			bind:value={form.values.secondPreference}
			error={form.shownErrors.secondPreference}
		/>
	</div>
</FormSection>

<style>
	.pair {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
		gap: 22px;
	}
</style>
