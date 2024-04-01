precision mediump float;

uniform sampler2D tDiffuse;
uniform sampler2D uTexture;

varying vec2 vUv;

void main() {

  vec2 uv = vUv;

  vec3 color = vec3(0.);

  vec4 texel = texture2D(tDiffuse, uv);

  vec4 texture = texture2D(uTexture, uv);

  color = texel.rgb;

  gl_FragColor = vec4(color, 1.);
}
