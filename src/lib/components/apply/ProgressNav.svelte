<script lang="ts">
	import type { SectionId, SectionProgress } from '#lib/apply/progress.ts';

	interface Props {
		sections: SectionProgress[];
		doneCount: number;
		total: number;
		/** The section currently in view. */
		active: SectionId;
		saveNote: string;
		ongo: (id: SectionId) => void;
	}

	let { sections, doneCount, total, active, saveNote, ongo }: Props = $props();

	const activeLabel = $derived(sections.find((s) => s.id === active)?.label ?? sections[0].label);
	const percent = $derived(`${(doneCount / total) * 100}%`);
</script>

<!-- Wide screens (≥900px): sticky list beside the form. -->
<aside class="side" aria-label="Application sections">
	<div class="summary">
		<div class="row">
			<span class="heading">Your progress</span>
			<span class="count">{doneCount} of {total} done</span>
		</div>
		<div
			class="track"
			role="progressbar"
			aria-label="Sections complete"
			aria-valuemin={0}
			aria-valuemax={total}
			aria-valuenow={doneCount}
		>
			<div class="fill" style:width={percent}></div>
		</div>
	</div>
	<ol class="steps">
		{#each sections as section, i (section.id)}
			{@const current = section.id === active}
			<li>
				<button
					type="button"
					class="step"
					class:current
					aria-current={current ? 'step' : undefined}
					onclick={() => ongo(section.id)}
				>
					<span class="mark" class:done={section.done} class:current aria-hidden="true">
						{#if section.done}
							<svg viewBox="0 0 16 16" width="14" height="14"
								><path
									d="M3.5 8.5l3 3 6-7"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/></svg
							>
						{:else}
							{i + 1}
						{/if}
					</span>
					<span class="text">
						<span class="label">{section.label}</span>
						<span class="status {section.tone}">{section.status}</span>
					</span>
				</button>
			</li>
		{/each}
	</ol>
	<span class="save-note">{saveNote}</span>
</aside>

<!-- Narrow screens: compact sticky bar under the nav. -->
<div class="compact">
	<div class="row">
		<span class="heading">{activeLabel}</span>
		<span class="count">{doneCount} of {total} done</span>
	</div>
	<div class="segments">
		{#each sections as section (section.id)}
			<button
				type="button"
				class="segment"
				aria-label="{section.label}: {section.status}"
				aria-current={section.id === active ? 'step' : undefined}
				onclick={() => ongo(section.id)}
			>
				<span class:done={section.done} class:current={section.id === active}></span>
			</button>
		{/each}
	</div>
</div>

<style>
	.side {
		position: sticky;
		top: 89px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.summary {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 12px;
	}

	.heading {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--ink);
	}

	.count,
	.save-note {
		font-size: var(--text-xs);
		color: var(--ink-3);
	}

	.save-note {
		padding: 0 12px;
	}

	.track {
		height: 6px;
		overflow: hidden;
		border-radius: var(--radius-pill);
		background: var(--divider);
	}

	.fill {
		height: 100%;
		border-radius: var(--radius-pill);
		background: var(--blue);
		transition: width 0.3s var(--ease-out);
	}

	.steps {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.step {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		min-height: 56px;
		padding: 8px 12px;
		border: 0;
		border-radius: var(--radius-md);
		background: transparent;
		text-align: left;
		cursor: pointer;
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.step:hover {
		background: var(--hover-light);
	}

	.step.current {
		background: var(--blue-tint);
	}

	.mark {
		flex: none;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1.5px solid var(--border);
		border-radius: 50%;
		background: #ffffff;
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--ink-3);
	}

	.mark.current {
		border-color: var(--blue);
		color: var(--blue);
	}

	.mark.done {
		border-color: var(--blue);
		background: var(--blue);
		color: #ffffff;
	}

	.text {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.label {
		font-size: 15px;
		font-weight: 500;
		color: var(--ink);
	}

	.current .label {
		font-weight: 600;
	}

	.status {
		font-size: var(--text-xs);
		color: var(--ink-3);
	}

	.status.success {
		color: var(--success);
	}

	.status.error {
		color: var(--error);
	}

	.compact {
		display: none;
	}

	@media (max-width: 899px) {
		.side {
			display: none;
		}

		.compact {
			position: sticky;
			top: 57px;
			z-index: 5;
			display: flex;
			flex-direction: column;
			gap: 10px;
			margin: 0 calc(-1 * var(--section-gutter));
			padding: 12px var(--section-gutter);
			border-bottom: 1px solid var(--divider);
			background: rgba(255, 255, 255, 0.96);
			backdrop-filter: blur(8px);
		}

		/* Negative margins keep the handoff's 28px row while each segment is a 44px tap target. */
		.segments {
			display: grid;
			grid-template-columns: repeat(5, 1fr);
			gap: 6px;
			margin: -8px 0;
		}

		.segment {
			display: flex;
			align-items: center;
			height: 44px;
			padding: 0;
			border: 0;
			background: none;
			cursor: pointer;
		}

		.segment span {
			width: 100%;
			height: 6px;
			border-radius: var(--radius-pill);
			background: var(--divider);
			transition: background-color var(--duration-base) var(--ease-out);
		}

		.segment span.current {
			background: #93b8f0;
		}

		.segment span.done {
			background: var(--blue);
		}
	}
</style>
