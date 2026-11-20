<script type="module">
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

'use strict';
const $ = id => document.getElementById(id);
// ---------- world coordinates: x/z on the seabed, h = height ----------
const K = 1;
const V = (x, z, h = 0) => new THREE.Vector3(x, h, z);
const setV = (v, x, z, h = 0) => v.set(x, h, z);
// ---------- deterministic noise helpers for scenery ----------
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let R = mulberry32(7);
const rr = (a, b) => a + (b - a) * R();
const ri = (a, b) => Math.floor(rr(a, b + 1));
const pick = a => a[Math.floor(R() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
function hash3(x, y, z) { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf); let r = 0;
  for (let dx = 0; dx < 2; dx++) for (let dy = 0; dy < 2; dy++) for (let dz = 0; dz < 2; dz++) r += hash3(xi + dx, yi + dy, zi + dz) * (dx ? u : 1 - u) * (dy ? v : 1 - v) * (dz ? w : 1 - w);
  return r;
}
const fbm3 = (x, y, z) => vnoise(x, y, z) * 0.55 + vnoise(x * 2.1, y * 2.1, z * 2.1) * 0.3 + vnoise(x * 4.3, y * 4.3, z * 4.3) * 0.15;

// ---------- renderer ----------
const host = $('game');
let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' }); }
catch (e) { document.body.insertAdjacentHTML('beforeend', '<div class="ov"><div class="card"><p>Trình duyệt này không bật được WebGL. Hãy mở bằng Chrome hoặc Safari bản mới.</p></div></div>'); throw e; }
let DPR = Math.min(window.devicePixelRatio || 1, 2);
renderer.setPixelRatio(DPR); renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
host.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const FOG = new THREE.Color(0x06262e);
scene.background = new THREE.Color(0x05222a);
scene.fog = new THREE.FogExp2(FOG, 0.035);
const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.3, 120);
{ // environment map for metal shine
  const envScene = new THREE.Scene(); const g = new THREE.SphereGeometry(10, 32, 16); const cols = [], pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / 10; const c = new THREE.Color().setRGB(0.02, 0.12, 0.16).lerp(new THREE.Color(1.6, 2.4, 2.6), clamp(y * 0.9 + 0.2, 0, 1) ** 2); cols.push(c.r, c.g, c.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  envScene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const spot = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 7, 7) })); spot.position.set(3, 8, 2); envScene.add(spot);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(envScene, 0.02).texture; pm.dispose();
}
const hemi = new THREE.HemisphereLight(0x8fefff, 0x0a2c36, 1.4); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xc8f7ff, 2.4); sun.position.set(-4, 12, 5); scene.add(sun);
const U = { uTime: { value: 0 } };

function stylized(params, rim = 0x7fefff, rimStr = 0.5, rimPow = 2.6) {
  const m = new THREE.MeshStandardMaterial(params);
  m.userData.u = { uRim: { value: new THREE.Color(rim) }, uRimStr: { value: rimStr }, uRimPow: { value: rimPow } };
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, m.userData.u);
    s.fragmentShader = 'uniform vec3 uRim; uniform float uRimStr; uniform float uRimPow;\n' + s.fragmentShader.replace('#include <opaque_fragment>',
      `{ float fr = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), uRimPow); outgoingLight += uRim * fr * uRimStr; }
       #include <opaque_fragment>`);
  };
  return m;
}
const glowMat = (hex, k = 2.6) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k) });
const addMat = (hex, k = 1, op = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });

