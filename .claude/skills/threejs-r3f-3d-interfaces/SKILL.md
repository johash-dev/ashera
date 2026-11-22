---
name: threejs-r3f-3d-interfaces
description: Build detailed, beautiful and fast 3D web interfaces with three.js and React Three Fiber (R3F) — robots and characters, isometric 3D worlds and dioramas, 3D rooms and interiors, product/hero objects. Use this skill whenever the task mentions three.js, R3F, @react-three/fiber, drei, WebGL, WebGPU, a <Canvas>, glTF/GLB models, a 3D scene, 3D website, low-poly or isometric art, a 3D room, a robot model, or asks to improve how an existing 3D scene looks or performs — even if the user never says "three.js". Also use it when the user uploads a previous version of this file to continue a multi-session project.
version: 1.0.0
last_updated: 2026-11-22
---

# three.js + React Three Fiber: detailed, beautiful, efficient 3D interfaces

This file is BOTH a skill and a hand-off document. It is improved one session at a time.

## ASHERA overrides (read first; these win over everything below)

This is a generic reference. In this repo `CLAUDE.md`, `docs/r3f.md` and the ADRs come first.

- **Skip §0 and §14.** Do not rewrite this file, bump its version or log sessions. Do not ask the owner about stack, devices or art style: PC browser only, React + R3F + Vite + TypeScript, dark premium look (see `docs/concept.md`).
- **New dependencies are a one-way door.** `@react-three/postprocessing`, `maath`, `@react-three/rapier`, `gltfjsx` etc. need an ADR and the owner's approval. Use what is installed: `three`, `@react-three/fiber`, `@react-three/drei`.
- **Units and placement:** 1 unit = 1 ft, +x east, +y up, +z south (ADR 0001). Sizes come from the Catalog, never typed into components. Detail stays inside the Item's own size box.
- **Draw-call budget is < 100 per View** (e2e-enforced), and today's Views use 48–75. Merge or instance repeated parts before adding meshes; one shared material per look.
- **Skip what does not fit:** mobile tuning, robots/characters, isometric worlds, product hero shots, glTF pipeline, WebGPU. The room recipes (§8), core rules (§4), materials (§5.8) and the checklist (§11) apply. Check the render settings already in `SceneCanvas.tsx` before applying §3's starter (it is a reference, not a template).
- **Simplest thing that works:** bevels, post-processing, shadows and environment lighting only where a before/after screenshot shows a clear gain at the budget.

## 0. Session protocol (generic; skipped in ASHERA, see above)

1. **Read this whole file**, then read §13 (Session log) and §14 (Open questions / next steps). They tell you where the last agent stopped.
2. **Re-check versions** (§1) if `last_updated` is more than ~30 days old: `npm view three version`, `npm view @react-three/fiber dist-tags`, `npm view @react-three/drei dist-tags`. three.js releases every 7–11 weeks and renames APIs; do not trust memory.
3. Do the session's work (research, recipes, fixes, test scenes).
4. **Write back ONE updated file** with the same name (`SKILL.md`): bump `version` (minor for new sections, patch for fixes), update `last_updated`, append a §13 entry, rewrite §14. Never delete verified content without saying why in the log.
5. Keep the file agent-friendly: imperative rules, copy-pasteable code, short "why" notes, no marketing prose. Keep SKILL.md under ~700 lines; if it grows past that, move long recipes into `references/*.md` and leave a pointer here.
6. When talking to the user, explain choices simply (they may not be a 3D expert). Ask at most one question at a time, and only when the answer changes what you build.

## 1. Version snapshot (verified 2026-11-22 via npm registry)

| Package                       | Stable (`latest`)                     | Notes                                                                            |
| ----------------------------- | ------------------------------------- | -------------------------------------------------------------------------------- |
| `three`                       | **0.187.0** (r187, 2026-10-30)        | Releases every 7–11 weeks. Read the Migration Guide before upgrading.            |
| `@react-three/fiber`          | **9.8.2**                             | Peer deps: `react >=19 <19.4`, `three >=0.156`. v10 is `alpha` (10.0.0-alpha.6). |
| `@react-three/drei`           | **10.7.9**                            | v11 is `alpha`.                                                                  |
| `@react-three/postprocessing` | 3.2.2 (wraps `postprocessing` 6.39.x) | **WebGL only.**                                                                  |
| `@react-three/rapier`         | 2.2.0                                 | Physics, for R3F 9 / React 19.                                                   |
| `maath`                       | 0.10.8                                | Damping/easing helpers (`easing.damp3`, etc.).                                   |
| `@gltf-transform/cli`         | 4.5.1                                 | Model optimization CLI.                                                          |
| `gltfjsx`                     | 6.5.3                                 | GLB → typed JSX component.                                                       |
| `react`                       | 19.3.1                                | Fine with R3F 9.8 (cap is <19.4).                                                |

