"use client";
/*
 * three.js objects (uniforms, textures) are mutable by design and R3F updates
 * them in useFrame/effects, outside React state. The React Compiler is not
 * enabled in this project, so its immutability rule doesn't apply here.
 */
/* eslint-disable react-hooks/immutability */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTheme } from "next-themes";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent,
} from "react";
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  ExtrudeGeometry,
  PlaneGeometry,
  SRGBColorSpace,
  Shape,
  Vector3,
  type Group,
  type IUniform,
  type ShaderMaterial,
} from "three";

import { drawLcd, LCD_SIZE, type LcdContent } from "./ac-lcd";
import {
  particleFragment,
  particleVertex,
  ribbonFragment,
  ribbonVertex,
} from "./air-shaders";

/** Unit body, in scene units: width (x), height (y), depth from the wall (z). */
const BODY = { width: 3.2, height: 1, depth: 0.72, bevel: 0.06 } as const;
const FRONT = BODY.depth / 2 + BODY.bevel;
const BOTTOM = -BODY.height / 2 - BODY.bevel;
const TOP = BODY.height / 2 + BODY.bevel;
const HALF_WIDTH = BODY.width / 2;
const OUTLET = { y: BOTTOM + 0.02, z: FRONT - 0.02 } as const;
const RIBBONS = 18;
/** Camera: base distance and vertical FOV; the unit (plus margin) always fits the width. */
const CAMERA = {
  distance: 6.6,
  fov: 34,
  fitHalfWidth: 2.05,
  /** Height (scene units) kept visible above the unit's center. */
  topInView: 0.78,
  /** Camera height above its target at the base distance (looks slightly down). */
  lift: 1.6,
} as const;
const TAN_HALF_FOV = Math.tan(((CAMERA.fov / 2) * Math.PI) / 180);
/** Below this canvas width (CSS px) the LCD moves to the center and scales up. */
const COMPACT_WIDTH = 520;
/** Phone LCD scale, so its text reads about as large as on desktop. */
const COMPACT_LCD_SCALE = 1.6;
/** Swing: louver aim between straight ahead (0) and straight down (1). */
const AIM = { rest: 0.5, sweep: 0.42, speed: 1.2 } as const;
const PARTICLES = 520;
const MAX_TURN = 0.75;

const TOKENS = [
  "appliance",
  "appliance-shade",
  "lcd",
  "lcd-ink",
  "air",
  "ink",
] as const;
type Tokens = Record<(typeof TOKENS)[number], string>;

/** Token colors from tokens.css, re-read when the theme changes. */
function useTokens(): Tokens | null {
  const { resolvedTheme } = useTheme();
  const [tokens, setTokens] = useState<Tokens | null>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const css = getComputedStyle(document.documentElement);
      setTokens(
        Object.fromEntries(
          TOKENS.map((t) => [t, css.getPropertyValue(`--${t}`).trim()]),
        ) as Tokens,
      );
    });
    return () => cancelAnimationFrame(id);
  }, [resolvedTheme]);
  return tokens;
}

/** Side profile (depth × height): square against the wall, rounded front. */
function bodyGeometry(): ExtrudeGeometry {
  const d = BODY.depth / 2;
  const h = BODY.height / 2;
  const top = 0.16;
  const bottom = 0.34;
  const s = new Shape();
  s.moveTo(-d, -h);
  s.lineTo(d - bottom, -h);
  s.quadraticCurveTo(d, -h, d, -h + bottom);
  s.lineTo(d, h - top);
  s.quadraticCurveTo(d, h, d - top, h);
  s.lineTo(-d, h);
  s.lineTo(-d, -h);
  const g = new ExtrudeGeometry(s, {
    depth: BODY.width - BODY.bevel * 2,
    bevelEnabled: true,
    bevelThickness: BODY.bevel,
    bevelSize: BODY.bevel,
    bevelSegments: 6,
    curveSegments: 20,
  });
  g.rotateY(-Math.PI / 2);
  g.translate(HALF_WIDTH - BODY.bevel, 0, 0);
  return g;
}