// ---------- seabed shader with per-map palette ----------
const NOISE_GLSL = `
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),u.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*n2(p); p=p*2.03+vec2(1.7,9.2); a*=0.5; } return v; }
float caustic(vec2 uv, float t){
  vec2 p = uv * 6.2831 - 250.0; vec2 i = p; float c = 1.0; float inten = 0.005;
  for (int n = 0; n < 4; n++) { float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten))); }
  c /= 4.0; c = 1.17 - pow(c, 1.4); return pow(abs(c), 8.0);
}`;
const groundU = { uTime: U.uTime, uA: { value: new THREE.Color() }, uB: { value: new THREE.Color() }, uP: { value: new THREE.Color() }, uC: { value: new THREE.Color() }, uLava: { value: 0 }, uFade: { value: new THREE.Vector2(24, 40) }, uFog: { value: FOG }, uFogD: { value: 0.035 } };
const groundMat = new THREE.ShaderMaterial({
  uniforms: groundU,
  vertexShader: `varying vec3 vW; varying float vD; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vec4 mv = viewMatrix * w; vD = -mv.z; gl_Position = projectionMatrix * mv; }`,
  fragmentShader: NOISE_GLSL + `
    uniform float uTime, uLava, uFogD; uniform vec2 uFade; uniform vec3 uA, uB, uP, uC, uFog; varying vec3 vW; varying float vD;
    void main(){
      vec2 p = vW.xz * 3.2;
      float n = fbm(p * 0.18); float warp = fbm(p * 0.07 + 4.0);
      float rip = sin(p.x * 1.9 + p.y * 0.55 + warp * 9.0) * 0.5 + 0.5;
      rip = smoothstep(0.62, 1.0, rip) * 0.9 + smoothstep(0.0, 0.35, rip) * -0.25;
      vec3 col = mix(uA, uB, smoothstep(0.25, 0.8, n));
      col *= 0.82 + 0.32 * rip * (1.0 - uLava);
      col *= 0.94 + h21(floor(p * 40.0)) * 0.1;
      col = mix(col, uP, smoothstep(0.5, 0.78, fbm(p * 0.045 + 3.1)) * 0.7);
      float c = caustic(p * 0.11, uTime * 0.55), c2 = caustic(p * 0.23 + 3.0, uTime * 0.4);
      col += uC * (c * 0.35 + c2 * 0.15) * (0.6 + 0.4 * n);
      if (uLava > 0.5) { float cr = fbm(p * 0.35 + 7.0); float crack = smoothstep(0.035, 0.0, abs(cr - 0.5)); col += vec3(0.9, 0.22, 0.03) * crack * (0.6 + 0.4 * sin(uTime * 2.0 + p.x)); }
      float r = length(vW.xz - vec2(0.0, 0.0));
      col *= mix(1.0, 0.3, smoothstep(uFade.x, uFade.y, r));
      float f = 1.0 - exp(-uFogD * uFogD * vD * vD);
      gl_FragColor = vec4(mix(col, uFog, f), 1.0);
    }`
});
const ground = new THREE.Mesh(new THREE.CircleGeometry(60, 96).rotateX(-Math.PI / 2), groundMat); scene.add(ground);

const blobTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,0.75)'); g.addColorStop(0.55, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
const blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.8 });
const blobGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
function blob(size) { const m = new THREE.Mesh(blobGeo, blobMat); m.scale.set(size, 1, size); m.position.y = 0.02; m.renderOrder = 1; return m; }