**Default stack for new work:** React 19 + R3F 9.8 + drei 10.7 + three 0.187 + WebGLRenderer. Do NOT move a project to R3F v10 / drei v11 alphas unless the user asks.

**R3F v10 (alpha, watch this):** WebGPU becomes the default renderer; the WebGL canvas moves to `@react-three/fiber/legacy`; TSL hooks move to a new `@react-three/tsl` package; needs `three >=0.185` and `React >=19 <19.4`. Expect breaking changes before beta.

### API changes agents get wrong (three r182–r187)

- `Clock` is deprecated (r183) → use `THREE.Timer` (`timer.update(t); timer.getDelta()`).
- `PostProcessing` (WebGPU) renamed `RenderPipeline` (r183).
- `PCFSoftShadowMap` removed (r186): renderer warns and uses `PCFShadowMap`, which has been soft since r182. Re-tune `shadow.bias` after upgrading.
- r186 reworked PBR energy conservation and r187 rebuilt PMREM env maps; materials look slightly different after upgrading — compare screenshots.
- Minified builds removed; `require('three')` is deprecated. Use ES modules.
- `MeshProps` etc. are gone in R3F 9 → use `ThreeElements['mesh']`. Custom elements: `declare module '@react-three/fiber' { interface ThreeElements { … } }`.
- drei 10 removed `<Reflector>` → use `<MeshReflectorMaterial>`.
- three.js ships `https://threejs.org/llms.txt` (since r183): fetch it when you need current API docs.

## 2. Choose the renderer (decision tree)

```
Need custom shaders / compute / 100k+ particles / huge draw-call counts?
├─ No  → WebGLRenderer (R3F default). Most robust, works with all of drei and @react-three/postprocessing.
└─ Yes → WebGPURenderer (three/webgpu) + TSL node materials. Falls back to WebGL 2 automatically.
         Costs: no ShaderMaterial/onBeforeCompile, no @react-three/postprocessing, parts of drei
         (e.g. MeshTransmissionMaterial, AccumulativeShadows) are GLSL-based. Profile: WebGPU is
         not faster for every scene.
```

R3F 9 + WebGPU (async `gl` factory):

```jsx
import * as THREE from 'three/webgpu'
import { Canvas, extend } from '@react-three/fiber'
extend(THREE) // register node materials etc. as JSX elements
<Canvas gl={async (props) => { const r = new THREE.WebGPURenderer(props); await r.init(); return r }}>
```

## 3. Golden starter (WebGL, copy this)

```jsx
import * as THREE from 'three';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Environment,
  ContactShadows,
  OrbitControls,
  AdaptiveDpr,
  Preload,
  useProgress,
  Html,
} from '@react-three/drei';

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(0)}%</Html>;
}

export default function App() {
  return (
    <Canvas
      shadows="percentage" // PCFShadowMap. `shadows` (true) = PCFSoftShadowMap → warns on three ≥0.186
      dpr={[1, 2]} // cap pixel ratio: 3x phones cost 9x pixels
      camera={{ position: [4, 3, 6], fov: 35, near: 0.1, far: 100 }}
      gl={{ antialias: true, toneMapping: THREE.AgXToneMapping }} // R3F default is ACESFilmic; AgX keeps saturated colors
      // frameloop="demand"             // use for static scenes; call invalidate() after changes
    >
      <color attach="background" args={['#e9e6f2']} />
      <Suspense fallback={<Loader />}>
        <Scene />
        <Environment preset="city" environmentIntensity={0.8} /> {/* reflections + soft ambient */}
        <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={12} blur={2.5} far={4} />
        <Preload all />
      </Suspense>
      <directionalLight
        position={[5, 8, 4]}
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <OrbitControls makeDefault enableDamping minPolarAngle={0.3} maxPolarAngle={Math.PI / 2.1} />
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
```

