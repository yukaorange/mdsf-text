precision mediump float;

// Varyings
varying vec2 vUv;
varying vec2 vLayoutUv;

// Uniforms: Common
uniform float uOpacity;
uniform float uThreshold;
uniform float uAlphaTest;
uniform vec3 uColor;
uniform sampler2D uMap;

// Uniforms: Strokes
uniform vec3 uStrokeColor;
uniform float uStrokeOutsetWidth;
uniform float uStrokeInsetWidth;

uniform float uProgress1;
uniform float uProgress2;
uniform float uProgress3;
uniform float uProgress4;
uniform float uTime;
uniform float uTextAspect;

uniform sampler2D uNoiseTexture;
uniform vec3 uMyColor;
uniform vec2 uMouse;
uniform vec2 uResolution;

// Utils: Median
float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

float rand(float n) {
  return fract(sin(n) * 43758.5453123);
}

float rand(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(float p) {
  float fl = floor(p);
  float fc = fract(p);
  return mix(rand(fl), rand(fl + 1.0), fc);
}

float noise(vec2 n) {
  const vec2 d = vec2(0.0, 1.0);

  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));

  return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

float createCircle() {
  vec2 viewportUv = gl_FragCoord.xy / uResolution;

  float viewportAspect = uResolution.x / uResolution.y;

  vec2 mousePoint = vec2(uMouse.x, 1.0 - uMouse.y);

  float circleRadius = max(0.0, uResolution.y * 0.1 / uResolution.x);

  circleRadius = circleRadius;

  vec2 shapeUv = viewportUv - mousePoint;
  shapeUv /= vec2(1.0, viewportAspect);

  shapeUv += mousePoint;

  float dist = distance(shapeUv, mousePoint);

  dist = smoothstep(circleRadius, circleRadius + 0.001, dist);

  return dist;
}

float createDistortCircle() {
  vec2 viewportUv = gl_FragCoord.xy / uResolution;

  float viewportAspect = uResolution.x / uResolution.y;

  vec2 mousePoint = vec2(uMouse.x, 1.0 - uMouse.y);

  float n = noise(viewportUv * 10.0 + vec2(uTime));

  viewportUv = viewportUv + (n - 0.5) * 0.05;

  float circleRadius = max(0.0, uResolution.y * 0.1 / uResolution.x);

  circleRadius = circleRadius;

  vec2 shapeUv = viewportUv - mousePoint;
  shapeUv /= vec2(1.0, viewportAspect);

  shapeUv += mousePoint;

  float dist = distance(shapeUv, mousePoint);

  dist = smoothstep(circleRadius, circleRadius + 0.001, dist);

  return dist;
}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {
// Common
// Texture sample
  vec3 s = texture2D(uMap, vUv).rgb;

// Signed distance
  float sigDist = median(s.r, s.g, s.b) - 0.5;

  float afwidth = 1.4142135623730951 / 2.0;

  #ifdef IS_SMALL
  float alpha = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDist);
  #else
  float alpha = clamp(sigDist / fwidth(sigDist) + 0.5, 0.0, 1.0);
  #endif

  // Strokes
  // Outset
  float sigDistOutset = sigDist + uStrokeOutsetWidth * 0.5;

  // Inset
  float sigDistInset = sigDist - uStrokeInsetWidth * 0.5;

  #ifdef IS_SMALL
  float outset = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDistOutset);
  float inset = 1.0 - smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDistInset);
  #else
  float outset = clamp(sigDistOutset / fwidth(sigDistOutset) + 0.5, 0.0, 1.0);
  float inset = 1.0 - clamp(sigDistInset / fwidth(sigDistInset) + 0.5, 0.0, 1.0);
  #endif

  // Border
  float border = outset * inset;

  // Alpha Test
  if(alpha < uAlphaTest)
    discard;

  // Output: Common
  vec4 filledFragColor = vec4(uColor, uOpacity * alpha);

  // Output: Strokes
  vec4 strokedFragColor = vec4(uStrokeColor, uOpacity * border);

  //pattern and layoutUv
  vec2 layoutUv = vLayoutUv;

  layoutUv.x *= uTextAspect;

  float x = floor(layoutUv.x * 10.0);

  float y = floor(layoutUv.y * 10.0);

  float w = 0.5;

  float pattern = noise(vec2(x, y));

  //distortColor
  float lineProgress = 0.1;

  float g = texture2D(uNoiseTexture, vUv).r;

  float grad = fract(100.0 * g + uTime / 10.0);

  float start = smoothstep(0.0, 0.01, grad);

  float end = smoothstep(lineProgress, lineProgress - 0.01, grad);

  float mask = start * end;

  float circ = createDistortCircle();

  vec3 distortColor = vec3(layoutUv.y) * uMyColor * vec3(mask) + vec3(circ);
  // vec3 distortColor = vec3(1.0 - layoutUv.y);

 //letters
  vec4 l1 = vec4(1.0, 1.0, 1.0, border);

  vec4 l2 = vec4(uMyColor, border * 0.5);

  vec4 l3 = vec4(uMyColor, outset);

  vec4 l4 = vec4(distortColor, outset);

  float p1 = uProgress1;
  p1 = map(p1, 0.0, 1.0, -w, 1.0);
  p1 = smoothstep(p1, p1 + w, vLayoutUv.x);
  float mix1 = 2.0 * p1 - pattern;
  mix1 = clamp(mix1, 0.0, 1.0);

  float p2 = uProgress2;
  p2 = map(p2, 0.0, 1.0, -w, 1.0);
  p2 = smoothstep(p2, p2 + w, vLayoutUv.x);
  float mix2 = 2.0 * p2 - pattern;
  mix2 = clamp(mix2, 0.0, 1.0);

  float p3 = uProgress3;
  p3 = map(p3, 0.0, 1.0, -w, 1.0);
  p3 = smoothstep(p3, p3 + w, vLayoutUv.x);
  float mix3 = 2.0 * p3 - pattern;
  mix3 = clamp(mix3, 0.0, 1.0);

  float p4 = uProgress4;
  p4 = map(p4, 0.0, 1.0, -w, 1.0);
  p4 = smoothstep(p4, p4 + w, vLayoutUv.x);
  float mix4 = 2.0 * p4 - pattern;
  mix4 = clamp(mix4, 0.0, 1.0);

//layer
  vec4 layer1 = mix(vec4(0.0), l1, 1. - mix1);
  vec4 layer2 = mix(layer1, l2, 1. - mix2);
  vec4 layer3 = mix(layer2, l3, 1. - mix3);
  vec4 layer4 = mix(layer3, l4, 1. - mix4);

  gl_FragColor = layer4;
}