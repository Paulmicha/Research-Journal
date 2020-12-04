<script>
	import { Layer } from 'svelte-canvas';
	import { spring } from 'svelte/motion';

	export let x = 0;
	export let y = 0;
	export let scale = 0;
	export let fill = "black";
	export let stroke = null;
	export let strokeWidth = 1;

	const x_springed = spring(parseFloat(x), { stiffness: 0.15, damping: 0.3 });
	const y_springed = spring(parseFloat(y), { stiffness: 0.15, damping: 0.3 });
	const scale_springed = spring(parseFloat(scale), { stiffness: 0.15, damping: 0.3 });

	$: x_springed.set(parseFloat(x));
	$: y_springed.set(parseFloat(y));
	$: scale_springed.set(parseFloat(scale));

	$: render = ({ context }) => {
		context.fillStyle = fill;
		context.beginPath();
		context.arc($x_springed, $y_springed, $scale_springed, 0, 2 * Math.PI);
		context.fill();

		if (stroke) {
			context.strokeStyle = stroke;
			context.lineWidth = strokeWidth;
			context.beginPath();
			context.arc($x_springed, $y_springed, $scale_springed + strokeWidth / 2, 0, 2 * Math.PI);
			context.stroke();
		}
	};
</script>

<Layer {render} priority={stroke && 1} />
