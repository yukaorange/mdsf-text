import Component from '@js/class/Component'
import each from 'lodash/each'
import GSAP from 'gsap'
import { TextureLoader } from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'

const fontPass = '/msdf/Anton-Regular-msdf.fnt'

export default class Preloader extends Component {
  constructor() {
    super({
      element: '.preloader',
      elements: {
        loading: '.preloader__loading',
        text: '.preloader__text',
        assets: '.preloader__assets'
      }
    })

    window.TEXTURES = {}

    this.length = 0

    this.createLoader()
  }

  createLoader() {
    this.assets = [...this.elements.assets.querySelectorAll('img')]

    this.totalAssetsLength = this.assets.length

    this.textureLoader = new TextureLoader()

    this.fontLoader = new FontLoader()

    const fontPromise = new Promise((resolve, reject) => {
      this.fontLoader.load(
        fontPass,
        font => {
          window.FONT = font
          resolve()
        },
        undefined,
        error => {
          reject(error)
        }
      )
    })

    const imagePromises = this.assets.map(imageDOM => {
      return new Promise((resolve, reject) => {
        const image = new Image()
        const id = imageDOM.getAttribute('data-id')

        image.crossOrigin = 'anonymous'

        image.src = imageDOM.getAttribute('data-src')

        image.onload = () => {
          const texture = this.textureLoader.load(image.src)

          texture.needsUpdate = true

          window.TEXTURES[id] = texture

          this.onAssetLoaded()

          resolve()
        }

        image.onerror = error => {
          reject(error)
        }
      })
    })

    Promise.all([fontPromise, ...imagePromises]).then(() => {
      this.onLoaded()
    })
  }

  onAssetLoaded() {
    this.length += 1

    const percent = this.length / this.totalAssetsLength

    this.elements.text.innerHTML = `${Math.round(percent * 100)}%`

    // if (this.length === this.totalAssetsLength) {
    //   this.onLoaded()
    // }
  }

  onLoaded() {
    return new Promise(resolve => {
      this.emit('completed')
      this.destroy()
      resolve()
    })
  }

  /**
   * destroy
   */

  destroy() {
    this.element.parentNode.removeChild(this.element)
  }
}