/** A soft wall shadow behind the unit. */
function shadowTexture(ink: string): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  // Stretched circle → ellipse that fades out well inside the canvas edges.
  ctx.setTransform(2, 0, 0, 1, 0, 0);
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 58);
  g.addColorStop(0, ink);
  g.addColorStop(1, "transparent");
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function particleGeometry(): BufferGeometry {
  const rand = seededRandom(7);
  const seeds = new Float32Array(PARTICLES * 3).map(() => rand());
  const g = new BufferGeometry();
  // Positions are computed in the shader; the attribute only sizes the draw.
  g.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(PARTICLES * 3), 3),
  );
  g.setAttribute("aSeed", new BufferAttribute(seeds, 3));
  return g;
}

/**
 * Camera distance that keeps the unit inside the canvas width, and whether the
 * canvas is narrow (phones). Phones frame by width alone, so the unit fills the
 * short stage; the LCD is centered and scaled there so its text stays legible.
 */
function useFit() {
  const size = useThree((s) => s.size);
  const aspect = size.width / Math.max(size.height, 1);
  const compact = size.width < COMPACT_WIDTH;
  const fit = CAMERA.fitHalfWidth / (TAN_HALF_FOV * aspect);
  const distance = compact ? fit : Math.max(CAMERA.distance, fit);
  return { distance, compact, zoom: distance / CAMERA.distance };
}

/** Keeps the unit's top just inside the frame, so the air gets the rest. */
function CameraRig() {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const { distance } = useFit();
  useEffect(() => {
    const target = CAMERA.topInView - distance * TAN_HALF_FOV;
    camera.position.set(
      0,
      target + CAMERA.lift * (distance / CAMERA.distance),
      distance,
    );
    camera.lookAt(0, target, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, distance, invalidate]);
  return null;
}

function Lcd({ content, tokens }: { content: LcdContent; tokens: Tokens }) {
  const { compact, zoom } = useFit();
  const invalidate = useThree((s) => s.invalidate);
  const { canvas, texture } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = LCD_SIZE.width;
    canvas.height = LCD_SIZE.height;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return { canvas, texture };
  }, []);

  useEffect(() => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const font = getComputedStyle(document.body)
      .getPropertyValue("--font-plex-mono")
      .trim();
    const draw = () => {
      drawLcd(ctx, content, { bg: tokens.lcd, ink: tokens["lcd-ink"] }, font);
      texture.needsUpdate = true;
      invalidate();
    };
    draw();
    void document.fonts.ready.then(draw);
  }, [canvas, texture, content, tokens, invalidate]);

  useEffect(() => () => texture.dispose(), [texture]);

  const width = 0.86 * (compact ? Math.max(zoom, COMPACT_LCD_SCALE) : 1);
  return (
    <mesh
      position={[
        compact ? 0 : HALF_WIDTH - 0.66,
        compact ? 0.08 : 0.02,
        FRONT + 0.004,
      ]}
    >
      <planeGeometry
        args={[width, (width * LCD_SIZE.height) / LCD_SIZE.width]}
      />
      <meshBasicMaterial map={texture} toneMapped={false} transparent />
    </mesh>
  );
}

