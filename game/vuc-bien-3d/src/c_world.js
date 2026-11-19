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
// ---------- logical board (same coordinates as the 2D original) mapped onto the 3D seabed ----------
const W = 540, H = 960, BOARD_H = 866;
const K = 1 / 60;                       // world units per logical pixel
const V = (x, y, h = 0) => new THREE.Vector3((x - 270) * K, h, (y - 440) * K);
const setV = (v, x, y, h = 0) => v.set((x - 270) * K, h, (y - 440) * K);

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
const groundU = { uTime: U.uTime, uA: { value: new THREE.Color() }, uB: { value: new THREE.Color() }, uP: { value: new THREE.Color() }, uC: { value: new THREE.Color() }, uLava: { value: 0 }, uFog: { value: FOG }, uFogD: { value: 0.035 } };
const groundMat = new THREE.ShaderMaterial({
  uniforms: groundU,
  vertexShader: `varying vec3 vW; varying float vD; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vec4 mv = viewMatrix * w; vD = -mv.z; gl_Position = projectionMatrix * mv; }`,
  fragmentShader: NOISE_GLSL + `
    uniform float uTime, uLava, uFogD; uniform vec3 uA, uB, uP, uC, uFog; varying vec3 vW; varying float vD;
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
      col *= mix(1.0, 0.3, smoothstep(9.0, 20.0, r));
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

// path, shrine and hero dais
const PC = { x: 270, y: 515, r: 112 };
let PATH = [], segs = [], PATH_LEN = 0;
function buildPath(p) { PATH = p; segs = []; PATH_LEN = 0; for (let i = 0; i < p.length - 1; i++) { const [x1, y1] = p[i], [x2, y2] = p[i + 1]; const l = Math.hypot(x2 - x1, y2 - y1); segs.push({ x1, y1, x2, y2, l, s: PATH_LEN }); PATH_LEN += l; } }
function posAt(d) { for (const s of segs) { if (d <= s.s + s.l) { const k = (d - s.s) / s.l; return { x: s.x1 + (s.x2 - s.x1) * k, y: s.y1 + (s.y2 - s.y1) * k, dx: Math.sign(s.x2 - s.x1), dy: Math.sign(s.y2 - s.y1) }; } } const s = segs[segs.length - 1]; return { x: s.x2, y: s.y2, dx: 0, dy: 0 }; }
function distSeg(px, py, s) { const dx = s.x2 - s.x1, dy = s.y2 - s.y1; let k = ((px - s.x1) * dx + (py - s.y1) * dy) / (dx * dx + dy * dy); k = clamp(k, 0, 1); return Math.hypot(px - (s.x1 + dx * k), py - (s.y1 + dy * k)); }
let SH = { x: 0, y: 0 };
function isFree(x, y, m) { if (y > BOARD_H - 20 || y < 70 || x < 10 || x > W - 10) return false; for (const s of segs) if (distSeg(x, y, s) < m) return false; if (Math.hypot(x - PC.x, y - PC.y) < PC.r + m * 0.6) return false; if (Math.hypot(x - SH.x, y - SH.y) < m + 30) return false; return true; }
const roadMat = new THREE.ShaderMaterial({ uniforms: { uA: { value: new THREE.Color() }, uB: { value: new THREE.Color() }, uTime: U.uTime },
  vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
  fragmentShader: NOISE_GLSL + `uniform vec3 uA, uB; varying vec3 vW; void main(){ vec2 p = vW.xz * 6.0; float n = fbm(p); float peb = smoothstep(0.62, 0.7, n2(p * 3.0));
    vec3 col = mix(uA, uB, n) * (0.9 + 0.2 * peb); gl_FragColor = vec4(col, 1.0); }` });
const edgeMat = new THREE.MeshBasicMaterial({ color: 0x041214, transparent: true, opacity: 0.55, depthWrite: false });
function buildRoad(group, path) {
  const w = 54 * K, e = 66 * K;
  const pts = path.slice(); const p0 = pts[0], p1 = pts[1]; pts[0] = [p0[0] + Math.sign(p0[0] - p1[0]) * 60, p0[1] + Math.sign(p0[1] - p1[1]) * 60];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = V(pts[i][0], pts[i][1]), b = V(pts[i + 1][0], pts[i + 1][1]); const L = a.distanceTo(b); const mid = a.clone().add(b).multiplyScalar(0.5); const ang = Math.atan2(b.x - a.x, b.z - a.z);
    for (const [wd, mat, y] of [[e, edgeMat, 0.012], [w, roadMat, 0.02]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(wd, L).rotateX(-Math.PI / 2), mat); m.position.set(mid.x, y, mid.z); m.rotation.y = ang; group.add(m); }
  }
  for (let i = 1; i < pts.length; i++) { const c = V(pts[i][0], pts[i][1]); for (const [wd, mat, y] of [[e, edgeMat, 0.0121], [w, roadMat, 0.0201]]) { const m = new THREE.Mesh(new THREE.CircleGeometry(wd / 2, 20).rotateX(-Math.PI / 2), mat); m.position.set(c.x, y, c.z); group.add(m); } }
}
// shrine (Thánh Thạch)
const shrine = new THREE.Group(); scene.add(shrine);
const shrineCrystalMat = new THREE.MeshStandardMaterial({ color: 0x9ff8ff, emissive: new THREE.Color(0x3fe0ff), emissiveIntensity: 1.6, metalness: 0.2, roughness: 0.1, transparent: true, opacity: 0.92 });
{
  const stone = stylized({ color: 0x5f8f99, roughness: 0.75, metalness: 0.1, flatShading: true }, 0x8ff6ff, 0.45, 2.4);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.75, 0.22, 8), stone); base.position.y = 0.11; shrine.add(base);
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.45, 0.42, 8), stone); ped.position.y = 0.42; shrine.add(ped);
  const rune = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.025, 6, 32), glowMat(0x6fe7ff, 2.4)); rune.rotation.x = Math.PI / 2; rune.position.y = 0.23; shrine.add(rune);
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0).scale(0.75, 1.6, 0.75), shrineCrystalMat); crystal.position.y = 1.25; shrine.add(crystal); shrine.userData.crystal = crystal;
  for (let i = 0; i < 4; i++) { const sh = new THREE.Mesh(new THREE.OctahedronGeometry(0.09).scale(0.6, 1.6, 0.6), shrineCrystalMat); shrine.add(sh); shrine.userData['s' + i] = sh; }
  shrine.add(blob(1.8));
}
// hero dais
const daisMat = new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uC: { value: new THREE.Color(0x5af0ff) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform float uTime; uniform vec3 uC; varying vec2 vUv; void main(){ vec2 p = vUv - 0.5; float r = length(p) * 2.0; float a = atan(p.y, p.x);
    float ring = smoothstep(0.025, 0.0, abs(r - 0.94)) + smoothstep(0.015, 0.0, abs(r - 0.86)) * 0.7;
    float runes = step(0.55, fract(a * 12.0 / 3.14159 + uTime * 0.05)) * smoothstep(0.03, 0.0, abs(r - 0.9)) * 0.7;
    float inner = smoothstep(0.012, 0.0, abs(r - 0.42)) * 0.4; float glow = smoothstep(1.0, 0.0, r) * 0.08;
    gl_FragColor = vec4(uC * (ring + runes + inner + glow) * 0.9, 1.0); }` });
