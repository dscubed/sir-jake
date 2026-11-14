<script lang="ts">
	import logoBlue from '#lib/assets/brand/logo-blue.png';
	import discordIcon from '#lib/assets/brand/discord.png';
	import { site } from '#lib/config/site.ts';

	interface Props {
		/** `dark` on the landing page, `navy` under the white application page. */
		variant?: 'dark' | 'navy';
	}

	let { variant = 'dark' }: Props = $props();
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- the only link is the external Discord invite. -->
<footer class="site-footer {variant}">
	<div class="bar">
		<div class="brand">
			<img src={logoBlue} alt="" width="24" height="28" />
			<span class="wordmark"><span class="ds">DS</span>CUBED</span>
		</div>
		<address>{site.address}</address>
		<a class="discord" href={site.discordUrl} target="_blank" rel="noopener noreferrer">
			<img src={discordIcon} alt="" width="17" height="13" />
			Join our Discord
			<span class="visually-hidden">(opens in a new tab)</span>
		</a>
	</div>
</footer>

<style>
	.site-footer {
		--footer-text: var(--muted-on-dark);
		background: var(--bg-dark);
		border-top: 1px solid var(--divider-on-dark-faint);
	}

	.site-footer.navy {
		--footer-text: var(--text-on-dark-2);
		background: var(--navy);
		border-top: 0;
	}

	.bar {
		max-width: var(--nav-width);
		margin: 0 auto;
		padding: 32px var(--nav-gutter);
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.brand img {
		height: 28px;
		width: auto;
	}

	.wordmark {
		font-size: 17px;
		font-weight: 700;
		letter-spacing: 0.02em;
		color: #ffffff;
	}

	.ds {
		color: var(--blue);
	}

	address {
		font-size: var(--text-xs);
		font-style: normal;
		line-height: 1.5;
		color: var(--footer-text);
	}

	.discord {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		font-size: var(--text-xs);
		color: var(--footer-text);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.discord img {
		height: 13px;
		width: auto;
	}

	.discord:hover {
		color: #ffffff;
	}
</style>
