<!-- <script context="module">
	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load({ fetch }) {
		const url = `/ecometrics.json`;
		const res = await fetch(url);

		if (res.ok) {
			return {
				props: {
					ecometricsData: await res.json()
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}
</script> -->

<script>
	import ContentPage from '$lib/components/ContentPage.svelte';
	import EcoMetrics from '$lib/components/ecometrics/EcoMetrics.svelte';
	import currentPageData from '$content/page/ecometrics.json';
	// export let ecometricsData;
</script>

<ContentPage { currentPageData }>
	<!-- <EcoMetrics { ecometricsData } /> -->
	<EcoMetrics />
</ContentPage>