const dais = new THREE.Group(); scene.add(dais);
{
  const p = V(PC.x, PC.y); dais.position.copy(p);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(PC.r * K, PC.r * K * 1.04, 0.08, 48), stylized({ color: 0x3e5654, roughness: 0.8, flatShading: true }, 0x5af0ff, 0.3)); disc.position.y = 0.04; dais.add(disc);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(PC.r * K * 2.1, PC.r * K * 2.1).rotateX(-Math.PI / 2), daisMat); glow.position.y = 0.09; dais.add(glow);
}

const MAPS = [
  { name: 'Vực Biển Cổ', theme: 'sea', path: [[460, -40], [460, 700], [95, 700], [95, 300], [350, 300]], shrine: { x: 386, y: 302 },
    ground: [0x0d3a3e, 0x2b5551, 0x061a1e, 0x3fc0d0], road: [0x2f5a55, 0x557e77], rock: [0x4fae94, 0x1f5d63, 0x0b2a33, 0x9ff2d8], rune: 0x5af0ff, fog: 0x06262e, weed: [0x2f9e6e, 0x4fc48a, 0x1f7a6a, 0x7ad19a] },
  { name: 'Rừng Tảo U Linh', theme: 'kelp', path: [[70, -40], [70, 290], [470, 290], [470, 720], [70, 720], [70, 792]], shrine: { x: 70, y: 806 },
    ground: [0x0c2a1a, 0x2a4a30, 0x041208, 0x6fe08a], road: [0x2f4a36, 0x4a654c], rock: [0x6a9a5c, 0x2f5a3a, 0x0e2416, 0xb8ffb0], rune: 0x7dff9a, fog: 0x07241a, weed: [0x3a9a3a, 0x5ac45a, 0x2a7a3a, 0x8ad16a, 0x6ab84a] },
  { name: 'Hố Thẳm Dung Nham', theme: 'lava', path: [[-40, 270], [465, 270], [465, 710], [80, 710], [80, 442]], shrine: { x: 80, y: 428 },
    ground: [0x1a1012, 0x2e2224, 0x0a0606, 0xff8a50], road: [0x3a2c2a, 0x55423c], rock: [0x5a4a46, 0x3a2c2a, 0x160e0c, 0xff7a3a], rune: 0xff7a3a, fog: 0x1a0c0a, weed: [] }
];
let CUR_MAP = -1;
const ambient = [];      // animated scenery entries
function setMap(i) {
  CUR_MAP = i; const M = MAPS[i]; buildPath(M.path); SH = M.shrine;
  while (world.children.length) { const c = world.children.pop(); c.traverse(o => { if (o.geometry && o.geometry !== weedGeo && o.geometry !== blobGeo) o.geometry.dispose(); }); }
  ambient.length = 0;
  groundU.uA.value.setHex(M.ground[0]); groundU.uB.value.setHex(M.ground[1]); groundU.uP.value.setHex(M.ground[2]); groundU.uC.value.setHex(M.ground[3]); groundU.uLava.value = M.theme === 'lava' ? 1 : 0;
  roadMat.uniforms.uA.value.setHex(M.road[0]); roadMat.uniforms.uB.value.setHex(M.road[1]);
  FOG.setHex(M.fog); scene.background.setHex(M.fog).multiplyScalar(0.85);
  daisMat.uniforms.uC.value.setHex(M.rune);
  shrine.position.copy(V(SH.x, SH.y));
  R = mulberry32(77 + i * 13);
  buildRoad(world, M.path);
  const rockPal = M.rock;
  const rocks = (n, rmin, rmax, m) => { let tr = 0, k = 0; while (k < n && tr++ < 800) { const x = rr(0, W), y = rr(60, BOARD_H); if (!isFree(x, y, m)) continue; const p = V(x, y); const r = rr(rmin, rmax);
    const mesh = new THREE.Mesh(rockGeo(r, rr(0.8, 1.6) * r, rr(0.8, 1.6), rockPal), rockMat); mesh.position.copy(p); mesh.rotation.y = rr(0, 6.28); world.add(mesh); const b = blob(r * 3.2); b.position.set(p.x, 0.02, p.z); world.add(b); k++; } };
  // frame the board with large rocks outside it
  // frame the board with rocks on the sides and far edge only, so nothing stands between the camera and the board
  for (let a = 0; a < 26; a++) { const side = a % 2 ? 1 : -1; const z = rr(-8.5, 7.5); const x = side * rr(5.4, 7.2); const r = rr(0.5, 1.0);
    const mesh = new THREE.Mesh(rockGeo(r, rr(0.6, 1.3), rr(1, 2), rockPal), rockMat); mesh.position.set(x, 0, z); mesh.rotation.y = rr(0, 6); world.add(mesh); }
  for (let a = 0; a < 10; a++) { const x = rr(-6, 6), z = rr(-10.5, -8.6); const r = rr(0.6, 1.1); const mesh = new THREE.Mesh(rockGeo(r, rr(0.8, 1.6), rr(1, 2), rockPal), rockMat); mesh.position.set(x, 0, z); mesh.rotation.y = rr(0, 6); world.add(mesh); }
  rocks(10, 0.18, 0.42, 34);
  if (M.theme !== 'lava') {
    const coralCols = M.theme === 'kelp' ? [[0x6aff8a, 0xd8ffb0], [0x3fd1c8, 0xb8fff4], [0xb0ff5a, 0xf4ffc0]] : [[0xff4f9a, 0xffb0e0], [0x9a5bff, 0xd8b8ff], [0xff7a3d, 0xffd08a], [0x3fd1c8, 0xb8fff4]];
    let tr = 0, k = 0; while (k < 14 && tr++ < 900) { const x = rr(0, W), y = rr(60, BOARD_H); if (!isFree(x, y, 40)) continue; const p = V(x, y); const [c, t] = pick(coralCols);
      const cg = coralBranches(0.22, 0.03, 3, c, t); cg.position.copy(p); cg.scale.setScalar(rr(0.8, 1.3)); cg.rotation.y = rr(0, 6); world.add(cg);
      if (R() < 0.6) { const sp = tubeSponge(pick([0xffb43d, 0xff6a5a, 0xc8ff6a]), 0.35); sp.position.set(p.x + rr(-0.3, 0.3), 0, p.z + rr(-0.3, 0.3)); world.add(sp); }
      if (R() < 0.6) { const f = seaFan(pick([0xff5fa8, 0xb07bff, 0xffa34d]), 0.45); f.position.set(p.x + rr(-0.35, 0.35), 0, p.z + rr(-0.35, 0.35)); f.rotation.y = rr(0, 6); world.add(f); }
      const b = blob(0.9); b.position.set(p.x, 0.02, p.z); world.add(b); k++; }
    const wl = []; const nw = M.theme === 'kelp' ? 140 : 50; tr = 0; while (wl.length < nw && tr++ < 3000) { const x = rr(0, W), y = rr(60, BOARD_H); if (!isFree(x, y, 30)) continue; const cx = (x - 270) * K, cz = (y - 440) * K;
      const n = M.theme === 'kelp' ? ri(3, 6) : ri(2, 4); for (let j = 0; j < n; j++) wl.push([cx + rr(-0.25, 0.25), cz + rr(-0.25, 0.25), (M.theme === 'kelp' ? rr(1.2, 2.6) : rr(0.5, 1.1))]); }
    weeds(wl, M.weed);
  } else {
    let tr = 0, k = 0; while (k < 7 && tr++ < 900) { const x = rr(0, W), y = rr(60, BOARD_H); if (!isFree(x, y, 46)) continue; const p = V(x, y); const s = rr(0.5, 0.9);
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(s * 1.6, s).rotateX(-Math.PI / 2), lavaPoolMat); pool.position.set(p.x, 0.025, p.z); pool.rotation.y = rr(0, 3); world.add(pool);
      const l = new THREE.PointLight(0xff5a1a, 2.2, 2.6, 1.8); l.position.set(p.x, 0.4, p.z); world.add(l); ambient.push({ kind: 'vent', x: p.x, z: p.z }); k++; }
    tr = 0; k = 0; while (k < 12 && tr++ < 900) { const x = rr(0, W), y = rr(60, BOARD_H); if (!isFree(x, y, 30)) continue; const p = V(x, y); const g = new THREE.Group();
      for (let j = 0; j < ri(2, 4); j++) { const h = rr(0.3, 0.8); const m = new THREE.Mesh(new THREE.ConeGeometry(rr(0.06, 0.12), h, 5), stylized({ color: 0x15101a, metalness: 0.6, roughness: 0.2, flatShading: true }, 0xff6a2a, 0.8, 2)); m.position.set(rr(-0.15, 0.15), h / 2, rr(-0.15, 0.15)); m.rotation.set(rr(-0.3, 0.3), 0, rr(-0.3, 0.3)); g.add(m); }
      g.position.copy(p); world.add(g); k++; }
  }
  // ruined pillars near the board edges
  { let tr = 0, k = 0; while (k < 3 && tr++ < 600) { const x = rr(0, W), y = rr(80, BOARD_H - 40); if (!isFree(x, y, 50)) continue; const p = V(x, y); const g = new THREE.Group(); const h = rr(0.7, 1.3);
      const stone = stylized({ color: M.theme === 'lava' ? 0x4a3a38 : 0x5f8f99, roughness: 0.75, flatShading: true }, MAPS[i].rune, 0.4, 2.4);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, h, 8), stone); shaft.position.y = h / 2; g.add(shaft);
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.014, 6, 20), glowMat(MAPS[i].rune, 2.2)); band.rotation.x = Math.PI / 2; band.position.y = h * 0.6; g.add(band);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.12, 8), stone); base.position.y = 0.06; g.add(base); g.rotation.z = rr(-0.08, 0.08);
      g.position.copy(p); world.add(g); const b = blob(0.9); b.position.set(p.x, 0.02, p.z); world.add(b); k++; } }
}

