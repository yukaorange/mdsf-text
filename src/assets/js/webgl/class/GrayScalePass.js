import PostProcessPass from './PostProcessPass'

import { WebGLRenderTarget } from 'three'

import grayScaleFragment from '../../shaders/grayscale-fragment.glsl'
import vertex from '../../shaders/post-vertex.glsl'

export default class GrayScalePass extends PostProcessPass {
  constructor() {
    super({
      fragment: grayScaleFragment,
      vertex: vertex,
      renderTarget: new WebGLRenderTarget(
        window.innerWidth,
        window.innerHeight
      ),
      uniforms: {
        uTexture: { value: window.TEXTURES['3'] }
      }
    })
  }
}
