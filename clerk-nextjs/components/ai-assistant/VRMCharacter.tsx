"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  VRM,
  VRMLoaderPlugin,
  VRMUtils,
  type VRMExpressionPresetName,
} from "@pixiv/three-vrm";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useAssistant } from "./assistant-store";
import { VRM_URL } from "./config";
import type { AssistantState } from "./types";

// Small mood presets per assistant state → expression weights applied each frame.
const MOODS: Record<AssistantState, Partial<Record<VRMExpressionPresetName, number>>> = {
  idle: { relaxed: 0.15 },
  thinking: { relaxed: 0.4 },
  speaking: { happy: 0.2 },
  listening: { happy: 0.35 },
  error: { sad: 0.6 },
};

function Model() {
  const { status, signals } = useAssistant();
  const { camera, pointer } = useThree();
  const [vrm, setVrm] = useState<VRM | null>(null);

  const statusRef = useRef(status);
  statusRef.current = status;

  const lookTarget = useMemo(() => new THREE.Object3D(), []);
  const clock = useRef({ blinkAt: 1.5, blinking: 0, t: 0 });

  useEffect(() => {
    let disposed = false;
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      VRM_URL,
      (gltf) => {
        if (disposed) {
          VRMUtils.deepDispose(gltf.scene);
          return;
        }
        const v = gltf.userData.vrm as VRM;
        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.combineSkeletons(gltf.scene);
        VRMUtils.rotateVRM0(v); // face +Z (no-op for VRM1) so it looks at camera
        v.scene.traverse((o) => (o.frustumCulled = false));
        if (v.lookAt) v.lookAt.target = lookTarget;
        setVrm(v);
      },
      undefined,
      (e) => console.error("VRM load failed:", e),
    );

    return () => {
      disposed = true;
    };
  }, [lookTarget]);

  // Dispose GPU resources when the model changes / unmounts.
  useEffect(() => {
    if (!vrm) return;
    return () => VRMUtils.deepDispose(vrm.scene);
  }, [vrm]);

  useFrame((_, delta) => {
    if (!vrm) return;
    const c = clock.current;
    c.t += delta;
    const st = statusRef.current;

    // Eyes/head follow the pointer within the canvas.
    lookTarget.position.set(
      camera.position.x + pointer.x * 0.9,
      camera.position.y + pointer.y * 0.6,
      camera.position.z,
    );

    const em = vrm.expressionManager;
    if (em) {
      // Blink loop.
      c.blinkAt -= delta;
      if (c.blinkAt <= 0 && c.blinking <= 0) {
        c.blinking = 0.12;
        c.blinkAt = 2.5 + Math.random() * 3;
      }
      let blink = 0;
      if (c.blinking > 0) {
        c.blinking -= delta;
        blink = Math.sin((1 - c.blinking / 0.12) * Math.PI); // 0→1→0
      }
      em.setValue("blink", Math.max(0, Math.min(1, blink)));

      // Mouth from the TTS channel (only while speaking).
      em.setValue("aa", st === "speaking" ? signals.mouth : 0);

      // Mood: reset the ones we drive, then apply current state's weights.
      for (const name of ["happy", "sad", "relaxed", "angry"] as VRMExpressionPresetName[]) {
        em.setValue(name, 0);
      }
      const mood = MOODS[st];
      for (const key in mood) {
        em.setValue(key, mood[key as VRMExpressionPresetName]!);
      }
    }

    // Procedural idle: subtle breathing sway on spine + a thinking head tilt.
    const spine = vrm.humanoid?.getNormalizedBoneNode("spine");
    if (spine) spine.rotation.z = Math.sin(c.t * 1.2) * 0.02;
    const neck = vrm.humanoid?.getNormalizedBoneNode("neck");
    if (neck) neck.rotation.x = st === "thinking" ? -0.12 : Math.sin(c.t * 0.8) * 0.03;

    vrm.update(delta);
  });

  return vrm ? <primitive object={vrm.scene} /> : null;
}

export default function VRMCharacter() {
  return (
    <Canvas
      camera={{ position: [0, 1.32, 1.15], fov: 28 }}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true }}
      onCreated={({ camera }) => camera.lookAt(0, 1.28, 0)}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[1, 2, 2]} intensity={1.4} />
      <Model />
    </Canvas>
  );
}
