/**
 * Base class of all graphical representations to be displayed in a scene.
 *
 * Contains 2D projection calculations (x, y) from 3D coordinates.
 */
export default class SceneItem {
	constructor(o) {
		const { x, y, z, w, h, r, type, scene } = o;
		this.type = type;
		this.scene = scene;

		// Provide random coordinates as fallback defaults.
		// this.x = x || (Math.random() - 0.5) * this.scene.width;
		// this.y = y || (Math.random() - 0.5) * this.scene.height;
		this.x = x || Math.random() * this.scene.width;
		this.y = y || Math.random() * this.scene.height;
		this.z = z || Math.random() * this.scene.width;

		this.r = r || 10;
		this.w = w || this.r * 2;
		this.h = h || this.r * 2;

		this.scaleProjected = 0;
		this.xProjected = 0;
		this.yProjected = 0;

		// TODO (wip) bounding rect or circle to facilitate collision detection ?
		// this.boundingRect = []
	}

	project() {
		this.scaleProjected = this.scene.perspective / (this.scene.perspective + this.z);
		this.xProjected = (this.x * this.scaleProjected) + this.scene.projectionCenterX;
		this.yProjected = (this.y * this.scaleProjected) + this.scene.projectionCenterY;
	}

	position(o) {
		const keysToUpdate = Object.keys(o);

		keysToUpdate.forEach(key => {
			// this[key] = o[key];
			switch (key) {
				case 'x':
					this.x = o.x;
					break;
				case 'y':
					this.y = o.y;
					break;
				case 'z':
					this.z = o.z;
					break;
			}
		});

		// if (['x', 'y', 'z', 'w', 'h', 'r'].some(item => keysToUpdate.includes(item))) {
		this.project();
		// }

		return {
			// x: this.xProjected - this.scene.width / 2,
			// y: this.yProjected - this.scene.height / 2,
			// x: (this.xProjected - this.w / 2).toFixed(3),
			// y: (this.yProjected - this.h / 2).toFixed(3),
			// z: this.z.toFixed(3)
			x: (this.xProjected - this.w / 2),
			y: (this.yProjected - this.h / 2),
			z: this.z
		};
	}
}
