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
// ---------- utilities ----------
let seed = 20261119;
const rand = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const rr = (a, b) => a + (b - a) * rand();
const ri = (a, b) => Math.floor(rr(a, b + 1));
const pick = a => a[Math.floor(rand() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
function hash3(x, y, z) { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  let r = 0;
  for (let dx = 0; dx < 2; dx++) for (let dy = 0; dy < 2; dy++) for (let dz = 0; dz < 2; dz++) {
    r += hash3(xi + dx, yi + dy, zi + dz) * (dx ? u : 1 - u) * (dy ? v : 1 - v) * (dz ? w : 1 - w);
  }
  return r;
}
const fbm3 = (x, y, z) => vnoise(x, y, z) * 0.55 + vnoise(x * 2.1, y * 2.1, z * 2.1) * 0.3 + vnoise(x * 4.3, y * 4.3, z * 4.3) * 0.15;

// ---------- renderer ----------
const host = document.getElementById('game');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
} catch (e) {
  document.body.insertAdjacentHTML('beforeend', '<div id="err">Trình duyệt này không bật được WebGL. Hãy mở bằng Chrome hoặc Safari bản mới.</div>');
  throw e;
}
let DPR = Math.min(window.devicePixelRatio || 1, 2);
renderer.setPixelRatio(DPR);
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
host.appendChild(renderer.domElement);

const FOG = new THREE.Color(0x06262e);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x072c35);
scene.fog = new THREE.FogExp2(FOG, 0.022);

const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.5, 120);

// environment map for metal shine
{
  const envScene = new THREE.Scene();
  const g = new THREE.SphereGeometry(10, 32, 16);
  const cols = [], pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 10;
    const c = new THREE.Color().setRGB(0.02, 0.12, 0.16).lerp(new THREE.Color(1.6, 2.4, 2.6), clamp(y * 0.9 + 0.2, 0, 1) ** 2);
    cols.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  envScene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const spot = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 7, 7) }));
  spot.position.set(3, 8, 2); envScene.add(spot);
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(envScene, 0.02).texture;
  pm.dispose();
}

const hemi = new THREE.HemisphereLight(0x8fefff, 0x0a2c36, 1.4); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xc8f7ff, 2.4);
sun.position.set(-6, 14, 4);
scene.add(sun);
const heroLight = new THREE.PointLight(0x5ab8ff, 4, 7, 1.6);
scene.add(heroLight);

const U = { uTime: { value: 0 } };

// stylized standard material: adds a coloured rim light
function stylized(params, rim = 0x7fefff, rimStr = 0.5, rimPow = 2.6) {
  const m = new THREE.MeshStandardMaterial(params);
  m.userData.u = { uRim: { value: new THREE.Color(rim) }, uRimStr: { value: rimStr }, uRimPow: { value: rimPow } };
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, m.userData.u);
    s.fragmentShader = 'uniform vec3 uRim; uniform float uRimStr; uniform float uRimPow;\n' + s.fragmentShader.replace('#include <opaque_fragment>',
      `{ float fr = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), uRimPow);
         outgoingLight += uRim * fr * uRimStr; }
       #include <opaque_fragment>`);
  };
  return m;
}