// ---------- map scenery (rebuilt on every map change) ----------
const world = new THREE.Group(); scene.add(world);
function rockGeo(r, h, jag, pal) {
  const g = new THREE.IcosahedronGeometry(1, 2); const p = g.attributes.position, cols = []; const off = rr(0, 100);
  const [top, mid, low, tip] = pal.map(c => new THREE.Color(c)); const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = fbm3(v.x * 1.6 + off, v.y * 1.6, v.z * 1.6); const spike = Math.pow(vnoise(v.x * 3 + off, v.y * 3, v.z * 3), 3) * jag;
    v.multiplyScalar(0.72 + n * 0.55 + spike); v.y = v.y < 0 ? v.y * 0.25 : v.y * h * (1 + spike * 0.6); v.x *= r; v.z *= r; p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); const nrm = g.attributes.normal;
  for (let i = 0; i < p.count; i++) { const ny = nrm.getY(i), y = p.getY(i); const c = low.clone().lerp(mid, clamp(y / (h * 0.6) + 0.3, 0, 1)); c.lerp(top, clamp(ny * 1.3 - 0.2, 0, 1) * 0.85); if (y > h * 0.95) c.lerp(tip, 0.35); c.multiplyScalar(0.85 + vnoise(p.getX(i) * 4, y * 4, p.getZ(i) * 4) * 0.3); cols.push(c.r, c.g, c.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); return g;
}
const rockMat = stylized({ vertexColors: true, roughness: 0.85, metalness: 0.05, flatShading: true, envMapIntensity: 0.6 }, 0x6ff0ff, 0.35, 3.0);
function coralBranches(len, rad, depth, color, tipColor) {
  const parts = [], tips = [];
  const grow = (base, dir, l, r, d) => {
    const g = new THREE.CylinderGeometry(r * 0.7, r, l, 6, 1); g.translate(0, l / 2, 0); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)); g.translate(base.x, base.y, base.z); parts.push(g.toNonIndexed());
    const end = base.clone().addScaledVector(dir, l); parts.push(new THREE.SphereGeometry(r * 0.9, 6, 4).translate(end.x, end.y, end.z).toNonIndexed());
    if (d <= 0) { tips.push(end); return; }
    for (let i = 0, n = ri(2, 3); i < n; i++) grow(end, dir.clone().add(new THREE.Vector3(rr(-0.75, 0.75), rr(0.1, 0.6), rr(-0.75, 0.75))).normalize(), l * rr(0.6, 0.8), r * 0.72, d - 1);
  };
  for (let i = 0; i < 3; i++) grow(new THREE.Vector3(rr(-0.2, 0.2), 0, rr(-0.2, 0.2)).multiplyScalar(len), new THREE.Vector3(rr(-0.4, 0.4), 1, rr(-0.4, 0.4)).normalize(), len, rad, depth);
  const grp = new THREE.Group();
  grp.add(new THREE.Mesh(mergeGeometries(parts), stylized({ color, roughness: 0.6, emissive: color, emissiveIntensity: 0.25 }, tipColor, 0.7, 2.2)));
  grp.add(new THREE.Mesh(mergeGeometries(tips.map(t => new THREE.SphereGeometry(rad * 0.75, 6, 4).translate(t.x, t.y, t.z))), glowMat(tipColor, 1.7)));
  return grp;
}
function tubeSponge(color, s) {
  const grp = new THREE.Group(); const mat = stylized({ color, roughness: 0.7, side: THREE.DoubleSide, emissive: color, emissiveIntensity: 0.15 }, 0xffe28a, 0.6); const glow = glowMat(color, 2.2);
  for (let i = 0, n = ri(3, 5); i < n; i++) { const h = rr(0.6, 1.4) * s, r = rr(0.12, 0.2) * s; const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.8, h, 10, 1, true), mat);
    t.position.set(rr(-0.35, 0.35) * s, h / 2, rr(-0.35, 0.35) * s); t.rotation.set(rr(-0.2, 0.2), 0, rr(-0.2, 0.2));
    const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.025 * s, 6, 14), glow); rim.rotation.x = Math.PI / 2; rim.position.y = h / 2; t.add(rim); grp.add(t); }
  return grp;
}
function seaFan(color, s) {
  const parts = [];
  const grow = (x, y, ang, l, d) => { const ex = x + Math.cos(ang) * l, ey = y + Math.sin(ang) * l; const g = new THREE.CylinderGeometry((0.018 + d * 0.006) * s, (0.024 + d * 0.008) * s, l, 4); g.translate(0, l / 2, 0); g.rotateZ(ang - Math.PI / 2); g.translate(x, y, 0); parts.push(g.toNonIndexed());
    if (d <= 0) return; grow(ex, ey, ang + rr(0.25, 0.5), l * 0.78, d - 1); grow(ex, ey, ang - rr(0.25, 0.5), l * 0.78, d - 1); };
  grow(0, 0, Math.PI / 2, 0.5 * s, 5);
  return new THREE.Mesh(mergeGeometries(parts), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.6), side: THREE.DoubleSide }));
}
const weedGeo = new THREE.PlaneGeometry(0.16, 1, 1, 8); weedGeo.translate(0, 0.5, 0);
const weedMat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.6, emissive: 0x0c3d2a, emissiveIntensity: 0.6 });
weedMat.onBeforeCompile = (s) => { s.uniforms.uTime = U.uTime; s.vertexShader = 'uniform float uTime;\n' + s.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = vec3(position);
  float ph = instanceMatrix[3].x * 0.7 + instanceMatrix[3].z * 0.45; float k = pow(position.y, 1.6);
  transformed.x += sin(uTime * 1.3 + ph + position.y * 2.2) * 0.3 * k; transformed.z += cos(uTime * 1.1 + ph * 1.3 + position.y * 1.7) * 0.18 * k; transformed.x *= 1.0 - position.y * 0.55;`); };
function weeds(list, palette) {
  if (!list.length) return; const mesh = new THREE.InstancedMesh(weedGeo, weedMat, list.length); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
  list.forEach(([x, z, h], i) => { q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rr(0, 6.28)); m4.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(rr(0.8, 1.4), h, 1)); mesh.setMatrixAt(i, m4); mesh.setColorAt(i, c.set(pick(palette))); });
  world.add(mesh);
}
const lavaPoolMat = new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime }, transparent: true, depthWrite: false,
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: NOISE_GLSL + `uniform float uTime; varying vec2 vUv; void main(){ vec2 p = vUv - 0.5; float r = length(p) * 2.0; float n = fbm(vUv * 6.0 + uTime * 0.15);
    vec3 col = mix(vec3(1.6, 0.25, 0.02), vec3(2.2, 1.4, 0.4), n); float a = smoothstep(1.0, 0.75, r + n * 0.2); gl_FragColor = vec4(col * a, a); }` });

// ---------- light shafts and ambient motes ----------
const shaftMat = new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  vertexShader: 'varying vec2 vUv; varying float vSeed; void main(){ vUv=uv; vSeed = modelMatrix[3].x*0.37 + modelMatrix[3].z*0.11; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader: `uniform float uTime; varying vec2 vUv; varying float vSeed; void main(){ float edge = smoothstep(0.0, 0.5, vUv.x) * smoothstep(1.0, 0.5, vUv.x);
    float v = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.6, vUv.y); float flick = 0.55 + 0.45 * sin(uTime * 0.6 + vSeed * 6.0);
    gl_FragColor = vec4(vec3(0.16, 0.4, 0.45) * edge * edge * v * flick * 0.22, 1.0); }` });
const shafts = new THREE.Group(); scene.add(shafts);
for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(rr(1.2, 2.6), 18), shaftMat); m.position.set(rr(-10, 10), 7, rr(-10, 6)); m.rotation.set(0, rr(-0.4, 0.4), 0.45); shafts.add(m); }
function motes(count, color, size, rise) {
  const g = new THREE.BufferGeometry(); const p = new Float32Array(count * 3), s = new Float32Array(count);
  for (let i = 0; i < count; i++) { p[i * 3] = rr(-12, 12); p[i * 3 + 1] = rr(0, 5); p[i * 3 + 2] = rr(-12, 12); s[i] = rr(0.4, 1); }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aS', new THREE.BufferAttribute(s, 1));
  const m = new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uC: { value: new THREE.Color(color) }, uSize: { value: size }, uRise: { value: rise }, uScale: { value: innerHeight * DPR * 0.5 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `uniform float uTime, uSize, uRise, uScale; attribute float aS; varying float vA; void main(){ vec3 p = position; p.y = mod(p.y + uTime * uRise * aS, 5.0);
      p.x += sin(uTime * 0.5 + position.z) * 0.3; p.z += cos(uTime * 0.4 + position.x) * 0.3; vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_PointSize = uSize * aS * uScale / -mv.z;
      vA = smoothstep(0.0, 0.6, p.y) * smoothstep(5.0, 3.5, p.y) * (0.5 + 0.5 * sin(uTime * 2.0 + position.x * 3.0)); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uC; varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); a *= a; gl_FragColor = vec4(uC * a * vA, 1.0); }` });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; scene.add(pts); m.userData.pts = pts; return m;
}
const moteMats = [motes(520, 0x7fdcef, 0.07, 0.15), motes(80, 0xbff4ff, 0.12, 0.6)];

// ---------- particle pool ----------
const PMAX = 1600;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(PMAX * 3), pCol = new Float32Array(PMAX * 3), pSize = new Float32Array(PMAX), pAl = new Float32Array(PMAX);
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('aC', new THREE.BufferAttribute(pCol, 3)); pGeo.setAttribute('aS', new THREE.BufferAttribute(pSize, 1)); pGeo.setAttribute('aA', new THREE.BufferAttribute(pAl, 1));
const pMat = new THREE.ShaderMaterial({ uniforms: { uScale: { value: innerHeight * DPR * 0.5 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: `uniform float uScale; attribute vec3 aC; attribute float aS; attribute float aA; varying vec3 vC; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aS * uScale / -mv.z; vC = aC; vA = aA; gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `varying vec3 vC; varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vC * a * a * vA, 1.0); }` });
const ptsMesh = new THREE.Points(pGeo, pMat); ptsMesh.frustumCulled = false; scene.add(ptsMesh);
const parts = []; for (let i = 0; i < PMAX; i++) parts.push({ life: 0, max: 1, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, r: 1, g: 1, b: 1, s: 0.1, drag: 1, grav: 0 });
let pCursor = 0; const tmpC = new THREE.Color();
function emit(x, y, z, vx, vy, vz, col, size, life, grav = 0, drag = 0.96) { const p = parts[pCursor]; pCursor = (pCursor + 1) % PMAX; tmpC.set(col); Object.assign(p, { x, y, z, vx, vy, vz, life, max: life, s: size, grav, drag, r: tmpC.r * 1.4, g: tmpC.g * 1.4, b: tmpC.b * 1.4 }); }
// logical-space burst: speed in px/s and size in px like the original, height h in world units
function burst(x, y, col, n, spd, size, h = 0.5) { const c = V(x, y, h); const k = K; for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, e = Math.random() * 1.4 - 0.3, v = (0.3 + Math.random()) * spd * k; emit(c.x, c.y, c.z, Math.cos(a) * Math.cos(e) * v, Math.sin(e) * v + 0.3, Math.sin(a) * Math.cos(e) * v, col, (size || 4) * k * 2.2 * (0.6 + Math.random() * 0.8), 0.35 + Math.random() * 0.35, -1.6, 0.92); } }
function partAt(p, v, col, size, life, grav = 0, drag = 0.97) { emit(p.x, p.y, p.z, v.x, v.y, v.z, col, size, life, grav, drag); }
function updateParticles(dt) {
  for (let i = 0; i < PMAX; i++) { const p = parts[i]; if (p.life > 0) { p.life -= dt; const k = Math.pow(p.drag, dt * 60); p.vx *= k; p.vy = p.vy * k + p.grav * dt; p.vz *= k; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; }
    const t = Math.max(0, p.life / p.max); pPos[i * 3] = p.x; pPos[i * 3 + 1] = p.y; pPos[i * 3 + 2] = p.z; pCol[i * 3] = p.r; pCol[i * 3 + 1] = p.g; pCol[i * 3 + 2] = p.b; pSize[i] = p.s * (0.4 + 0.6 * t); pAl[i] = p.life > 0 ? t : 0; }
  pGeo.attributes.position.needsUpdate = pGeo.attributes.aC.needsUpdate = pGeo.attributes.aS.needsUpdate = pGeo.attributes.aA.needsUpdate = true;
}

