<script>
	import ContentPage from '$lib/components/ContentPage.svelte';
	import Lede from '$lib/components/Lede.svelte';
	import currentPageData from '$content/page/styleguide.json';
</script>

<ContentPage { currentPageData }>
	<Lede
		text="This page contains tests for adjusting the CSS of basic elements and components of this site project."
	/>
	<div class="rich-text">
		(rich text demo for basic styles)
		<h1>Title 1 Handgloves</h1>
		<p>A paragraph of text to test the spacing.</p>
		<p>And another paragraph, a bit longer. Suspendisse vel ad in suspendisse enim leo pharetra tincidunt sagittis facilisis dis pulvinar magna ultrices a eget adipiscing a vestibulum ut himenaeos at urna dui nullam sem sagittis adipiscing.</p>
		<h2>Title 2 Quick Brown Fox</h2>
		<p>Porttitor urna tincidunt in nulla dis at faucibus eleifend a hendrerit a montes parturient dictumst in a parturient a bibendum consectetur a. Ad inceptos duis taciti a adipiscing dictum fames sit dapibus iaculis a pulvinar lacinia suspendisse scelerisque magna. Tristique donec parturient per euismod adipiscing mollis in erat a vestibulum id condimentum felis at at rhoncus bibendum sed nec blandit metus scelerisque parturient massa malesuada morbi a montes.</p>
		<h3>Title 3 Jumps Over the Lazy Dog</h3>
		<p>A parturient consectetur erat hac volutpat eleifend congue parturient eget ullamcorper quisque condimentum commodo sit a hac tempor conubia in etiam molestie a adipiscing lobortis vestibulum vestibulum. Cras cras potenti pretium diam quis luctus a vivamus maecenas condimentum vehicula lacinia ad a a adipiscing vulputate adipiscing imperdiet varius.</p>
		<h4>Title 4 is Rarely Used</h4>
		<p>Condimentum nostra nostra conubia semper mus penatibus ut suspendisse a urna sodales risus a vestibulum senectus platea facilisis ornare aliquet ornare. A a arcu libero cum hac quam ultrices duis sit class himenaeos consequat curabitur at imperdiet justo a condimentum imperdiet adipiscing aenean eu.</p>
		<h5>Title 5 is Rarely Used</h5>
		<p>A condimentum fermentum pharetra id tincidunt pulvinar id euismod ipsum a urna potenti inceptos consectetur tincidunt condimentum a. Ut parturient molestie quisque a placerat nisl leo penatibus suspendisse sit lacinia facilisis sagittis mus curabitur penatibus ipsum.</p>
		<h6>Title 6 is Rarely Used</h6>
		<p>A in quam feugiat per a scelerisque sociis himenaeos praesent dolor duis venenatis natoque porta a ut nec elementum leo facilisis consectetur aliquet arcu non a. Suspendisse ut platea inceptos per suspendisse suspendisse a nisi vulputate lorem a consectetur placerat ut quam gravida a per lectus arcu ullamcorper a lacus condimentum a non ligula integer.</p>
		<ul>
			<li>Lorem ipsum dolor sit amet</li>
			<li>Consectetur adipiscing elit</li>
			<li>Integer molestie lorem at massa</li>
			<li>Facilisis in pretium nisl aliquet</li>
			<li>
				Nulla volutpat aliquam velit
				<ul>
					<li>Phasellus iaculis neque</li>
					<li>Purus sodales ultricies</li>
					<li>Vestibulum laoreet porttitor sem</li>
					<li>Ac tristique libero volutpat at</li>
				</ul>
			</li>
			<li>Faucibus porta lacus fringilla vel</li>
			<li>Aenean sit amet erat nunc</li>
			<li>Eget porttitor lorem</li>
		</ul>
		<ol>
			<li>Lorem ipsum dolor sit amet</li>
			<li>Consectetur adipiscing elit</li>
			<li>Integer molestie lorem at massa</li>
			<li>Facilisis in pretium nisl aliquet</li>
			<li>Nulla volutpat aliquam velit</li>
			<li>Faucibus porta lacus fringilla vel</li>
			<li>Aenean sit amet erat nunc</li>
			<li>Eget porttitor lorem</li>
		</ol>
		<table>
			<caption>This is an example table, and this is its caption to describe the contents.</caption>
			<thead>
				<tr>
					<th>Table heading</th>
					<th>Table heading</th>
					<th>Table heading</th>
					<th>Table heading</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Table cell</td>
					<td>Table cell</td>
					<td>Table cell</td>
					<td>Table cell</td>
				</tr>
				<tr>
					<td>Table cell</td>
					<td>Table cell</td>
					<td>Table cell</td>
					<td>Table cell</td>
				</tr>
				<tr>
					<td>Table cell</td>
					<td>Table cell</td>
					<td>Table cell</td>
					<td>Table cell</td>
				</tr>
			</tbody>
		</table>
		<blockquote>
			<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>
			<footer>Someone famous in <cite title="Source Title">Source Title</cite></footer>
		</blockquote>
		<address>
			<strong>Twitter, Inc.</strong>
			<br />1355 Market St, Suite 900
			<br />San Francisco, CA 94103
			<br />
			<abbr title="Phone">P:</abbr> (123) 456-7890
		</address>
		<address>
			<strong>Full Name</strong>
			<br />
			<a href="mailto:first.last@example.com">first.last@example.com</a>
		</address>
		<p>You can use the mark tag to <mark>highlight</mark> text.</p><p><del>This line of text is meant to be treated as deleted text.</del></p>
		<p><s>This line of text is meant to be treated as no longer accurate.</s></p>
		<p><ins>This line of text is meant to be treated as an addition to the document.</ins></p>
		<p><u>This line of text will render as underlined</u></p>
		<p><small>This line of text is meant to be treated as fine print.</small></p>
		<p><strong>This line rendered as bold text.</strong></p>
		<p><em>This line rendered as italicized text.</em></p>
	</div>
</ContentPage>
