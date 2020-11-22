import SceneItemsIterator from './SceneItemsIterator.js'

/**
 * Composite collection representing a scene.
 *
 * Contains items meant to be displayed in a 2D projection.
 */
export default class Scene {
  constructor(w, h, p) {
		this.items = []
		this.init(w, h, p)
	}

  createIterator () {
    return new SceneItemsIterator(this)
  }

	init(w, h, p) {
		this.width = w || 100
		this.height = h || 100
		this.perspectiveWidthRatio = p || 0.8
		this.perspective = this.width * this.perspectiveWidthRatio
		this.projectionCenterX = this.width / 2
		this.projectionCenterX = this.height / 2
	}

  add (item) {
    this.items.push(item)
  }

  remove (item) {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i] === item) {
        this.items.splice(i, 1)
      }
    }
  }

  count () {
    return this.items.length
  }
}
