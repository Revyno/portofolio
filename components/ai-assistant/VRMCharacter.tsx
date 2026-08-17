"use client";

import {
  VRM,
  VRMLoaderPlugin,
  VRMUtils,
  type VRMExpressionPresetName,
} from "@pixiv/three-vrm";
import {
  VRMAnimationLoaderPlugin,
  createVRMAnimationClip,
  type VRMAnimation,
} from "@pixiv/three-vrm-animation";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useAssistant } from "./assistant-store";
import { VRMA_URL, VRM_URL } from "./config";
import type { AssistantState } from "./types";

// Vanilla three.js (no @react-three/fiber) — R3F's JSX namespace augmentation
// clashes with this app's Chakra/Emotion/GSAP typings under React 19. Driving
// three directly keeps the widget fully isolated from the app's JSX types.

const MOODS: Record<AssistantState, Partial<Record<VRMExpressionPresetName, number>>> = {
  idle: { relaxed: 0.15 },
  thinking: { relaxed: 0.4 },
  speaking: { happy: 0.2 },
  listening: { happy: 0.35 },
  error: { sad: 0.6 },
};

/** Lower the arms from the default T-pose into a relaxed rest pose. */
function applyRelaxedPose(vrm: VRM) {
  const h = vrm.humanoid;
  const set = (
    name: Parameters<typeof h.getNormalizedBoneNode>[0],
    x: number,
    y: number,
    z: number,
  ) => {
    const b = h.getNormalizedBoneNode(name);
    if (b) b.rotation.set(x, y, z);
  };
  // In VRM normalized space the arms rest along ±X; rotate about Z to lower
  // them. Left arm (+X) needs NEGATIVE z, right arm (−X) POSITIVE z.
  set("leftUpperArm", 0, 0, -1.3); // ~75° → arm down at the side
  set("rightUpperArm", 0, 0, 1.3);
  set("leftLowerArm", 0, -0.2, 0); // slight elbow bend inward
  set("rightLowerArm", 0, 0.2, 0);
}