// ---------- light shafts and ambient motes ----------
const shaftMat = new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  vertexShader: 'varying vec2 vUv; varying float vSeed; void main(){ vUv=uv; vSeed = modelMatrix[3].x*0.37 + modelMatrix[3].z*0.11; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader: `uniform float uTime; varying vec2 vUv; varying float vSeed; void main(){ float edge = smoothstep(0.0, 0.5, vUv.x) * smoothstep(1.0, 0.5, vUv.x);
    float v = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.6, vUv.y); float flick = 0.55 + 0.45 * sin(uTime * 0.6 + vSeed * 6.0);
    gl_FragColor = vec4(vec3(0.16, 0.4, 0.45) * edge * edge * v * flick * 0.22, 1.0); }` });
for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(rr(0.8, 1.8), 16), shaftMat); m.position.set(rr(-5, 5), 6, rr(-8, 6)); m.rotation.set(0, rr(-0.4, 0.4), 0.45); scene.add(m); }
function motes(count, color, size, rise) {
  const g = new THREE.BufferGeometry(); const p = new Float32Array(count * 3), s = new Float32Array(count);
  for (let i = 0; i < count; i++) { p[i * 3] = rr(-7, 7); p[i * 3 + 1] = rr(0, 5); p[i * 3 + 2] = rr(-9, 9); s[i] = rr(0.4, 1); }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aS', new THREE.BufferAttribute(s, 1));
  const m = new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uC: { value: new THREE.Color(color) }, uSize: { value: size }, uRise: { value: rise }, uScale: { value: innerHeight * DPR * 0.5 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `uniform float uTime, uSize, uRise, uScale; attribute float aS; varying float vA; void main(){ vec3 p = position; p.y = mod(p.y + uTime * uRise * aS, 5.0);
      p.x += sin(uTime * 0.5 + position.z) * 0.3; p.z += cos(uTime * 0.4 + position.x) * 0.3; vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_PointSize = uSize * aS * uScale / -mv.z;
      vA = smoothstep(0.0, 0.6, p.y) * smoothstep(5.0, 3.5, p.y) * (0.5 + 0.5 * sin(uTime * 2.0 + position.x * 3.0)); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uC; varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); a *= a; gl_FragColor = vec4(uC * a * vA, 1.0); }` });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; scene.add(pts); return m;
}
const moteMats = [motes(380, 0x7fdcef, 0.07, 0.15), motes(60, 0xbff4ff, 0.12, 0.6)];

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
