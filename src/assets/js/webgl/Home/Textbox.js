import GSAP from 'gsap'

import * as THREE from 'three'

import Text from './Text'

export default class Textbox {
  constructor({ sizes, device }) {
    this.sizes = sizes

    this.device = device

    this.createTextBox()

    this.createText()

    this.calculateBounds({
      sizes: this.sizes,
      device: this.device
    })
  }

  createTextBox() {
    this.group = new THREE.Group()

    this.groupArray = []
  }

  createText() {
    const count = 8
    for (let i = 0; i <= count; i++) {
      const text = new Text({
        sizes: this.sizes,
        device: this.device
      })

      this.group.add(text.mesh)

      this.groupArray.push(text)
    }
  }

  calculateBounds({ sizes, device }) {
    this.sizes = sizes

    this.device = device

    this.updateScale(this.device)

    this.updateX()

    this.updateY()
  }

  /**
   * Animations
   */
  show() {
    // GSAP.fromTo(
    //   this.mesh.material.uniforms.uAlpha,
    //   {
    //     value: 0
    //   },
    //   {
    //     value: 1
    //   }
    // )
  }

  hide() {
    // GSAP.to(this.mesh.material.uniforms.uAlpha, {
    //   value: 0
    // })
  }
  /**
   * events
   */
  onResize(value) {
    this.calculateBounds(value)

    this.groupArray.forEach((text, index) => {
      text.onResize(value, index)
    })
  }

  /**
   * update
   */

  updateScale() {}

  updateX(x = 0) {}

  updateY(y = 0) {}

  update({ scroll, time, mouse, params }) {
    this.groupArray.forEach((text, index) => {
      text.update({
        scroll,
        time,
        mouse,
        params
      })
    })
  }
}
