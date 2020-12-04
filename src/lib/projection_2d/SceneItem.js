/**
 * Base class of all graphical representations to be displayed in a scene.
 *
 * Contains 2D projection calculations (x, y) from 3D coordinates.
 */
export default class SceneItem {
	constructor(o) {
		const { x, y, z, w, h, r, scene, render } = o;
		this.scene = scene;
		this.render = render;

		// Provide random coordinates as fallback defaults.
		this.x = x || (Math.random() - 0.5) * scene.offsetWidth;
		this.y = y || (Math.random() - 0.5) * scene.offsetHeight;
		this.z = z || Math.random() * scene.offsetWidth;
		this.radius = r || 10;
		this.width = w || this.radius * 2;
		this.height = h || this.radius * 2;

		this.xProjected = 0;
		this.yProjected = 0;
		this.scaleProjected = 0;

		// this.boundingRect = []
	}

	project() {
		this.scaleProjected = scene.perspective / (scene.perspective + this.z);
		this.xProjected = (this.x * this.scaleProjected) + scene.projectionCenterX;
		this.yProjected = (this.y * this.scaleProjected) + scene.projectionCenterY;
	}

	draw() {
		this.project();

		// ctx.globalAlpha = Math.abs(1 - this.z / width);
		// ctx.fillRect(this.xProjected - this.radius, this.yProjected - this.radius, this.radius * 2 * this.scaleProjected, this.radius * 2 * this.scaleProjected);

		this.render(this);
	}
}
