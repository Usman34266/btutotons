/**
 * Cool-air shaders for the 3D AC. Ribbons and particles share one path: out
 * of the louver, forward and down, fanning out. `uStrength` (0–1: capacity ×
 * cooling effort) sets reach, speed and density; `uAim` (0 = straight ahead,
 * 1 = straight down) follows the louver, so swing sweeps the whole flow.
 * Illustration only.
 */
const PATH = /* glsl */ `
  uniform float uTime;
  uniform float uStrength;
  uniform vec3 uOrigin;
  uniform float uAim;

  float airReach() { return mix(0.95, 4.4, uStrength); }

  // s: distance along the flow; x0: lateral start on the louver.
  vec3 airPath(float s, float x0, float phase) {
    float wave = sin(s * 3.0 - uTime * mix(1.6, 4.0, uStrength) + phase)
      * 0.06 * (0.5 + s * 0.35);
    return vec3(
      x0 * (1.0 + 0.32 * s) + sin(s * 1.7 - uTime * 0.7 + phase) * 0.07,
      uOrigin.y - s * mix(0.18, 0.95, uAim) - s * s * 0.06 + wave,
      uOrigin.z + s * mix(1.0, 0.4, uAim)
    );
  }
`;

export const ribbonVertex = /* glsl */ `
  ${PATH}
  uniform float uX;
  uniform float uPhase;
  varying vec2 vUv;

  void main() {
    float s = uv.x * airReach();
    vec3 p = airPath(s, uX, uPhase);
    float width = mix(0.04, 0.2, uv.x) * mix(0.7, 1.35, uStrength);
    p.y += (uv.y - 0.5) * width;
    p.z += (uv.y - 0.5) * width * 0.4;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

export const ribbonFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uStrength;
  uniform float uPhase;
  uniform float uGate;
  varying vec2 vUv;

  void main() {
    float u = vUv.x;
    float on = smoothstep(uGate - 0.12, uGate + 0.04, uStrength);
    float edge = smoothstep(0.0, 0.7, 1.0 - abs(vUv.y - 0.5) * 2.0);
    float ends = smoothstep(0.0, 0.06, u) * (1.0 - smoothstep(0.45, 1.0, u));
    float flow = 0.5 + 0.5 * sin(u * 26.0 - uTime * mix(3.0, 9.0, uStrength) + uPhase * 3.0);
    float alpha = edge * ends * mix(0.35, 1.0, flow) * mix(0.18, 0.66, uStrength) * on;
    gl_FragColor = vec4(uColor, alpha);
    #include <colorspace_fragment>
  }
`;

export const particleVertex = /* glsl */ `
  ${PATH}
  uniform float uHalfWidth;
  uniform float uPixelRatio;
  attribute vec3 aSeed;
  varying float vAlpha;

  void main() {
    float life = fract(uTime * mix(0.16, 0.48, uStrength) + aSeed.x);
    float x0 = (aSeed.y * 2.0 - 1.0) * uHalfWidth;
    vec3 p = airPath(life * airReach(), x0, aSeed.z * 6.2831);
    float shown = step(aSeed.z, mix(0.14, 1.0, uStrength))
      * step(abs(aSeed.y * 2.0 - 1.0), mix(0.4, 1.0, uStrength));
    vAlpha = shown * smoothstep(0.0, 0.08, life) * (1.0 - smoothstep(0.55, 1.0, life));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = mix(5.0, 11.0, aSeed.y) * uPixelRatio * (5.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

export const particleFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = vAlpha * (1.0 - smoothstep(0.15, 0.5, d)) * 0.75;
    gl_FragColor = vec4(uColor, alpha);
    #include <colorspace_fragment>
  }
`;
