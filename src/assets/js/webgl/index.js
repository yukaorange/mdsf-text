import GSAP from 'gsap'
import { PerspectiveCamera, WebGLRenderer, Scene, Clock } from 'three'

import { Pane } from 'tweakpane'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import PostProcessPipeline from './class/PostProcessPipeline'

import Home from './Home'

export default class Canvas {
  constructor({ template, dom, device }) {
    this.template = template

    this.container = dom

    this.device = device

    this.x = {
      start: 0,
      end: 0
    }

    this.y = {
      start: 0,
      end: 0
    }

    this.time = {
      current: 0,
      previous: 0,
      delta: 0
    }

    this.createRenderer()

    this.createScene()

    this.createCamera()

    this.createPane()

    this.createControls()

    this.createClock()

    this.createPostProcessPipeline()

    this.onResize(this.device)
  }

  createRenderer() {
    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: true
    })

    this.renderer.setClearColor(0x111111, 1)

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))

    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.container.appendChild(this.renderer.domElement)
  }

  createScene() {
    this.scene = new Scene()
  }

  createCamera() {
    const fov = 45
    const aspect = window.innerWidth / window.innerHeight
    const near = 0.1
    const far = 1000

    this.camera = new PerspectiveCamera(fov, aspect, near, far)

    this.camera.position.z = 5
  }

  createPane() {
    // this.pane = new Pane()

    this.PARAMS = {
      progress1: 0,
      progress2: 0,
      progress3: 0,
      progress4: 0
    }

    // this.pane.addBinding(this.PARAMS, 'progress1', {
    //   min: 0,
    //   max: 1,
    //   step: 0.01
    // })

    // this.pane.addBinding(this.PARAMS, 'progress2', {
    //   min: 0,
    //   max: 1,
    //   step: 0.01
    // })

    // this.pane.addBinding(this.PARAMS, 'progress3', {
    //   min: 0,
    //   max: 1,
    //   step: 0.01
    // })

    // this.pane.addBinding(this.PARAMS, 'progress4', {
    //   min: 0,
    //   max: 1,
    //   step: 0.01
    // })
  }

  createControls() {
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement)
  }

  createClock() {
    this.clock = new Clock()
  }

  /**home */
  createHome() {
    this.home = new Home({
      scene: this.scene,
      sizes: this.sizes,
      device: this.device
    })
  }

  destroyHome() {
    this.home.destroy()
  }

  /**
   * events
   */

  onPreloaded() {
    this.onChangeEnd(this.template)
  }

  onChangeStart(template) {
    if (this.template !== template && template !== 'home') {
      this.home.hide()
    }

    this.template = template
  }

  onChangeEnd(template) {
    if (template == 'home') {
      this.createHome()
    } else {
      this.destroyHome()
    }

    this.progress()
  }

  onResize(device) {
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    const aspect = window.innerWidth / window.innerHeight

    const fov = this.camera.fov * (Math.PI / 180) // default camera.fov = 45deg. result fov is in radians. (1/4 PI rad)

    const height = 2 * Math.tan(fov / 2) * this.camera.position.z //z = 5 is setted at this.createCamera

    const width = height * aspect //To fit clip space to screen.

    this.sizes = {
      //Calclated viewport space sizes.
      height: height,
      width: width
    }

    const values = {
      sizes: this.sizes,
      device: device
    }

    if (this.home) {
      this.home.onResize(values)
    }

    if (this.postProcessPipeline) {
      this.postProcessPipeline.resize(values)
    }

    this.camera.aspect = aspect

    this.camera.updateProjectionMatrix()
  }

  onTouchDown(event) {
    this.isDown = true

    this.x.start = event.touches ? event.touches[0].clientX : event.clientX
    this.y.start = event.touches ? event.touches[0].clientY : event.clientY

    const values = {
      x: this.x,
      y: this.y
    }

    if (this.home) {
      this.home.onTouchDown(values)
    }
  }

  onTouchMove(event) {
    if (!this.isDown) return

    const x = event.touches ? event.touches[0].clientX : event.clientX
    const y = event.touches ? event.touches[0].clientY : event.clientY

    this.x.end = x
    this.y.end = y

    const values = {
      x: this.x,
      y: this.y
    }

    if (this.home) {
      this.home.onTouchMove(values)
    }
  }

  onTouchUp(event) {
    this.isDown = false

    const x = event.changedTouches
      ? event.changedTouches[0].clientX
      : event.clientX
    const y = event.changedTouches
      ? event.changedTouches[0].clientY
      : event.clientY

    this.x.end = x
    this.y.end = y

    const values = {
      x: this.x,
      y: this.y
    }

    if (this.home) {
      this.home.onTouchUp(values)
    }
  }

  onWheel({ pixelX, pixelY }) {
    if (this.collections) {
      this.collections.onWheel({ pixelX, pixelY })
    }

    if (this.home) {
      this.home.onWheel({ pixelX, pixelY })
    }
  }

  onMouseMove(event) {
    if (this.home) {
      this.home.onMouseMove(event)
    }
  }

  /**
   * progress
   */
  progress() {
    const timeline = GSAP.timeline()

    const durationAmount = 1.5
    const stagger = 0.2

    timeline.to(this.PARAMS, {
      delay: 0.4,
      progress1: 1,
      duration: durationAmount
    })
    timeline.to(
      this.PARAMS,
      {
        delay: 0.4,
        progress2: 1,
        duration: durationAmount
      },
      stagger
    )
    timeline.to(
      this.PARAMS,
      {
        delay: 0.4,
        progress3: 1,
        duration: durationAmount
      },
      stagger * 2
    )
    timeline.to(
      this.PARAMS,
      {
        delay: 0.4,
        progress4: 1,
        duration: durationAmount
      },
      stagger * 3
    )
  }

  /**
   * postprocess
   */
  createPostProcessPipeline() {
    this.postProcessPipeline = new PostProcessPipeline({
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera
    })

    this.postProcessPipeline.createPasses()

    this.postProcessPipeline.createPostProcess()
  }

  /**loop */

  update(scroll) {
    if (this.home) {
      this.home.update({
        scroll: scroll,
        time: this.time,
        params: this.PARAMS
      })
    }

    this.time.delta = this.clock.getDelta()

    this.time.previous = this.time.current

    this.time.current += this.time.delta

    this.postProcessPipeline.render()
  }
}