// ---------- flat expanding rings and light pillars ----------
const ringGeo = new THREE.RingGeometry(0.86, 1, 48).rotateX(-Math.PI / 2);
const ringsFx = [];
function ring(x, y, r0, r1, col, life, flat, h = 0.05) {
  const m = new THREE.Mesh(ringGeo, addMat(col, 1.6)); m.position.copy(V(x, y, h)); m.scale.setScalar(Math.max(0.01, r0 * K)); scene.add(m);
  ringsFx.push({ m, r0: r0 * K, r1: r1 * K, life, max: life });
}
const pillarGeo = new THREE.CylinderGeometry(0.22, 0.32, 3.2, 16, 1, true); pillarGeo.translate(0, 1.6, 0);
const pillarShader = { vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'uniform vec3 uC; uniform float uA; varying vec2 vUv; void main(){ float a = (1.0 - vUv.y); gl_FragColor = vec4(uC * a * a * uA, 1.0); }' };
const pillarsFx = [];
function pillar(x, y, col, life, w = 1) {
  const m = new THREE.Mesh(pillarGeo, new THREE.ShaderMaterial({ ...pillarShader, uniforms: { uC: { value: new THREE.Color(col).multiplyScalar(1.4) }, uA: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  m.position.copy(V(x, y, 0)); m.scale.set(w, 1, w); scene.add(m); pillarsFx.push({ m, life, max: life });
}
function updateFx(dt) {
  for (const r of ringsFx) { r.life -= dt; const k = 1 - r.life / r.max; r.m.scale.setScalar(Math.max(0.01, lerp(r.r0, r.r1, 1 - Math.pow(1 - k, 3)))); r.m.material.opacity = Math.max(0, r.life / r.max); if (r.life <= 0) { scene.remove(r.m); r.m.material.dispose(); } }
  for (let i = ringsFx.length - 1; i >= 0; i--) if (ringsFx[i].life <= 0) ringsFx.splice(i, 1);
  for (const p of pillarsFx) { p.life -= dt; p.m.material.uniforms.uA.value = Math.max(0, Math.sin(Math.PI * clamp(1 - p.life / p.max, 0, 1)) * 1.2); if (p.life <= 0) { scene.remove(p.m); p.m.material.dispose(); } }
  for (let i = pillarsFx.length - 1; i >= 0; i--) if (pillarsFx[i].life <= 0) pillarsFx.splice(i, 1);
}
// jagged glowing lines for lightning
const boltsFx = [];
function bolt(points, col, life) {
  const pts = []; for (let i = 0; i < points.length - 1; i++) { const a = points[i], b = points[i + 1]; const n = 6; for (let j = 0; j < n; j++) { const t = j / n; const p = a.clone().lerp(b, t); if (j > 0) p.add(new THREE.Vector3((Math.random() - 0.5) * 0.18, (Math.random() - 0.5) * 0.18, (Math.random() - 0.5) * 0.18)); pts.push(p); } } pts.push(points[points.length - 1]);
  const g = new THREE.BufferGeometry().setFromPoints(pts);
  const grp = new THREE.Group();
  grp.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(3), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
  const g2 = g.clone(); g2.translate(0.02, 0.02, 0); grp.add(new THREE.Line(g2, new THREE.LineBasicMaterial({ color: new THREE.Color(col).multiplyScalar(2.5), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
  scene.add(grp); boltsFx.push({ grp, life, max: life });
  for (const p of pts) if (Math.random() < 0.35) emit(p.x, p.y, p.z, 0, 0, 0, col, 0.12, 0.2, 0, 1);
}
function updateBolts(dt) { for (const b of boltsFx) { b.life -= dt; b.grp.children.forEach(l => l.material.opacity = Math.max(0, b.life / b.max)); if (b.life <= 0) { scene.remove(b.grp); b.grp.children.forEach(l => { l.geometry.dispose(); l.material.dispose(); }); } } for (let i = boltsFx.length - 1; i >= 0; i--) if (boltsFx[i].life <= 0) boltsFx.splice(i, 1); }

// ---------- floating text (DOM, crisp at any resolution) ----------
const labelsEl = $('labels');
const tmpV = new THREE.Vector3();
function toScreen(v) { tmpV.copy(v).project(camera); return [(tmpV.x * 0.5 + 0.5) * innerWidth, (-tmpV.y * 0.5 + 0.5) * innerHeight, tmpV.z < 1]; }
let textCount = 0;
function addText(x, y, s, col, size, o, h = 0.9) {
  if (textCount > 60) return;
  const [sx, sy] = toScreen(V(x, y, h)); o = o || {};
  const d = document.createElement('div'); d.className = 'dmg' + (o.glow ? ' glow' : '') + (o.big ? ' big' : '');
  d.textContent = s; d.style.color = col; d.style.fontSize = Math.round((size || 14) * 0.9) + 'px'; d.style.left = sx + 'px'; d.style.top = sy + 'px';
  const life = o.life || 0.95; d.style.animationDuration = life + 's';
  labelsEl.appendChild(d); textCount++; setTimeout(() => { d.remove(); textCount--; }, life * 1000 + 50);
}