// ---------- seabed ----------
const NOISE_GLSL = `
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),u.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*n2(p); p=p*2.03+vec2(1.7,9.2); a*=0.5; } return v; }
float caustic(vec2 uv, float t){
  vec2 p = uv * 6.2831 - 250.0; vec2 i = p; float c = 1.0; float inten = 0.005;
  for (int n = 0; n < 4; n++) {
    float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
  }
  c /= 4.0; c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.0);
}`;
const groundMat = new THREE.ShaderMaterial({
  uniforms: { uTime: U.uTime, uHero: { value: new THREE.Vector3() }, uFog: { value: FOG }, uFogD: { value: 0.022 }, uSA: { value: new THREE.Vector3(0.045, 0.13, 0.15) }, uSB: { value: new THREE.Vector3(0.17, 0.30, 0.29) }, uPt: { value: new THREE.Vector3(0.03, 0.10, 0.13) }, uCa: { value: new THREE.Vector3(0.25, 0.75, 0.85) }, uHg: { value: new THREE.Vector3(0.08, 0.22, 0.6) }, uSpk: { value: 0 } },
  vertexShader: `varying vec3 vW; varying float vD;
    void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vec4 mv = viewMatrix * w; vD = -mv.z; gl_Position = projectionMatrix * mv; }`,
  fragmentShader: NOISE_GLSL + `
    uniform float uTime; uniform vec3 uHero; uniform vec3 uFog; uniform float uFogD; uniform vec3 uSA, uSB, uPt, uCa, uHg; uniform float uSpk;
    varying vec3 vW; varying float vD;
    void main(){
      vec2 p = vW.xz;
      float n = fbm(p * 0.18);
      float warp = fbm(p * 0.07 + 4.0);
      float rip = sin(p.x * 1.9 + p.y * 0.55 + warp * 9.0) * 0.5 + 0.5;
      rip = smoothstep(0.62, 1.0, rip) * 0.9 + smoothstep(0.0, 0.35, rip) * -0.25;
      vec3 sandA = uSA;
      vec3 sandB = uSB;
      vec3 col = mix(sandA, sandB, smoothstep(0.25, 0.8, n));
      col *= 0.82 + 0.32 * rip;
      float grain = h21(floor(p * 40.0));
      col *= 0.94 + grain * 0.1;
      float patchN = fbm(p * 0.045 + 3.1);
      col = mix(col, uPt, smoothstep(0.5, 0.78, patchN) * 0.7);
      float c = caustic(p * 0.11, uTime * 0.55);
      float c2 = caustic(p * 0.23 + 3.0, uTime * 0.4);
      col += uCa * (c * 0.35 + c2 * 0.15) * (0.6 + 0.4 * n);
      float sp = h21(floor(p * 26.0)); col += uSpk * smoothstep(0.985, 1.0, sp) * (0.5 + 0.5 * sin(uTime * 3.0 + sp * 60.0)) * vec3(1.0, 0.98, 0.9);
      float d = length(p - uHero.xz);
      col += uHg * exp(-d * d * 0.12) * 0.8;
      float r = length(p);
      col *= mix(1.0, 0.25, smoothstep(24.0, 40.0, r));
      float f = 1.0 - exp(-uFogD * uFogD * vD * vD);
      gl_FragColor = vec4(mix(col, uFog, f), 1.0);
    }`
});
const ground = new THREE.Mesh(new THREE.CircleGeometry(80, 96).rotateX(-Math.PI / 2), groundMat);
scene.add(ground);

const colliders = [];
const world = new THREE.Group(); scene.add(world);
let PAL = null; // current map palette
const blobTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,0.75)'); g.addColorStop(0.55, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
})();
const blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.8 });
const blobGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
function blob(size) { const m = new THREE.Mesh(blobGeo, blobMat); m.scale.set(size, 1, size); m.position.y = 0.02; m.renderOrder = 1; return m; }

