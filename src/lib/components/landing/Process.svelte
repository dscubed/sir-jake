<script lang="ts">
	import { landing } from '#lib/config/landing.ts';
	import { recruitment } from '#lib/config/recruitment.ts';
	import { formatMelbourne } from '#lib/domain/window.ts';

	const { process } = landing;
	const opens = formatMelbourne(recruitment.opensAt);

	// Dates come from the config, so they update when the directors confirm them.
	const steps = [
		{ n: '01', title: 'Application', when: `Opens ${opens}`, body: process.application },
		{
			n: '02',
			title: 'Group interview',
			when: recruitment.interviews.groupDate,
			body: process.group
		},
		{
			n: '03',
			title: 'Individual interview',
			when: recruitment.interviews.individualDate,
			body: process.individual
		},
		{ n: '→', title: 'Offer', when: process.offer.when, body: process.offer.body, final: true }
	];
</script>

<section id="process" aria-labelledby="process-title">
	<div class="section stack">
		<div class="intro">
			<span class="eyebrow">{process.eyebrow}</span>
			<h2 id="process-title" class="section-title">{process.title}</h2>
		</div>
		<ol class="steps">
			{#each steps as step (step.title)}
				<li>
					<div class="marker" aria-hidden="true">
						<span class="dot" class:final={step.final}>{step.n}</span>
						<span class="line"></span>
					</div>
					<h3>{step.title}</h3>
					<p class="when">{step.when}</p>
					<p class="body">{step.body}</p>
				</li>
			{/each}
		</ol>
	</div>
</section>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		gap: 40px;
	}

	.intro {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.steps {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 0 24px 28px 0;
	}

	.marker {
		display: flex;
		align-items: center;
	}

	.dot {
		flex: none;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		font-size: var(--text-xs);
		font-weight: 500;
		color: #ffffff;
	}

	.dot.final {
		background: var(--blue);
		border-color: var(--blue);
	}

	.line {
		flex: 1;
		height: 1px;
		margin-left: 10px;
		background: rgba(255, 255, 255, 0.14);
	}

	h3 {
		margin-top: 4px;
		font-size: var(--text-lg);
		font-weight: 500;
		color: var(--text-on-dark);
	}

	.when {
		font-size: var(--text-sm);
		color: var(--blue-text-dark);
	}

	.body {
		color: var(--muted-on-dark);
		text-wrap: pretty;
	}
</style>