Notes: drei `Environment` presets load HDRIs from a CDN. For production or offline, ship your own small `.hdr` (1k is enough for lighting) via `files="/env.hdr"`, or build one from `<Lightformer>`s (§5). Put `<Canvas>` in a parent with explicit height (`height: 100vh` or a fixed px height) or nothing renders.

## 4. Core R3F rules (performance + correctness)

1. **Animate with refs in `useFrame`, never `setState` per frame.** React re-renders 60×/s otherwise.
   ```jsx
   const ref = useRef();
   useFrame((_, dt) => {
     ref.current.rotation.y += dt * 0.5;
   });
   ```
2. **Use `delta`** for frame-rate independence; clamp it (`Math.min(dt, 0.1)`) so tab-switches don't teleport things.
3. **Never allocate in `useFrame`** (`new Vector3()` etc.). Create once with `useMemo`/module scope and reuse.
4. **Smooth motion:** `maath` → `easing.damp3(ref.current.position, target, 0.25, dt)` or `THREE.MathUtils.damp(a, b, lambda, dt)`. Frame-rate independent, unlike raw lerp.
5. **Toggle `visible` instead of mount/unmount.** Mounting recompiles shaders and re-uploads buffers.
6. **Share geometries and materials.** One material instance per look, reused across meshes (`useMemo` or module scope).
7. **Many copies of one thing → instancing.** drei `<Instances>/<Instance>` (convenient, up to ~thousands) or raw `<instancedMesh args={[geo, mat, count]}>` + `setMatrixAt` (fastest). Different geometries, same material → `THREE.BatchedMesh`. Static clutter → merge (`BufferGeometryUtils.mergeGeometries`).
8. **Budget:** ~100 draw calls and ~100k–300k triangles for mobile; desktop handles several hundred calls. Check `gl.info.render.calls` / `triangles`, or `<Perf />` from `r3f-perf` (WebGL only).
9. **Static scenes:** `frameloop="demand"`; static shadows: `<BakeShadows />` (drei) or `light.shadow.autoUpdate = false`.
10. **Adaptive quality:** `<PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(2)} flipflops={3} />` drive dpr, shadow size, post effects.
11. **Load with Suspense:** `useGLTF`, `useTexture` suspend; wrap in `<Suspense>`; call `useGLTF.preload(url)` at module scope.
12. **Fast fixed-state reads:** read zustand stores inside `useFrame` with `useStore.getState()`, not selectors that re-render.
13. **Raycasting heavy meshes:** wrap in drei `<Bvh>`.
14. **Dispose** what you create manually (geometries, materials, textures, render targets) in `useEffect` cleanup. R3F auto-disposes JSX-created objects on unmount, not objects passed via `<primitive>`.

## 5. The "beautiful" recipe (applies to every scene type)

Good-looking real-time 3D is mostly lighting, color, and grounding — not polygon count. Apply in this order:

1. **Art direction first.** Pick a style (stylized low-poly, soft clay, realistic PBR, toon) and a palette of 3–5 colors + 1 accent. Avoid pure `#000` and `#fff`; use tinted darks and off-whites. Match background color to the fog/ground so the scene "sits" in space.
2. **Color management:** keep R3F defaults (sRGB output, linear workflow). Textures holding color (`map`, `emissiveMap`) must be `SRGBColorSpace` (useTexture/glTF do this); data maps (normal, roughness, AO) stay linear.
3. **Tone mapping:** ACESFilmic (R3F default) or **AgX** (better for saturated stylized colors). `flat` = none, only for unlit/flat-color art. Pair with `<Environment>`; tune `environmentIntensity` (0.4–1.2).
4. **Image-based lighting is mandatory for metal/glossy surfaces.** Metallic materials with no environment look black. Use `Environment preset` or custom Lightformers:
   ```jsx
   <Environment resolution={256}>
     <Lightformer form="rect" intensity={3} position={[0, 5, -5]} scale={[10, 3, 1]} /> {/* big soft key */}
     <Lightformer
       form="ring"
       intensity={2}
       color="#ffd9b3"
       position={[-5, 2, 2]}
       scale={3}
       onUpdate={(s) => s.lookAt(0, 0, 0)}
     />
     <Lightformer intensity={1} color="#9ec5ff" position={[5, 1, 2]} scale={[2, 5, 1]} /> {/* cool rim */}
   </Environment>
   ```