// ---------- rocks ----------
function rockGeo(r, h, jag) {
  const g = new THREE.IcosahedronGeometry(1, 3);
  const p = g.attributes.position, cols = [];
  const off = rr(0, 100);
  const rp = PAL ? PAL.rock : [0x4fae94, 0x1f5d63, 0x0b2a33, 0x9ff2d8]; const top = new THREE.Color(rp[0]), mid = new THREE.Color(rp[1]), low = new THREE.Color(rp[2]), tip = new THREE.Color(rp[3]);
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = fbm3(v.x * 1.6 + off, v.y * 1.6, v.z * 1.6);
    const spike = Math.pow(vnoise(v.x * 3 + off, v.y * 3, v.z * 3), 3) * jag;
    v.multiplyScalar(0.72 + n * 0.55 + spike);
    v.y = v.y < 0 ? v.y * 0.25 : v.y * h * (1 + spike * 0.6);
    v.x *= r; v.z *= r;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  const nrm = g.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    const ny = nrm.getY(i), y = p.getY(i);
    const c = low.clone().lerp(mid, clamp(y / (h * 0.6) + 0.3, 0, 1));
    c.lerp(top, clamp(ny * 1.3 - 0.2, 0, 1) * 0.85);
    if (y > h * 0.95) c.lerp(tip, 0.35);
    c.multiplyScalar(0.85 + vnoise(p.getX(i) * 4, y * 4, p.getZ(i) * 4) * 0.3);
    cols.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  return g;
}
const rockMat = stylized({ vertexColors: true, roughness: 0.85, metalness: 0.05, flatShading: true, envMapIntensity: 0.6 }, 0x6ff0ff, 0.35, 3.0);
function addRock(x, z, r, h, jag = 1.2, solid = true) {
  const m = new THREE.Mesh(rockGeo(r, h, jag), rockMat);
  m.position.set(x, 0, z); m.rotation.y = rr(0, 6.28);
  world.add(m);
  const b = blob(r * 3.2); b.position.set(x, 0.02, z); world.add(b);
  if (solid) colliders.push({ x, z, r: r * 0.95 });
  return m;
}

// ---------- coral ----------
function coralBranches(len, rad, depth, color, tipColor) {
  const parts = [], tips = [];
  const grow = (base, dir, l, r, d) => {
    const g = new THREE.CylinderGeometry(r * 0.7, r, l, 7, 1);
    g.translate(0, l / 2, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    g.applyQuaternion(q); g.translate(base.x, base.y, base.z);
    parts.push(g);
    const end = base.clone().addScaledVector(dir, l);
    const s = new THREE.SphereGeometry(r * 0.9, 8, 6); s.translate(end.x, end.y, end.z); parts.push(s);
    if (d <= 0) { tips.push(end); return; }
    const n = ri(2, 3);
    for (let i = 0; i < n; i++) {
      const nd = dir.clone().add(new THREE.Vector3(rr(-0.75, 0.75), rr(0.1, 0.6), rr(-0.75, 0.75))).normalize();
      grow(end, nd, l * rr(0.6, 0.8), r * 0.72, d - 1);
    }
  };
  for (let i = 0; i < 3; i++) grow(new THREE.Vector3(rr(-0.2, 0.2), 0, rr(-0.2, 0.2)), new THREE.Vector3(rr(-0.4, 0.4), 1, rr(-0.4, 0.4)).normalize(), len, rad, depth);
  const geo = mergeGeometries(parts.map(g => g.index ? g.toNonIndexed() : g));
  const grp = new THREE.Group();
  grp.add(new THREE.Mesh(geo, stylized({ color, roughness: 0.6, emissive: color, emissiveIntensity: 0.25 }, tipColor, 0.7, 2.2)));
  const tipGeo = mergeGeometries(tips.map(t => new THREE.SphereGeometry(rad * 0.75, 8, 6).translate(t.x, t.y, t.z)));
  grp.add(new THREE.Mesh(tipGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(tipColor).multiplyScalar(1.7) })));
  return grp;
}
function tubeSponge(color) {
  const grp = new THREE.Group();
  const mat = stylized({ color, roughness: 0.7, side: THREE.DoubleSide, emissive: color, emissiveIntensity: 0.15 }, 0xffe28a, 0.6);
  const glow = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(2.6), side: THREE.DoubleSide });
  for (let i = 0; i < ri(3, 5); i++) {
    const h = rr(0.6, 1.4), r = rr(0.12, 0.2);
    const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.8, h, 12, 1, true), mat);
    t.position.set(rr(-0.35, 0.35), h / 2, rr(-0.35, 0.35)); t.rotation.set(rr(-0.2, 0.2), 0, rr(-0.2, 0.2));
    const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.025, 6, 16), glow);
    rim.rotation.x = Math.PI / 2; rim.position.y = h / 2; t.add(rim);
    grp.add(t);
  }
  return grp;
}
function seaFan(color) {
  // flat lattice fan made of thin branches
  const parts = [];
  const grow = (x, y, ang, l, d) => {
    const ex = x + Math.cos(ang) * l, ey = y + Math.sin(ang) * l;
    const g = new THREE.CylinderGeometry(0.018 + d * 0.006, 0.024 + d * 0.008, l, 4); g.translate(0, l / 2, 0);
    g.rotateZ(ang - Math.PI / 2); g.translate(x, y, 0); parts.push(g.index ? g.toNonIndexed() : g);
    if (d <= 0) return;
    grow(ex, ey, ang + rr(0.25, 0.5), l * 0.78, d - 1);
    grow(ex, ey, ang - rr(0.25, 0.5), l * 0.78, d - 1);
  };
  grow(0, 0, Math.PI / 2, 0.5, 5);
  return new THREE.Mesh(mergeGeometries(parts), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.7), side: THREE.DoubleSide }));
}

