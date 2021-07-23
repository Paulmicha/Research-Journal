<script>
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	export let model;
</script>

<Header {model}></Header>

<main>
	<slot></slot>
</main>

<Footer></Footer>
