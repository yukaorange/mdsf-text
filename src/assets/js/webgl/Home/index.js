import map from 'lodash/map'
import GSAP from 'gsap'

import * as THREE from 'three'

import Plane from './Plane'

export default class Home {
  constructor({ scene, sizes, device }) {
    this.scene = scene

    this.sizes = sizes

    this.device = device

    this.x = {
      current: 0,
      target: 0,
      lerp: 0.1
    }

    this.y = {
      current: 0,
      target: 0,
      lerp: 0.1
    }

    this.scrollCurrent = {
      //necessary to memolize touchstart position.
      x: 0,
      y: 0
    }

    this.scroll = {
      x: 0,
      y: 0
    }

    this.speed = {
      current: 0,
      target: 0,
      lerp: 0.1
    }

    this.mouse = {
      current: {
        x: 0,
        y: 0
      },
      target: {
        x: 0,
        y: 0
      },
      lerp: 0.1
    }

    this.createPlane()

    this.scene.add(this.plane.mesh)

    this.onResize({
      sizes: this.sizes,
      device: this.device
    })

    this.show()
  }

  createPlane() {
    this.plane = new Plane({
      sizes: this.sizes,
      device: this.device
    })
  }

  /**
   * animate
   */

  show() {
    this.plane.show()
  }

  hide() {
    this.plane.hide()
  }

  /**
   * events
   */
  onResize(values) {
    if (this.plane) {
      this.plane.onResize(values)
    }
  }

  onTouchDown({ x, y }) {
    this.mouse.target.x = x.start
    this.mouse.target.y = y.start
  }

  onTouchMove({ x, y }) {
    this.mouse.target.x = x.end
    this.mouse.target.y = y.end
  }

  onTouchUp({ x, y }) {
    this.speed.target = 0
  }

  onWheel({ pixelX, pixelY }) {
    this.x.target -= pixelX
    this.y.target -= pixelY
  }

  onMouseMove({ x, y }) {
    this.mouse.target.x = x
    this.mouse.target.y = y
  }

  /**
   * update
   */
  update({ scroll, time, params }) {
    if (!this.plane) return

    this.mouse.current.x +=
      (this.mouse.target.x - this.mouse.current.x) * this.mouse.lerp

    this.mouse.current.y +=
      (this.mouse.target.y - this.mouse.current.y) * this.mouse.lerp

    this.plane.update({
      scroll: scroll,
      time: time,
      mouse: this.mouse,
      params: params
    })
  }

  /**
   * destroy
   */
  destroy() {
    this.scene.remove(this.plane.mesh)
  }
}