// ---------- seaweed (instanced, vertex sway) ----------
function addSeaweed(cx, cz, count, spread) {
  const geo = new THREE.PlaneGeometry(0.22, 1, 1, 10); geo.translate(0, 0.5, 0);
  const mat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.6, emissive: PAL ? PAL.weedE : 0x0c3d2a, emissiveIntensity: 0.6 });
  mat.onBeforeCompile = (s) => {
    s.uniforms.uTime = U.uTime;
    s.vertexShader = 'uniform float uTime;\n' + s.vertexShader.replace('#include <begin_vertex>', `
      vec3 transformed = vec3(position);
      float ph = instanceMatrix[3].x * 0.7 + instanceMatrix[3].z * 0.45;
      float k = pow(position.y, 1.6);
      transformed.x += sin(uTime * 1.3 + ph + position.y * 2.2) * 0.35 * k;
      transformed.z += cos(uTime * 1.1 + ph * 1.3 + position.y * 1.7) * 0.22 * k;
      transformed.x *= 1.0 - position.y * 0.55;`);
  };
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
  const palette = PAL ? PAL.weed : [0x2f9e6e, 0x4fc48a, 0x1f7a6a, 0x7ad19a, 0x3fb3a0];
  for (let i = 0; i < count; i++) {
    const a = rr(0, 6.28), d = Math.sqrt(rand()) * spread;
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rr(0, 6.28));
    const h = rr(1.2, 3.2) * (PAL ? PAL.weedH : 1);
    m4.compose(new THREE.Vector3(cx + Math.cos(a) * d, 0, cz + Math.sin(a) * d), q, new THREE.Vector3(rr(0.8, 1.4), h, 1));
    mesh.setMatrixAt(i, m4);
    mesh.setColorAt(i, c.set(pick(palette)));
  }
  world.add(mesh);
}