5. **One key light with shadows, everything else soft.** One `directionalLight` (sun/key) casting shadows + environment for fill. Keep ≤3 dynamic lights. Fit the shadow camera tightly to the scene (bigger frustum = blurrier shadows). PointLight shadows cost 6 renders each — avoid.
6. **Ground every object.** `<ContactShadows>` (cheap, dynamic), `<AccumulativeShadows temporal frames={60}><RandomizedLight …/></AccumulativeShadows>` (beautiful soft static shadows on a ground plane, WebGL), or baked AO. Floating objects read as fake.
7. **Bevel edges.** Real objects catch light on edges. Use drei `<RoundedBox args={[w,h,d]} radius={0.05} smoothness={4}>`, `capsuleGeometry`, or bevelled models. Sharp CG boxes look cheap.
8. **Materials:**
   - Painted plastic/clay: `meshStandardMaterial roughness 0.5–0.8, metalness 0`.
   - Painted metal: `metalness 0.6–1, roughness 0.25–0.5` (+ environment).
   - Glossy coat / car paint / toys: `meshPhysicalMaterial clearcoat={1} clearcoatRoughness={0.1}`.
   - Glass: `meshPhysicalMaterial transmission={1} thickness={0.5} roughness={0.05} ior={1.5}` (or drei `MeshTransmissionMaterial`, expensive).
   - Glowing parts: `emissive` + `emissiveIntensity` 2–6 + `toneMapped={false}` so they cross the bloom threshold.
   - Stylized/toon: `meshToonMaterial` with a small `gradientMap` (NearestFilter), plus drei `<Outlines thickness={…} color="…" />`.
   - Flat low-poly: `meshStandardMaterial flatShading` or `meshLambertMaterial` (cheaper).
9. **Post-processing (WebGL, `@react-three/postprocessing`)** — subtle wins, heavy loses:
   ```jsx
   import { EffectComposer, Bloom, N8AO, SMAA, Vignette, ToneMapping } from '@react-three/postprocessing';
   <EffectComposer multisampling={0} enableNormalPass={false}>
     <N8AO aoRadius={0.5} intensity={1.5} halfRes /> {/* ambient occlusion: contact darkness in corners */}
     <Bloom mipmapBlur luminanceThreshold={1} intensity={0.6} />{' '}
     {/* only toneMapped={false} emissives bloom */}
     <Vignette offset={0.3} darkness={0.5} />
     <SMAA />
   </EffectComposer>;
   ```
   With an EffectComposer, AA from `gl.antialias` does not apply → use `SMAA`/`multisampling`. WebGPU: use three's `RenderPipeline` + TSL nodes (`bloom`, `ao`, `fxaa`/`smaa`, `traa` in `three/addons/tsl/display/`).
10. **Camera & composition:** Perspective `fov` 25–40 for objects/products (less distortion, more "premium"); 45–60 for walkable spaces; orthographic for isometric. Frame with rule of thirds; leave breathing room. drei `<Bounds fit clip observe margin={1.2}>` auto-frames content. Limit orbit (`minPolarAngle/maxPolarAngle`, `minDistance/maxDistance`) so users can't see under the floor or clip through walls.
11. **Life & motion:** gentle idle motion sells quality — drei `<Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>`, slow breathing scale, blinking lights, damped pointer-follow. Ease everything (`maath/easing`). Respect `prefers-reduced-motion`.
12. **Depth cues:** `<fog attach="fog" args={[bg, near, far]} />` matching the background; slight depth-of-field only for hero shots (expensive).

## 6. Recipe: robots and characters

**Two routes:**

- **Procedural (code-built)**: best for stylized/cute robots, UI mascots, fully controllable parts. No assets needed.
- **Modeled (Blender/glTF)**: best for realism or organic shapes. Rig in Blender, export GLB, convert with `gltfjsx`, animate with `useAnimations`.

**Procedural rules:**

