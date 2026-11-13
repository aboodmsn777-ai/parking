// Renderer + post stack: bloom -> tone map -> film pass (CA, vignette, grain, cold grade, fades).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export const TIERS = {
  low: { scale: 0.7, maxDpr: 1, bloom: false, shadows: false, samples: 0 },
  medium: { scale: 1, maxDpr: 1.25, bloom: true, shadows: false, samples: 0 },
  high: { scale: 1, maxDpr: 1.75, bloom: true, shadows: true, samples: 4 },
};
const FilmShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uCA: { value: 0.26 }, uGrain: { value: 0.055 }, uVig: { value: 0.62 }, uFade: { value: 1 }, uFlash: { value: 0 }, uTint: { value: new THREE.Color(1, 1, 1) }, uWarp: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime,uCA,uGrain,uVig,uFade,uFlash,uWarp; uniform vec3 uTint; varying vec2 vUv;
    float hash(vec2 p){ vec3 q=fract(vec3(p.xyx)*.1031); q+=dot(q,q.yzx+33.33); return fract((q.x+q.y)*q.z); }
    void main(){
      vec2 d=vUv-.5; float r2=dot(d,d); vec2 uv=vUv+d*r2*uWarp;
      vec2 off=d*(r2*.06*uCA+.0012*uCA);
      vec3 c=vec3(texture2D(tDiffuse,uv+off).r,texture2D(tDiffuse,uv).g,texture2D(tDiffuse,uv-off).b);
      float l=dot(c,vec3(.299,.587,.114));
      c=mix(vec3(l),c,.86); c*=vec3(.955,1.0,1.035); c+=vec3(.0,.006,.012)*(1.-l);
      c=mix(c,c*c*(3.-2.*c),.22);
      c*=1.-uVig*smoothstep(.08,.62,r2);
      float n=hash(gl_FragCoord.xy+fract(uTime)*917.); c+=(n-.5)*uGrain*(1.15-l);
      c=mix(c*uFade,uTint,uFlash);
      gl_FragColor=vec4(c,1.0);
    }`,
};

export function createGfx(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x030405); scene.fog = new THREE.FogExp2(0x05080a, 0.034);
  const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 90); camera.rotation.order = 'YXZ'; scene.add(camera);
  const gfx = { renderer, scene, camera, tier: 'high', film: null, composer: null, bloom: null };
  const film = gfx.film = new ShaderPass(FilmShader);
  function build() {
    const t = TIERS[gfx.tier], dpr = Math.min(window.devicePixelRatio || 1, t.maxDpr) * t.scale;
    const w = Math.max(2, Math.floor(window.innerWidth * dpr)), h = Math.max(2, Math.floor(window.innerHeight * dpr));
    renderer.setPixelRatio(1); renderer.setSize(w, h, false);
    gfx.composer?.dispose();
    const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, stencilBuffer: true, samples: t.samples });
    const comp = gfx.composer = new EffectComposer(renderer, rt);
    comp.addPass(new RenderPass(scene, camera));
    if (t.bloom) { gfx.bloom = new UnrealBloomPass(new THREE.Vector2(w / 2, h / 2), 0.2, 0.6, 1.0); comp.addPass(gfx.bloom); }
    comp.addPass(new OutputPass()); comp.addPass(film);
    camera.aspect = window.innerWidth / window.innerHeight;
    // keep horizontal FOV comfortable on portrait phones
    camera.fov = camera.aspect < 1 ? 86 : 70; camera.updateProjectionMatrix();
  }
  gfx.setTier = (name) => { gfx.tier = name; build(); return TIERS[name]; };
  gfx.resize = build;
  gfx.render = (t) => { film.uniforms.uTime.value = t; gfx.composer.render(); };
  build();
  return gfx;
}