function AirConditioner({
  strength,
  swing,
  lcd,
  tokens,
  turn,
  animate,
}: {
  strength: number;
  swing: boolean;
  lcd: LcdContent;
  tokens: Tokens;
  turn: { current: number };
  animate: boolean;
}) {
  const group = useRef<Group>(null);
  const louver = useRef<Group>(null);
  const current = useRef(strength);
  const aim = useRef<number>(AIM.rest);
  const swingClock = useRef(0);
  const { compact } = useFit();
  const invalidate = useThree((s) => s.invalidate);
  const dpr = useThree((s) => s.viewport.dpr);

  const body = useMemo(() => bodyGeometry(), []);
  const shadow = useMemo(() => shadowTexture(tokens.ink), [tokens.ink]);
  const particles = useMemo(() => particleGeometry(), []);
  const ribbon = useMemo(() => new PlaneGeometry(1, 1, 80, 1), []);
  const ribbons = useMemo(() => {
    const rand = seededRandom(3);
    return (
      Array.from({ length: RIBBONS }, (_, i) => ({
        x: (-1 + (2 * (i + 0.5)) / RIBBONS) * HALF_WIDTH * 0.8,
        phase: rand() * 6.2831,
      }))
        // Center ribbons switch on first; the outer ones join as capacity grows.
        .map((r) => ({ ...r, gate: (Math.abs(r.x) / HALF_WIDTH) * 0.85 }))
    );
  }, []);
  // Initial values only: R3F copies each uniform into the material, so frame
  // updates go through `materials` (the shared Color object is the exception).
  const materials = useRef<ShaderMaterial[]>([]);
  const shared = useMemo(
    () => ({
      uTime: { value: 0 },
      uStrength: { value: strength },
      uOrigin: { value: new Vector3(0, OUTLET.y, OUTLET.z) },
      uAim: { value: AIM.rest },
      uColor: { value: new Color() },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial strength only
    [],
  );
  const ribbonUniforms = useMemo<Record<string, IUniform>[]>(
    () =>
      ribbons.map((r) => ({
        ...shared,
        uX: { value: r.x },
        uPhase: { value: r.phase },
        uGate: { value: r.gate },
      })),
    [ribbons, shared],
  );
  const particleUniforms = useMemo<Record<string, IUniform>>(
    () => ({
      ...shared,
      uHalfWidth: { value: HALF_WIDTH * 0.82 },
      uPixelRatio: { value: dpr },
    }),
    [shared, dpr],
  );

  useEffect(() => {
    shared.uColor.value.set(tokens.air);
    invalidate();
  }, [shared, tokens.air, invalidate]);

  useEffect(
    () => () => {
      body.dispose();
      shadow.dispose();
      particles.dispose();
      ribbon.dispose();
    },
    [body, shadow, particles, ribbon],
  );

  // Static frames (reduced motion, off screen) still reflect a new capacity.
  useEffect(() => {
    if (!animate) current.current = strength;
    invalidate();
  }, [strength, animate, invalidate]);

  useFrame((state, delta) => {
    const t = animate ? state.clock.elapsedTime : 2;
    const k = 1 - Math.exp(-delta * 3.5);
    current.current = animate
      ? current.current + (strength - current.current) * k
      : strength;
    const s = current.current;
    // Swing sweeps the louver top to bottom and back; off, it eases to rest.
    if (swing && animate) swingClock.current += delta * AIM.speed;
    const aimTarget =
      swing && animate
        ? AIM.rest + AIM.sweep * Math.sin(swingClock.current)
        : AIM.rest;
    aim.current = animate
      ? aim.current + (aimTarget - aim.current) * (1 - Math.exp(-delta * 6))
      : aimTarget;
    for (const m of materials.current) {
      m.uniforms.uTime!.value = t;
      m.uniforms.uStrength!.value = s;
      m.uniforms.uAim!.value = aim.current;
    }
    if (louver.current) louver.current.rotation.x = 0.2 + aim.current * 1.05;
    if (group.current) {
      const target = turn.current + (animate ? Math.sin(t * 0.35) * 0.08 : 0);
      group.current.rotation.y += (target - group.current.rotation.y) * k;
    }
  });

  return (
    <group ref={group} rotation={[0, -0.18, 0]}>
      <mesh position={[0.12, -0.18, -BODY.depth / 2 - 0.08]}>
        <planeGeometry args={[BODY.width * 1.5, BODY.height * 2.2]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>

      <mesh geometry={body}>
        <meshStandardMaterial
          color={tokens.appliance}
          roughness={0.38}
          metalness={0.05}
        />
      </mesh>

      {/* Front panel seam (hidden behind the larger phone LCD). */}
      {!compact && (
        <mesh position={[0, TOP - 0.3, FRONT + 0.002]}>
          <boxGeometry args={[BODY.width - 0.2, 0.012, 0.004]} />
          <meshStandardMaterial color={tokens["appliance-shade"]} />
        </mesh>
      )}

      {/* Intake slats on top. */}
      {Array.from({ length: 22 }, (_, i) => (
        <mesh
          key={i}
          position={[-HALF_WIDTH + 0.2 + i * 0.133, TOP + 0.002, -0.04]}
        >
          <boxGeometry args={[0.03, 0.006, BODY.depth * 0.55]} />
          <meshStandardMaterial color={tokens["appliance-shade"]} />
        </mesh>
      ))}

      {/* Outlet slot and louver. */}
      <mesh position={[0, BOTTOM + 0.1, FRONT - 0.16]} rotation={[-0.75, 0, 0]}>
        <boxGeometry args={[BODY.width * 0.86, 0.16, 0.02]} />
        <meshStandardMaterial color={tokens.lcd} roughness={0.9} />
      </mesh>
      <group ref={louver} position={[0, BOTTOM + 0.06, FRONT - 0.2]}>
        <mesh position={[0, 0, 0.13]}>
          <boxGeometry args={[BODY.width * 0.84, 0.024, 0.26]} />
          <meshStandardMaterial color={tokens.appliance} roughness={0.4} />
        </mesh>
      </group>

      <Lcd content={lcd} tokens={tokens} />
      {!compact && (
        <mesh position={[HALF_WIDTH - 1.22, 0.02, FRONT + 0.004]}>
          <circleGeometry args={[0.018, 16]} />
          <meshBasicMaterial color={tokens["lcd-ink"]} toneMapped={false} />
        </mesh>
      )}

      {ribbons.map((_, i) => (
        <mesh key={i} geometry={ribbon} frustumCulled={false} renderOrder={1}>
          <shaderMaterial
            ref={(m: ShaderMaterial | null) => {
              if (m) materials.current[i] = m;
            }}
            vertexShader={ribbonVertex}
            fragmentShader={ribbonFragment}
            uniforms={ribbonUniforms[i]}
            transparent
            depthWrite={false}
            side={DoubleSide}
          />
        </mesh>
      ))}
      <points geometry={particles} frustumCulled={false} renderOrder={2}>
        <shaderMaterial
          ref={(m: ShaderMaterial | null) => {
            if (m) materials.current[RIBBONS] = m;
          }}
          vertexShader={particleVertex}
          fragmentShader={particleFragment}
          uniforms={particleUniforms}
          transparent
          depthWrite={false}
        />
      </points>
    </group>
  );
}

/**
 * Real-time 3D wall-mounted AC (React Three Fiber). Cool air grows with
 * `strength` (capacity share × cooling effort); swing sweeps the louver and
 * the flow; the LCD shows the setpoint and capacity. Decorative: every value is also on the page as text.
 * Pauses off screen; a still frame under reduced motion.
 */
export default function AcScene({
  strength,
  swing,
  lcd,
  fallback,
}: {
  strength: number;
  swing: boolean;
  lcd: LcdContent;
  fallback: ReactNode;
}) {
  const tokens = useTokens();
  const wrap = useRef<HTMLDivElement>(null);
  const turn = useRef(0);
  const drag = useRef<{ x: number; turn: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) =>
      setVisible(!!e?.isIntersecting),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const animate = visible && !reduced;
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, turn: turn.current };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const next = drag.current.turn + (e.clientX - drag.current.x) * 0.008;
    turn.current = Math.max(-MAX_TURN, Math.min(MAX_TURN, next));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <div
      ref={wrap}
      aria-hidden="true"
      className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {tokens ? (
        <Canvas
          dpr={[1, 2]}
          frameloop={animate ? "always" : "demand"}
          camera={{ position: [0, 0.5, CAMERA.distance], fov: CAMERA.fov }}
          gl={{ antialias: true, alpha: true }}
          fallback={fallback}
        >
          <hemisphereLight
            args={[tokens.appliance, tokens["appliance-shade"], 1.1]}
          />
          <directionalLight position={[3, 5, 6]} intensity={1.8} />
          <directionalLight position={[-4, 1, 3]} intensity={0.5} />
          <CameraRig />
          <AirConditioner
            strength={strength}
            swing={swing}
            lcd={lcd}
            tokens={tokens}
            turn={turn}
            animate={animate}
          />
        </Canvas>
      ) : (
        fallback
      )}
    </div>
  );
}
