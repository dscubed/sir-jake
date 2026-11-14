<script lang="ts">
	import { landing } from '#lib/config/landing.ts';

	const { about } = landing;
</script>

<section id="about" aria-labelledby="about-title">
	<div class="section grid">
		<p class="words">
			{#each about.words as word, i (word)}
				<span class:white={i % 2 === 1}>{word}</span>
			{/each}
		</p>
		<div class="text">
			<h2 id="about-title" class="eyebrow">{about.eyebrow}</h2>
			<p class="lead">{about.lead}</p>
			<p class="body">{about.body}</p>
		</div>
	</div>
</section>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
		gap: 32px 72px;
		align-items: center;
	}

	.words {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: clamp(32px, 3.6vw, 44px);
		font-weight: 700;
		line-height: 1.1;
		letter-spacing: 0.01em;
		/* Uppercased in CSS so screen readers say the words, not letters. */
		text-transform: uppercase;
		color: var(--blue);
	}

	.words .white {
		color: #ffffff;
	}

	.text {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.lead {
		font-size: var(--text-lg);
		line-height: var(--leading-relaxed);
		color: var(--text-on-dark);
		text-wrap: pretty;
	}

	.body {
		line-height: var(--leading-relaxed);
		color: var(--muted-on-dark);
		text-wrap: pretty;
	}
</style>