1. **Build a joint hierarchy with groups.** Each joint is a `<group>` positioned at the pivot; children are offset so rotation happens around the joint. (Root → hips → torso → neck → head; torso → shoulder → upper arm → elbow → forearm → hand.)
2. **Shapes:** `RoundedBox` for body panels, `capsuleGeometry` for limbs, `sphereGeometry`/`cylinderGeometry` for joints, `torusGeometry` for rings, `Lathe`/`Extrude` for custom silhouettes. Add small details (bolts, seams, vents, antenna, panel lines via thin dark boxes) — detail density near the face/chest makes it feel crafted.
3. **3-material palette, shared:** body (painted metal/plastic), joints (dark metal, higher metalness), accent/emissive (eyes, chest light). Create materials once with `useMemo` and pass `material={…}` to meshes.
4. **Face = personality.** Emissive eyes (`toneMapped={false}`) + bloom; blink by scaling eye Y to 0.1 for ~120 ms every 3–6 s; head tracks the pointer with damping.
5. **Idle loop:** small sinusoidal bob, slight torso sway, offset phases per limb (`Math.sin(t*1.2 + phase)`), never perfectly synced.

```jsx
import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { easing } from 'maath';

export function Robot(props) {
  const root = useRef(),
    head = useRef(),
    armL = useRef(),
    armR = useRef(),
    eyes = useRef();
  const m = useMemo(
    () => ({
      body: new THREE.MeshPhysicalMaterial({
        color: '#f2efe9',
        roughness: 0.35,
        metalness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.15,
      }),
      joint: new THREE.MeshStandardMaterial({ color: '#2b2f3a', roughness: 0.4, metalness: 0.8 }),
      glow: new THREE.MeshStandardMaterial({
        color: '#000',
        emissive: '#4fd1ff',
        emissiveIntensity: 4,
        toneMapped: false,
      }),
    }),
    [],
  );
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock, pointer }, dt) => {
    const t = clock.elapsedTime;
    root.current.position.y = Math.sin(t * 1.5) * 0.04; // breathing bob
    armL.current.rotation.x = Math.sin(t * 1.2) * 0.15;
    armR.current.rotation.x = Math.sin(t * 1.2 + Math.PI) * 0.15; // opposite phase
    easing.dampE(head.current.rotation, [-pointer.y * 0.3, pointer.x * 0.5, 0], 0.2, dt); // look at cursor
    eyes.current.scale.y = t % 4 < 0.12 ? 0.1 : 1; // blink
  });
  return (
    <group ref={root} {...props}>
      <RoundedBox
        args={[1, 1.1, 0.7]}
        radius={0.15}
        smoothness={4}
        material={m.body}
        position={[0, 1, 0]}
        castShadow
      />
      <mesh material={m.glow} position={[0, 1.15, 0.36]}>
        <circleGeometry args={[0.12, 32]} />
      </mesh>
      <group ref={head} position={[0, 1.6, 0]}>
        {' '}
        {/* neck pivot */}
        <mesh material={m.joint} position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 0.15, 24]} />
        </mesh>
        <RoundedBox
          args={[0.9, 0.65, 0.7]}
          radius={0.2}
          smoothness={4}
          material={m.body}
          position={[0, 0.45, 0]}
          castShadow
        />
        <group ref={eyes} position={[0, 0.48, 0.36]}>
          <mesh material={m.glow} position={[-0.18, 0, 0]}>
            <capsuleGeometry args={[0.06, 0.08, 8, 16]} />
          </mesh>
          <mesh material={m.glow} position={[0.18, 0, 0]}>
            <capsuleGeometry args={[0.06, 0.08, 8, 16]} />
          </mesh>
        </group>
      </group>
      {[
        [-0.65, armL],
        [0.65, armR],
      ].map(([x, ref]) => (
        <group key={x} ref={ref} position={[x, 1.4, 0]}>
          {' '}
          {/* shoulder pivot */}
          <mesh material={m.joint}>
            <sphereGeometry args={[0.14, 24, 24]} />
          </mesh>
          <mesh material={m.body} position={[0, -0.4, 0]} castShadow>
            <capsuleGeometry args={[0.11, 0.5, 8, 16]} />
          </mesh>
        </group>
      ))}
      {[-0.25, 0.25].map((x) => (
        <mesh key={x} material={m.joint} position={[x, 0.25, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.3, 8, 16]} />
        </mesh>
      ))}
    </group>
  );
}
```

