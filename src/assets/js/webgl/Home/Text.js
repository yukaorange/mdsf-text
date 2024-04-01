import GSAP from 'gsap'

import {
  MSDFTextGeometry,
  MSDFTextMaterial,
  uniforms
} from 'three-msdf-text-utils'

import * as THREE from 'three'

import vertex from '@js/shaders/vertex.glsl'
import fragment from '@js/shaders/fragment.glsl'

export default class Text {
  constructor({ sizes, device }) {
    this.sizes = sizes

    this.device = device

    this.createTexture()

    this.createFont()

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

  createGeometry() {
    this.geometry = new MSDFTextGeometry({
      text: 'TRANSFORM',
      font: this.font.data,
      letterSpacing: 2,
      lineHeight: 1
    })

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
            value: new THREE.Color('#EEC923')
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

  setPosition(index) {
    this.textBounds = this.geometry.computeBoundingBox()

    this.textWidth = this.textBounds.max.x - this.textBounds.min.x

    this.textHeight = this.textBounds.max.y - this.textBounds.min.y

    let coefficient
    if (this.device === 'sp') {
      coefficient = 0.03
    } else if (this.device == 'pc') {
      coefficient = 0.02
    }

    let normalize = this.sizes.width / 6.15

    const standardScale = coefficient * normalize //When window.innerWidth is 1366 , this.sizes.width is 6.15

    let scaleX
    let scaleY

    if (this.device === 'sp') {
      scaleX = standardScale
      scaleY = -standardScale
    } else if (this.device === 'pc') {
      scaleX = standardScale * 0.8
      scaleY = -standardScale * 1.5
    }

    this.mesh.scale.set(scaleX, scaleY, 1)

    const toCenterX = (this.textWidth / 2.0) * scaleX
    const toCenterY = (-this.textHeight / 2) * standardScale

    let devideAmount

    let space

    if (this.device === 'sp') {
      devideAmount = 8 / normalize
      space = 0.8
    } else if (this.device === 'pc') {
      devideAmount = 4 / normalize
      space = 0.4
    }

    let localIndex = index - 4 //(-4 -> 4)

    if (localIndex < 0) {
      const spaceIndex = localIndex * localIndex * space

      this.mesh.rotation.z = Math.PI / 2

      this.mesh.rotation.y = Math.PI / 2 - Math.abs(localIndex / 8)

      this.mesh.position.x = toCenterY + (this.textHeight * scaleX) / 2

      this.mesh.position.x -= spaceIndex / devideAmount

      this.mesh.position.y = -toCenterX

      this.mesh.position.z = localIndex / devideAmount
    } else if (localIndex > 0) {
      const spaceIndex = localIndex * localIndex * space

      this.mesh.rotation.z = -Math.PI / 2
      this.mesh.rotation.y =
        -Math.PI / 2 + Math.abs(localIndex / 8 - Math.PI * 0)

      this.mesh.position.x = toCenterY + (this.textHeight * scaleX) / 2

      this.mesh.position.x += spaceIndex / devideAmount

      this.mesh.position.y = toCenterX

      this.mesh.position.z = -localIndex / devideAmount
    }
    if (localIndex === 0) {
      this.mesh.visible = false
    }

    this.standardRotation = this.mesh.rotation.y
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
  onResize(value, index) {
    this.calculateBounds(value)

    this.setPosition(index)

    this.mesh.material.uniforms.uResolution.value = new THREE.Vector2(
      window.innerWidth,
      window.innerHeight
    )
  }

  /**
   * update
   */

  updateScale() {}

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

    if (this.mesh) {
      const mouseCoord = (mouse.current.x / window.innerWidth) * 2 - 1

      const addtionalRadius = (mouseCoord * Math.PI) / 16

      this.mesh.rotation.y = this.standardRotation + addtionalRadius
    }
  }
}
