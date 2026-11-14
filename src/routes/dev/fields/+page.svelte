<script lang="ts">
	import RadioGroup from '#lib/components/form/RadioGroup.svelte';
	import SelectField from '#lib/components/form/SelectField.svelte';
	import TextField from '#lib/components/form/TextField.svelte';
	import { recruitment } from '#lib/config/recruitment.ts';

	const roles = recruitment.roles.map((r) => ({ value: r.id, label: r.name }));
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];

	let name = $state('');
	let role = $state('');
	let available = $state('');
</script>

<svelte:head><title>Form fields (dev)</title></svelte:head>

<div class="content">
	<h1>Form fields</h1>
	<p>Dev-only preview of the form primitives in their normal, filled and error states.</p>

	<form onsubmit={(e) => e.preventDefault()} novalidate>
		<h2>Text field</h2>
		<TextField name="t1" label="Full name" required bind:value={name} />
		<p class="echo">Bound value: "{name}"</p>
		<TextField
			name="t2"
			type="email"
			label="Student email"
			helpText="Please use your university student email"
			required
			value="ada@student.unimelb.edu.au"
		/>
		<TextField
			name="t3"
			label="Degree"
			required
			value=""
			error="Required"
			helpText="For example, Bachelor of Science"
		/>
		<TextField name="t4" label="Preferred name" />

		<h2>Select field</h2>
		<SelectField name="s1" label="First preference" required options={roles} bind:value={role} />
		<p class="echo">Bound value: "{role}"</p>
		<SelectField
			name="s2"
			label="Expected graduation"
			required
			options={recruitment.graduationOptions}
			value="2028 Sem 2"
		/>
		<SelectField
			name="s3"
			label="Second preference"
			required
			options={roles}
			value="events"
			error={['Choose two different roles']}
		/>

		<h2>Radio group</h2>
		<RadioGroup
			name="r1"
			label="Are you available for the group interview?"
			helpText="Group interview: TBD"
			required
			inline
			options={yesNo}
			bind:value={available}
		/>
		<p class="echo">Bound value: "{available}"</p>
		<RadioGroup
			name="r2"
			label="Are you available for the individual interview?"
			required
			inline
			options={yesNo}
			value="no"
		/>
		<RadioGroup
			name="r3"
			label="Stacked, with an error"
			required
			options={yesNo}
			error="Choose yes or no"
		/>
	</form>
</div>

<style>
	h2 {
		margin-top: var(--space-7);
	}

	.echo {
		margin-top: calc(-1 * var(--space-3));
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}
</style>