**Modeled route:** `npx gltfjsx robot.glb --transform --types` → generates a component plus an optimized `robot-transformed.glb` (resized textures, Draco/meshopt, merged materials). Animate: `const { actions } = useAnimations(animations, group); actions.Idle?.reset().fadeIn(0.3).play()`. Mixamo clips work for humanoids. For posing/aiming: rotate bones directly in `useFrame` after the mixer, or use `CCDIKSolver` (three/addons) for IK.

## 7. Recipe: isometric 3D worlds and dioramas

1. **Camera:** orthographic, looking from a (1,1,1) diagonal → classic isometric (yaw 45°, pitch ≈35.26°). `zoom` controls scale.
   ```jsx
   <Canvas orthographic shadows="percentage" camera={{ position: [20, 20, 20], zoom: 40, near: 0.1, far: 200 }}>
     <MapControls enableRotate={false} minZoom={20} maxZoom={120} screenSpacePanning />  {/* or OrbitControls with azimuth snapping */}
   ```
   For a "rotate in 90° steps" feel, animate the camera around the target with `easing.damp3` to the next corner; don't free-orbit.
2. **Grid-first world model.** Store the world as data (`tiles[x][z] = {type, height}`), render from data. 1 unit = 1 tile. Keep everything snapped to the grid; offset decorative props slightly and randomize rotation/scale (seeded RNG) for natural variety.
3. **Instancing per tile type.** One `instancedMesh` per (geometry, material) pair: grass tiles, water tiles, trees, rocks. A 64×64 map stays ~10–20 draw calls.
   ```jsx
   function Tiles({ positions, geometry, material }) {
     const ref = useRef(),
       o = useMemo(() => new THREE.Object3D(), []);
     useLayoutEffect(() => {
       positions.forEach(([x, y, z], i) => {
         o.position.set(x, y, z);
         o.updateMatrix();
         ref.current.setMatrixAt(i, o.matrix);
       });
       ref.current.instanceMatrix.needsUpdate = true;
       ref.current.computeBoundingSphere(); // otherwise frustum culling may hide the whole set
     }, [positions]);
     return (
       <instancedMesh ref={ref} args={[geometry, material, positions.length]} castShadow receiveShadow />
     );
   }
   ```
   Per-instance color: `setColorAt(i, color)` + `instanceColor.needsUpdate = true`.
4. **Diorama look:** floating island/plinth with a thick base (show the dirt/rock cross-section), soft sun from a high angle, `flatShading` low-poly, 4–6 color palette, ContactShadows or AccumulativeShadows under the plinth, pastel background, light fog. Water: transparent blue plane with gentle vertex wave or a scrolling normal map; keep transparency to few large surfaces.
5. **Shadows in ortho:** the directional light's shadow camera must cover the visible map; size it to the map bounds, not the default 10×10. Move the light with the camera target for large worlds, or use `CSM` (three/addons) / r186 `SunLight` addon for big maps.
6. **Interaction:** pointer events work on instanced meshes (`e.instanceId`). Highlight hovered tiles with a separate single "cursor" mesh instead of recoloring instances each move.
7. **Pixel-art variant:** low `dpr` (e.g. 0.5) + `gl={{ antialias:false }}` + CSS `image-rendering: pixelated` on the canvas, or a pixelation post pass.

## 8. Recipe: 3D rooms and interiors

1. **Cutaway "dollhouse" room** (best for portfolios/UI): floor + 2 walls (back & left) as thick `RoundedBox`/boxes, camera from the open corner (iso-ortho or perspective fov 30–35). Hide walls that face the camera when orbiting: in `useFrame`, compare `camera.position` to wall normals and fade/hide.
2. **Two quality tiers:**
   - **Real-time lit (fast to author):** Environment (indoor-ish preset `apartment`/`lobby` or Lightformers shaped like windows) + one directional "sun through window" light with a tight shadow camera + N8AO for corner darkness + ContactShadows under furniture. Warm key (`#ffd8a8`) vs cool fill (`#a8c8ff`) creates depth.
   - **Baked lighting (best realism, cheapest to render):** model in Blender, bake with Cycles (Combined or lightmap + AO into a second UV set), denoise, export GLB. In three: either use the baked texture as an unlit `meshBasicMaterial map` (fastest, static) or as `lightMap`/`aoMap` on standard materials (set `texture.channel = 1` for UV2, `flipY = false` for glTF textures). Baked objects can't move without breaking their baked shadows — keep movable/interactive items real-time lit. Prefer Blender baking; the in-browser `@react-three/lightmap` baker is unmaintained since 2022.