// ---------- ruins: an original broken gate with glowing runes ----------
function addGate(x, z, rotY) {
  const g = new THREE.Group();
  const stone = stylized({ color: PAL ? PAL.stone : 0x5f8f99, roughness: 0.75, metalness: 0.1, flatShading: true }, PAL ? PAL.rune : 0x8ff6ff, 0.45, 2.4);
  const rune = new THREE.MeshBasicMaterial({ color: new THREE.Color(PAL ? PAL.rune : 0x6fe7ff).multiplyScalar(3.0) });
  const pillar = (px, h, tilt) => {
    const p = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, h, 8), stone); shaft.position.y = h / 2; p.add(shaft);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.5, 8), stone); base.position.y = 0.25; p.add(base);
    for (let k = 0; k < 3; k++) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.045, 6, 24), rune);
      band.rotation.x = Math.PI / 2; band.position.y = 1.2 + k * 1.35; p.add(band);
    }
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.6, 0.45, 8), stone); cap.position.y = h + 0.2; p.add(cap);
    p.position.x = px; p.rotation.z = tilt; g.add(p);
    colliders.push({ x: x + Math.cos(rotY) * px, z: z - Math.sin(rotY) * px, r: 1.0 });
  };
  pillar(-3.2, 5.2, 0.03);
  pillar(3.2, 3.6, -0.06);
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.7, 1.1), stone);
  lintel.position.set(-1.2, 5.6, 0); lintel.rotation.z = -0.12; g.add(lintel);
  const fallen = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.65, 1.0), stone);
  fallen.position.set(3.6, 0.33, 1.6); fallen.rotation.set(0, 0.7, 0.05); g.add(fallen);
  // portal glow between pillars
  const portal = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 5.4), new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime, uC1: { value: new THREE.Color(PAL ? PAL.portal[0] : 0x0d5a99) }, uC2: { value: new THREE.Color(PAL ? PAL.portal[1] : 0x66f2ff) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: `uniform float uTime; uniform vec3 uC1, uC2; varying vec2 vUv;
      void main(){ vec2 p = vUv - vec2(0.5, 0.42); float r = length(p * vec2(1.0, 0.8));
        float a = atan(p.y, p.x);
        float swirl = sin(a * 5.0 - uTime * 1.6 + r * 18.0) * 0.5 + 0.5;
        float m = smoothstep(0.48, 0.05, r);
        vec3 col = mix(uC1, uC2, swirl * m);
        gl_FragColor = vec4(col * m * (0.35 + 0.35 * swirl), 1.0); }`
  }));
  portal.position.set(0, 2.6, 0); g.add(portal);
  g.position.set(x, 0, z); g.rotation.y = rotY;
  world.add(g);
  const b = blob(9); b.position.set(x, 0.02, z); world.add(b);
}

