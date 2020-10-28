/**
 * Base class of all graphical representations to be displayed in a scene.
 *
 * Contains 2D projection calculations (x, y) from 3D coordinates.
 */
export default class SceneItem {
	constructor(o) {
		const { x, y, z, radius, scene } = o;

		let PROJECTION_CENTER_X = width / 2;
		let PROJECTION_CENTER_Y = height / 2;
		let PERSPECTIVE = width * 0.8;

		// Provide random coordinates as fallback defaults.
		this.x = x || (Math.random() - 0.5) * scene.offsetWidth;
		this.y = y || (Math.random() - 0.5) * scene.offsetHeight;
		this.z = z || Math.random() * scene.offsetWidth;
		this.radius = radius || 10;

		this.xProjected = 0;
		this.yProjected = 0;
		this.scaleProjected = 0;
	}

	project() {
		this.scaleProjected = PERSPECTIVE / (PERSPECTIVE + this.z);
		this.xProjected = (this.x * this.scaleProjected) + PROJECTION_CENTER_X;
		this.yProjected = (this.y * this.scaleProjected) + PROJECTION_CENTER_Y;
	}

	draw() {
		this.project();
		ctx.globalAlpha = Math.abs(1 - this.z / width);
		ctx.fillRect(this.xProjected - this.radius, this.yProjected - this.radius, this.radius * 2 * this.scaleProjected, this.radius * 2 * this.scaleProjected);
	}
}