3. **Furniture:** build from `RoundedBox` (radius 0.02–0.05 for crisp but soft edges) or import CC0 models (Poly Haven, Kenney, Quaternius). Give each prop a little imperfection (slight rotation, varied books/plant sizes). Fabric = high roughness (0.8–1), wood = 0.5–0.7 with subtle texture, screens = emissive with `toneMapped={false}`.
4. **Avoid z-fighting:** rugs/posters 0.002–0.01 units off surfaces, or `polygonOffset polygonOffsetFactor={-1}` on the decal material; keep `near` as large as possible (0.1+) and `far` small.
5. **Lights that look like lamps:** small emissive bulb mesh + nearby `pointLight` WITHOUT shadows (`distance` and `decay={2}` set), or bake it. Window: emissive plane outside + matching Lightformer for reflections.
6. **Reflective floor (optional, expensive):** drei `<MeshReflectorMaterial blur={[300, 100]} resolution={512} mixBlur={1} mixStrength={40} roughness={1} depthScale={1.2} minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#202020" metalness={0.5} />`. Drop on mobile via `PerformanceMonitor`.
7. **Interactive UI inside the room:** drei `<Html transform occlude>` for screens/labels; keep DOM count small.

## 9. Recipe: product / hero objects and "3D UI" elements

- Use `<Stage>` (drei) for a quick studio setup, or hand-build: Lightformer environment + `AccumulativeShadows` + `Bounds`. fov 25–35.
- Hero glass/crystal: `MeshTransmissionMaterial` (samples ≥ 6, `backside`) — limit to one hero object.
- Text: drei `<Text>` (SDF, cheap, crisp) for labels; `<Text3D>` + `<Center>` (needs typeface JSON) for extruded logos, with `bevelEnabled`.
- Hover feedback: damp `scale` to 1.05 and emissive up on `onPointerOver`; set `document.body.style.cursor`. Use drei `<Outlines>` for selection.
- Scroll-driven scenes: drei `<ScrollControls pages={3}>` + `useScroll().offset` in `useFrame`.

## 10. Asset pipeline (glTF/GLB)

1. Model/export: **GLB**, Y-up, meters, apply transforms, ≤2048 px textures (1024 for most props), one material per look, name meshes meaningfully.
2. Inspect: `npx @gltf-transform/cli inspect model.glb` (look for huge textures, duplicate materials, vertex counts).
3. Optimize: `npx @gltf-transform/cli optimize in.glb out.glb --texture-compress webp --texture-size 2048` (meshopt geometry by default). For lowest VRAM use `--texture-compress ktx2` (needs KTX-Software installed). Make the compression step last in any chain.
4. Componentize: `npx gltfjsx out.glb --types --shadows` (or `--transform` to do step 3 too). Edit the generated JSX: share materials, add interactivity, split static vs animated parts.
5. Load: `useGLTF('/out.glb')` — drei's `useGLTF` wires up Draco (decoder from a CDN by default) and Meshopt. Self-host decoders for production (`useGLTF.setDecoderPath('/draco/')`). KTX2 needs a `KTX2Loader` with `detectSupport(gl)` (drei: `useKTX2`).
6. Serve `.glb` with Brotli/gzip and long cache headers; preload critical assets.
7. Free asset sources: Poly Haven (HDRIs, textures, models, CC0), Kenney and Quaternius (low-poly CC0 packs), ambientCG (CC0 PBR textures). Check each license.

## 11. Quality checklist (run before declaring done)

Visual:

- [ ] Environment lighting present; no black metal; key light casts a well-fitted shadow (no blocky/acne artifacts).
- [ ] Objects grounded (contact/accumulative/baked shadows or AO).
- [ ] Edges bevelled/rounded where they would be in reality.
- [ ] Palette coherent; background/fog match; no pure black/white large areas.
- [ ] Emissives bloom only where intended; tone mapping chosen deliberately.
- [ ] Camera framed, orbit limited; looks good at mobile aspect ratio (portrait) too.
- [ ] Idle motion subtle and eased; reduced-motion respected.

Performance:

