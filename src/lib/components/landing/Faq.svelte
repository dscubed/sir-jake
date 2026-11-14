<script lang="ts">
	import { landing } from '#lib/config/landing.ts';
	import { site } from '#lib/config/site.ts';

	const { faq } = landing;
</script>

<!--
	Native <details name="…"> gives a one-open-at-a-time accordion that works before JavaScript
	loads (the page is prerendered) and is keyboard and screen-reader accessible for free.
-->
<!-- eslint-disable svelte/no-navigation-without-resolve -- the only link is the external Discord invite. -->
<section id="faq" aria-labelledby="faq-title">
	<div class="section grid">
		<div class="intro">
			<span class="eyebrow">{faq.eyebrow}</span>
			<h2 id="faq-title" class="section-title">{faq.title}</h2>
			<p>
				Still unsure? Ask us on
				<a href={site.discordUrl} target="_blank" rel="noopener noreferrer"
					>Discord<span class="visually-hidden"> (opens in a new tab)</span></a
				>.
			</p>
		</div>
		<div class="items">
			{#each faq.items as item, i (item.q)}
				<details name="faq" open={i === 0}>
					<summary>
						<span>{item.q}</span>
						<span class="icon" aria-hidden="true">+</span>
					</summary>
					<p>{item.a}</p>
				</details>
			{/each}
		</div>
	</div>
</section>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
		gap: 32px 72px;
		align-items: start;
	}

	.intro {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.intro p {
		line-height: var(--leading-relaxed);
		color: var(--muted-on-dark);
	}

	.intro a {
		color: var(--blue-text-dark);
	}

	.intro a:hover {
		color: #ffffff;
	}

	.items {
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--divider-on-dark);
	}

	details {
		border-bottom: 1px solid var(--divider-on-dark);
	}

	summary {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 20px;
		min-height: 44px;
		padding: 18px 0;
		color: var(--text-on-dark);
		cursor: pointer;
		list-style: none;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	.icon {
		flex: none;
		font-size: 20px;
		font-weight: 300;
		line-height: 1;
		color: var(--muted-on-dark);
		transition: transform var(--duration-base) var(--ease-out);
	}

	details[open] .icon {
		transform: rotate(45deg);
	}

	details p {
		padding: 0 32px 20px 0;
		line-height: var(--leading-relaxed);
		color: var(--muted-on-dark);
		text-wrap: pretty;
	}
</style>