// ---------- light shafts ----------
const shaftMat = new THREE.ShaderMaterial({
  uniforms: { uTime: U.uTime, uC: { value: new THREE.Vector3(0.16, 0.4, 0.45) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  vertexShader: 'varying vec2 vUv; varying float vSeed; void main(){ vUv=uv; vSeed = modelMatrix[3].x*0.37 + modelMatrix[3].z*0.11; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader: `uniform float uTime; uniform vec3 uC; varying vec2 vUv; varying float vSeed;
    void main(){ float edge = smoothstep(0.0, 0.5, vUv.x) * smoothstep(1.0, 0.5, vUv.x);
      float v = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.6, vUv.y);
      float flick = 0.55 + 0.45 * sin(uTime * 0.6 + vSeed * 6.0);
      gl_FragColor = vec4(uC * edge * edge * v * flick * 0.28, 1.0); }`
});
const shafts = new THREE.Group();
for (let i = 0; i < 9; i++) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(rr(1.5, 3.5), 26), shaftMat);
  m.position.set(rr(-12, 12), 9, rr(-14, 8));
  m.rotation.set(0, rr(-0.4, 0.4), 0.45);
  shafts.add(m);
}
scene.add(shafts);

// ---------- ambient motes ----------
function motes(count, area, color, size, rise) {
  const g = new THREE.BufferGeometry();
  const p = new Float32Array(count * 3), s = new Float32Array(count);
  for (let i = 0; i < count; i++) { p[i * 3] = rr(-area, area); p[i * 3 + 1] = rr(0, 9); p[i * 3 + 2] = rr(-area, area); s[i] = rr(0.4, 1); }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  g.setAttribute('aS', new THREE.BufferAttribute(s, 1));
  const m = new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime, uC: { value: new THREE.Color(color) }, uSize: { value: size }, uRise: { value: rise }, uScale: { value: innerHeight * DPR * 0.5 }, uCenter: { value: new THREE.Vector3() } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `uniform float uTime, uSize, uRise, uScale; uniform vec3 uCenter; attribute float aS; varying float vA;
      void main(){ vec3 p = position;
        p.y = mod(p.y + uTime * uRise * aS, 9.0);
        p.x += sin(uTime * 0.5 + position.z) * 0.4; p.z += cos(uTime * 0.4 + position.x) * 0.4;
        p.xz = uCenter.xz + mod(p.xz - uCenter.xz + ${area.toFixed(1)}, ${(area * 2).toFixed(1)}) - ${area.toFixed(1)};
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize * aS * uScale / -mv.z;
        vA = smoothstep(0.0, 1.0, p.y) * smoothstep(9.0, 6.0, p.y) * (0.5 + 0.5 * sin(uTime * 2.0 + position.x * 3.0));
        gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uC; varying float vA;
      void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); a *= a; gl_FragColor = vec4(uC * a * vA, 1.0); }`
  });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; scene.add(pts);
  return m;
}
const moteMats = [motes(500, 18, 0x7fdcef, 0.12, 0.25), motes(90, 18, 0xbff4ff, 0.22, 1.1)];

// ---------- burst particle pool ----------
const PMAX = 900;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(PMAX * 3), pCol = new Float32Array(PMAX * 3), pSize = new Float32Array(PMAX), pAl = new Float32Array(PMAX);
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
pGeo.setAttribute('aC', new THREE.BufferAttribute(pCol, 3));
pGeo.setAttribute('aS', new THREE.BufferAttribute(pSize, 1));
pGeo.setAttribute('aA', new THREE.BufferAttribute(pAl, 1));
const pMat = new THREE.ShaderMaterial({
  uniforms: { uScale: { value: innerHeight * DPR * 0.5 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: `uniform float uScale; attribute vec3 aC; attribute float aS; attribute float aA; varying vec3 vC; varying float vA;
    void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aS * uScale / -mv.z; vC = aC; vA = aA; gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `varying vec3 vC; varying float vA;
    void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vC * a * a * vA, 1.0); }`
});
const pts = new THREE.Points(pGeo, pMat); pts.frustumCulled = false; scene.add(pts);
const parts = [];
for (let i = 0; i < PMAX; i++) parts.push({ life: 0, max: 1, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, r: 1, g: 1, b: 1, s: 0.2, drag: 1, grav: 0 });
let pCursor = 0;
function emit(x, y, z, vx, vy, vz, color, size, life, grav = 0, drag = 0.96) {
  const p = parts[pCursor]; pCursor = (pCursor + 1) % PMAX;
  Object.assign(p, { x, y, z, vx, vy, vz, life, max: life, s: size, grav, drag, r: color.r, g: color.g, b: color.b });
}
function burst(x, y, z, n, color, speed, size, life) {
  for (let i = 0; i < n; i++) {
    const a = rr(0, 6.28), e = rr(-0.3, 1.1), s = rr(0.3, 1) * speed;
    emit(x, y, z, Math.cos(a) * Math.cos(e) * s, Math.sin(e) * s, Math.sin(a) * Math.cos(e) * s, color, size * rr(0.6, 1.3), life * rr(0.6, 1.2), -1.5, 0.93);
  }
}
function updateParticles(dt) {
  for (let i = 0; i < PMAX; i++) {
    const p = parts[i];
    if (p.life > 0) {
      p.life -= dt;
      const k = Math.pow(p.drag, dt * 60);
      p.vx *= k; p.vy = p.vy * k + p.grav * dt; p.vz *= k;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    }
    const t = Math.max(0, p.life / p.max);
    pPos[i * 3] = p.x; pPos[i * 3 + 1] = p.y; pPos[i * 3 + 2] = p.z;
    pCol[i * 3] = p.r; pCol[i * 3 + 1] = p.g; pCol[i * 3 + 2] = p.b;
    pSize[i] = p.s * (0.4 + 0.6 * t); pAl[i] = p.life > 0 ? t : 0;
  }
  pGeo.attributes.position.needsUpdate = pGeo.attributes.aC.needsUpdate = pGeo.attributes.aS.needsUpdate = pGeo.attributes.aA.needsUpdate = true;
}