- [ ] Draw calls checked (`gl.info.render.calls`); repeated objects instanced; materials shared.
- [ ] No `setState` or allocations in `useFrame`; delta-based animation.
- [ ] `dpr` capped (≤2); `PerformanceMonitor`/`AdaptiveDpr` for heavy scenes; `frameloop="demand"` if static.
- [ ] Models optimized (gltf-transform), textures ≤2048, decoders configured.
- [ ] No console warnings (deprecated APIs, color space, shadow map type).
- [ ] Tested on a mid-range phone or with CPU/GPU throttling.

## 12. Anti-patterns (seen often in AI-generated three.js)

- Using `three/examples/js/…` globals, `THREE.Geometry`, `*BufferGeometry` class names (`BoxBufferGeometry`), `boxBufferGeometry` JSX, `attach="material"` everywhere — all outdated. Use `boxGeometry`, `meshStandardMaterial` children (auto-attached).
- `new THREE.Clock()` in new code (deprecated) — in R3F use `useFrame`'s `state.clock`/`delta`; in vanilla use `THREE.Timer`.
- `<Canvas shadows>` on three ≥0.186 → PCFSoft warning; use `shadows="percentage"`.
- Ambient light at high intensity as the only "fill" → flat, grey scenes. Use an environment map instead.
- Hundreds of separate meshes for repeated items → instance them.
- Huge un-optimized GLBs (50 MB+) and 4K textures on everything.
- Creating materials inline in `.map()` loops (one material per item).
- Mixing `@react-three/postprocessing` with a WebGPU renderer (won't work).
- Assuming R3F v10 / drei v11 APIs (`@react-three/fiber/webgpu`, `useUniforms`) in a v9 project.

## 13. Session log

### Session 1 — 2026-11-22 (v1.0.0)

- Researched current versions (npm registry, three.js release notes/migration notes via utsubo.com r182–r187 summary, R3F v9 migration guide and v10 alpha release notes, R3F pitfalls docs, three.js WebGPU post-processing manual, gltf-transform docs).
- Verified in R3F 9.8.2 source: `shadows={true}` → `PCFSoftShadowMap`; string `"percentage"` → `PCFShadowMap`; default tone mapping ACESFilmic unless `gl.toneMapping` given; `gl={{…}}` props are applied to the renderer.
- Wrote: session protocol, version table, renderer decision tree, golden starter, core rules, beauty recipe, recipes for robots / isometric worlds / rooms / hero objects, asset pipeline, checklist, anti-patterns.
- Not yet done: no full example scenes were built and visually tested; WebGPU/TSL recipes are only sketched.

## 14. Open questions / next steps (for the next session)

1. **Ask the user** (if not yet answered): target stack (plain three.js vs R3F, Vite vs Next.js, TypeScript?), target devices (mobile-first?), and preferred art style (stylized low-poly, soft clay, realistic). Record answers here.
2. Build and screenshot-test one reference scene per recipe (robot, isometric island, cutaway room); fix any snippet that fails; add "known-good" versions to `references/`.
3. Add a WebGPU + TSL section (R3F 9 async gl factory, node materials, `RenderPipeline` bloom/AO, TSL noise for stylized materials) and track R3F v10 beta.
4. Add procedural-geometry helpers: seeded RNG, noise-based terrain for isometric islands, ExtrudeGeometry shapes, CSG (`three-bvh-csg`) for cutouts (windows, doors).
5. Add a "make an existing scene prettier" audit workflow (step-by-step diagnosis from screenshot → fixes).
6. Add toon/NPR style recipe (outlines, gradient maps, posterization) and a physics interaction recipe (`@react-three/rapier`).

## 15. Sources (trusted, checked 2026-11-22)

- three.js releases + Migration Guide: github.com/mrdoob/three.js/releases, /wiki/Migration-Guide; docs for AI tools: threejs.org/llms.txt
- three.js manual: WebGPURenderer and WebGPU post-processing (threejs.org/manual/en/webgpu-postprocessing)
- R3F docs: r3f.docs.pmnd.rs (pitfalls, scaling performance, v9 migration guide); R3F releases (v10 alpha notes)
- drei docs: drei.docs.pmnd.rs
- utsubo.com: "Three.js in 2026 (r182–r187)" and "100 Three.js tips (r186)" — studio-written, dated, cross-checked against npm
- glTF Transform: gltf-transform.dev; gltfjsx: github.com/pmndrs/gltfjsx
- Discover three.js tips: discoverthreejs.com/tips-and-tricks