export default function VRMCharacter() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { status, signals } = useAssistant();

  // Live channels read inside the animation loop without re-running the effect.
  const statusRef = useRef(status);
  statusRef.current = status;
  const signalsRef = useRef(signals);
  signalsRef.current = signals;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let raf = 0;
    const timer = new THREE.Timer();

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    camera.position.set(0, 1.3, 1.2);

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(0.5, 2, 2);
    const lookTarget = new THREE.Object3D();
    scene.add(ambient, key, lookTarget);

    let vrm: VRM | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    let hasVrma = false;
    const anim = { blinkAt: 1.5, blinking: 0, t: 0, greet: 1.0 };

    // Mouse-follow: raw pointer (−1..1) smoothed into `look` each frame.
    const pointer = { x: 0, y: 0 };
    const look = { x: 0, y: 0 };
    const tmp = new THREE.Vector3();
    const onPointer = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      pointer.x = THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      pointer.y = THREE.MathUtils.clamp(-(((e.clientY - r.top) / r.height) * 2 - 1), -1, 1);
    };
    window.addEventListener("pointermove", onPointer);

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    /** Frame the upper body (waist → head) so the whole torso shows. */
    const frameFace = () => {
      if (!vrm) return;
      vrm.scene.updateMatrixWorld(true);
      const head = vrm.humanoid.getRawBoneNode("head");
      const hp = new THREE.Vector3();
      if (head) head.getWorldPosition(hp);
      else hp.set(0, 1.35, 0);
      // Centered, head fully visible down to upper chest (hp.x → horizontally centered).
      camera.position.set(hp.x, hp.y + 0.02, hp.z + 1.4);
      camera.lookAt(hp.x, hp.y - 0.14, hp.z);
      lookTarget.position.set(hp.x, hp.y + 0.05, hp.z + 1);
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      frameFace();
    });
    ro.observe(mount);

    // Load VRM (+ optional .vrma idle animation).
    const loader = new GLTFLoader();
    loader.register((p) => new VRMLoaderPlugin(p));
    loader.load(
      VRM_URL,
      async (gltf) => {
        if (disposed) return VRMUtils.deepDispose(gltf.scene);
        const v = gltf.userData.vrm as VRM;
        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.combineSkeletons(gltf.scene);
        VRMUtils.rotateVRM0(v);
        v.scene.traverse((o) => (o.frustumCulled = false));
        if (v.lookAt) v.lookAt.target = lookTarget;

        if (VRMA_URL) {
          try {
            const aLoader = new GLTFLoader();
            aLoader.register((p) => new VRMAnimationLoaderPlugin(p));
            const g = await aLoader.loadAsync(VRMA_URL);
            const a = g.userData.vrmAnimations?.[0] as VRMAnimation | undefined;
            if (a && !disposed) {
              mixer = new THREE.AnimationMixer(v.scene);
              mixer.clipAction(createVRMAnimationClip(a, v)).play();
              hasVrma = true;
            }
          } catch (e) {
            console.warn("VRM load failed, using procedural pose:", e);
          }
        }
        if (!hasVrma) applyRelaxedPose(v);

        v.update(0);
        scene.add(v.scene);
        vrm = v;
        frameFace();
      },
      undefined,
      (e) => console.error("VRM load failed:", e),
    );

    const tick = () => {
      raf = requestAnimationFrame(tick);
      timer.update();
      const delta = timer.getDelta();
      if (vrm) {
        const st = statusRef.current;
        anim.t += delta;
        mixer?.update(delta);

        // Eyes track the cursor (smoothed) — works with or without VRMA.
        look.x += (pointer.x - look.x) * 0.08;
        look.y += (pointer.y - look.y) * 0.08;
        const headBone = vrm.humanoid.getRawBoneNode("head");
        if (headBone) {
          headBone.getWorldPosition(tmp);
          lookTarget.position.set(tmp.x + look.x * 0.6, tmp.y + look.y * 0.4, tmp.z + 1);
        }

        const em = vrm.expressionManager;
        if (em) {
          anim.blinkAt -= delta;
          if (anim.blinkAt <= 0 && anim.blinking <= 0) {
            anim.blinking = 0.12;
            anim.blinkAt = 2.5 + Math.random() * 3;
          }
          let blink = 0;
          if (anim.blinking > 0) {
            anim.blinking -= delta;
            blink = Math.sin((1 - anim.blinking / 0.12) * Math.PI);
          }
          em.setValue("blink", Math.max(0, Math.min(1, blink)));
          em.setValue("aa", st === "speaking" ? signalsRef.current.mouth : 0);

          for (const n of ["happy", "sad", "relaxed", "angry"] as VRMExpressionPresetName[]) {
            em.setValue(n, 0);
          }
          const mood = MOODS[st];
          for (const k in mood) em.setValue(k, mood[k as VRMExpressionPresetName]!);

          // Warm smile when the widget first opens, decaying to the idle mood.
          if (anim.greet > 0) {
            anim.greet -= delta;
            em.setValue("happy", Math.min(1, 0.35 + anim.greet));
          }
        }

        if (!hasVrma) {
          const spine = vrm.humanoid.getNormalizedBoneNode("spine");
          if (spine) spine.rotation.z = Math.sin(anim.t * 1.2) * 0.02;
          const chest = vrm.humanoid.getNormalizedBoneNode("chest");
          if (chest) chest.rotation.x = Math.sin(anim.t * 1.6) * 0.015;
          const neck = vrm.humanoid.getNormalizedBoneNode("neck");
          if (neck) {
            neck.rotation.x = st === "thinking" ? -0.12 : Math.sin(anim.t * 0.8) * 0.03;
            neck.rotation.y = look.x * 0.18; // subtle turn toward cursor
          }
          const headN = vrm.humanoid.getNormalizedBoneNode("head");
          if (headN) {
            headN.rotation.y = look.x * 0.28;
            headN.rotation.x = -look.y * 0.18;
          }
        }

        vrm.update(delta);
      }
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      ro.disconnect();
      mixer?.stopAllAction();
      if (vrm) VRMUtils.deepDispose(vrm.scene);
      ambient.dispose();
      key.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}
