import GSAP from 'gsap'

import {
  MSDFTextGeometry,
  MSDFTextMaterial,
  uniforms
} from 'three-msdf-text-utils'

import * as THREE from 'three'

import vertex from '@js/shaders/vertex.glsl'
import fragment from '@js/shaders/fragment.glsl'

export default class Plane {
  constructor({ sizes, device }) {
    this.sizes = sizes

    this.device = device

    this.createTexture()

    this.createFont()

    this.createTextBox()

    this.createGeometry()

    this.createMaterial()

    this.createMesh()

    this.calculateBounds({
      sizes: this.sizes,
      device: this.device
    })
  }

  createTexture() {
    this.fontTexture = window.TEXTURES['1']
    this.noiseTexture = window.TEXTURES['2']
  }

  createFont() {
    this.font = window.FONT
  }

  createTextBox() {
    this.textBox = new THREE.Group()
  }

  createGeometry() {
    this.geometry = new MSDFTextGeometry({
      text: 'TRANSFORM',
      font: this.font.data,
      letterSpacing: 2,
      lineHeight: 1.5
    })

    console.log(this.geometry)

    this.textBounds = this.geometry.computeBoundingBox()

    this.textWidth = this.textBounds.max.x - this.textBounds.min.x

    this.textHeight = this.textBounds.max.y - this.textBounds.min.y

    this.textAspect = this.textWidth / this.textHeight
  }

  createMaterial() {
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      defines: {
        IS_SMALL: false
      },
      extensions: {
        derivatives: true
      },
      uniforms: {
        // Common
        ...uniforms.common,

        // Rendering
        ...uniforms.rendering,

        // Strokes
        ...uniforms.strokes,
        ...{
          uStrokeColor: {
            value: new THREE.Color(0x00ff00)
          },
          uProgress1: {
            value: 0
          },
          uProgress2: {
            value: 0
          },
          uProgress3: {
            value: 0
          },
          uProgress4: {
            value: 0
          },
          uTime: {
            value: 0
          },
          uTextAspect: {
            value: this.textAspect
          },
          uNoiseTexture: {
            value: this.noiseTexture
          },
          uMyColor: {
            value: new THREE.Color('#12d61c')
          },
          uMouse: {
            value: new THREE.Vector2(0, 0)
          },
          uResolution: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight)
          }
        }
      },
      vertexShader: vertex,
      fragmentShader: fragment
    })

    this.material.uniforms.uMap = { value: this.fontTexture }
  }

  createMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
  }

  calculateBounds({ sizes, device }) {
    this.sizes = sizes

    this.device = device

    this.updateScale(this.device)

    this.updateX()

    this.updateY()
  }

  setPosition() {
    this.textBounds = this.geometry.computeBoundingBox()

    this.textWidth = this.textBounds.max.x - this.textBounds.min.x

    this.textHeight = this.textBounds.max.y - this.textBounds.min.y

    this.textAspect = this.textWidth / this.textHeight

    let coefficient
    if (this.device === 'sp') {
      coefficient = 0.018
    } else if (this.device == 'pc') {
      coefficient = 0.018
    }

    this.mesh.rotation.z = -Math.PI / 2
    this.mesh.rotation.y = Math.PI / 4

    const scale = (coefficient * this.sizes.width) / 6.15 //When window.innerWidth is 1366 , this.sizes.width is 6.15

    this.mesh.scale.set(scale, -scale, scale)

    // this.mesh.rotation.z = -Math.PI/4

    let standardPosX = -this.sizes.width / 2.0

    let standardPosY = this.sizes.height / 2.0 - this.textHeight * scale

    let marginLeft = (this.sizes.width / 60.0) * 2.0

    let moveToCenter =
      -this.sizes.height / 2.0 + (this.textHeight * scale) / 2.0

    this.mesh.position.x = standardPosX + marginLeft

    // this.mesh.position.y = standardPosY + moveToCenter
    this.mesh.position.y = standardPosY
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

    this.setPosition()

    this.mesh.material.uniforms.uResolution.value = new THREE.Vector2(
      window.innerWidth,
      window.innerHeight
    )
  }

  /**
   * update
   */

  updateScale() {
    // console.log('plane device : ', this.device)
    // if (this.device === 'sp') {
    //   this.mesh.scale.x = this.sizes.width / 2
    //   this.mesh.scale.y = this.sizes.width / 2
    // } else {
    //   this.mesh.scale.x = this.sizes.height / 2
    //   this.mesh.scale.y = this.sizes.height / 2
    // }
  }

  updateX(x = 0) {}

  updateY(y = 0) {}

  update({ scroll, time, mouse, params }) {
    // this.updateX(scroll.x)

    // this.updateY(scroll.y)

    this.material.uniforms.uProgress1.value = params.progress1
    this.material.uniforms.uProgress2.value = params.progress2
    this.material.uniforms.uProgress3.value = params.progress3
    this.material.uniforms.uProgress4.value = params.progress4

    this.material.uniforms.uTime.value = time.current

    this.material.uniforms.uMouse.value = new THREE.Vector2(
      mouse.current.x / window.innerWidth,
      mouse.current.y / window.innerHeight
    )
  }
}
