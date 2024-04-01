import map from 'lodash/map'
import GSAP from 'gsap'

import * as THREE from 'three'

import Textbox from './Textbox'

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

    this.createTextbox()

    this.scene.add(this.textbox.group)

    this.onResize({
      sizes: this.sizes,
      device: this.device
    })

    this.show()
  }

  createTextbox() {
    this.textbox = new Textbox({
      sizes: this.sizes,
      device: this.device
    })
  }

  /**
   * animate
   */

  show() {
    this.textbox.show()
  }

  hide() {
    this.textbox.hide()
  }

  /**
   * events
   */
  onResize(values) {
    if (this.textbox) {
      this.textbox.onResize(values)
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
    if (!this.textbox) return

    this.mouse.current.x +=
      (this.mouse.target.x - this.mouse.current.x) * this.mouse.lerp

    this.mouse.current.y +=
      (this.mouse.target.y - this.mouse.current.y) * this.mouse.lerp

    this.textbox.update({
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
    this.scene.remove(this.textbox.mesh)
  }
}
