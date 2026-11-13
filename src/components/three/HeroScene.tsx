'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface BuildingSpec {
  x: number;
  z: number;
  w: number;
  h: number;
  d: number;
  glass: boolean;
}

const BUILDINGS: BuildingSpec[] = [
  { x: -3.6, z: -1.2, w: 0.95, h: 2.5, d: 0.95, glass: false },
  { x: -2.3, z: -2.5, w: 1.15, h: 3.7, d: 1.15, glass: true },
  { x: -1.05, z: -1.5, w: 0.8, h: 2.9, d: 0.8, glass: true },
  { x: 0.45, z: -2.7, w: 1.25, h: 4.7, d: 1.25, glass: true },
  { x: 1.9, z: -1.35, w: 0.9, h: 3.3, d: 0.9, glass: false },
  { x: 3.1, z: -2.3, w: 1.05, h: 2.6, d: 1.05, glass: true },
  { x: 2.5, z: -3.7, w: 0.7, h: 2.1, d: 0.7, glass: false },
];

export default function HeroScene() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#05070c', 7.5, 19);

    const camera = new THREE.PerspectiveCamera(38, host.clientWidth / host.clientHeight, 0.1, 80);
    camera.position.set(0, 2.3, 9);
    camera.lookAt(0, 1.7, -0.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    host.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTexture = pmrem.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTexture;
    roomEnv.dispose?.();

    const ambient = new THREE.AmbientLight('#cfe0f4', 0.32);
    const key = new THREE.DirectionalLight('#f4f8ff', 1.15);
    key.position.set(4, 8, 3);
    const rim = new THREE.PointLight('#7fb8ff', 26, 22);
    rim.position.set(-6, 4.5, -6);
    const warm = new THREE.PointLight('#ffd9a0', 10, 15);
    warm.position.set(5.5, 2.2, 3.5);
    scene.add(ambient, key, rim, warm);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#0c1424',
      metalness: 0.25,
      roughness: 0.06,
      transmission: 0.82,
      thickness: 0.65,
      envMapIntensity: 1.5,
      transparent: true,
      opacity: 0.96,
    });
    const steelMat = new THREE.MeshStandardMaterial({
      color: '#151d2b',
      metalness: 0.92,
      roughness: 0.3,
      envMapIntensity: 1.15,
    });
    const edgeMat = new THREE.LineBasicMaterial({ color: '#a8d4f5', transparent: true, opacity: 0.22 });

    const city = new THREE.Group();
    city.position.y = 0;
    scene.add(city);

    const disposables: Array<{ dispose: () => void }> = [glassMat, steelMat, edgeMat, envTexture];

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: '#070b12', metalness: 0.88, roughness: 0.34, envMapIntensity: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    city.add(ground);
    disposables.push(ground.geometry as unknown as { dispose: () => void }, ground.material as THREE.Material);

    const grid = new THREE.GridHelper(46, 46, '#24354d', '#101b2b');
    const gridMat = grid.material as THREE.Material;
    gridMat.transparent = true;
    gridMat.opacity = 0.5;
    grid.position.y = 0.005;
    city.add(grid);

    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(11, 0.06, 5.6),
      new THREE.MeshStandardMaterial({ color: '#0a1019', metalness: 0.85, roughness: 0.28, envMapIntensity: 1.1 })
    );
    plinth.position.set(0, 0.03, -1.8);
    city.add(plinth);
    disposables.push(plinth.geometry as unknown as { dispose: () => void }, plinth.material as THREE.Material);

    BUILDINGS.forEach((spec) => {
      const geometry = new THREE.BoxGeometry(spec.w, spec.h, spec.d);
      const mesh = new THREE.Mesh(geometry, spec.glass ? glassMat : steelMat);
      mesh.position.set(spec.x, spec.h / 2, spec.z);
      city.add(mesh);

      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 16), edgeMat);
      edges.position.copy(mesh.position);
      city.add(edges);
      disposables.push(geometry, edges.geometry as unknown as { dispose: () => void });
    });

    const spire = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 1.7, 0.14),
      new THREE.MeshStandardMaterial({ color: '#2a3648', metalness: 0.95, roughness: 0.2, envMapIntensity: 1.4 })
    );
    spire.position.set(0.45, 4.7 + 0.85, -2.7);
    city.add(spire);
    disposables.push(spire.geometry as unknown as { dispose: () => void }, spire.material as THREE.Material);

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 16, 16),
      new THREE.MeshBasicMaterial({ color: '#cfe6ff' })
    );
    beacon.position.set(0.45, 6.65, -2.7);
    city.add(beacon);
    disposables.push(beacon.geometry as unknown as { dispose: () => void }, beacon.material as THREE.Material);

    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(3.4, 0.012, 8, 160),
      new THREE.MeshBasicMaterial({ color: '#9cc6e8', transparent: true, opacity: 0.32 })
    );
    orbit.position.set(0, 2.35, -1.6);
    orbit.rotation.set(1.32, 0.12, 0);
    scene.add(orbit);
    disposables.push(orbit.geometry as unknown as { dispose: () => void }, orbit.material as THREE.Material);

    const orbitTwo = new THREE.Mesh(
      new THREE.TorusGeometry(4.4, 0.008, 8, 160),
      new THREE.MeshBasicMaterial({ color: '#6f93b8', transparent: true, opacity: 0.18 })
    );
    orbitTwo.position.set(0, 2.6, -1.6);
    orbitTwo.rotation.set(1.42, -0.18, 0.1);
    scene.add(orbitTwo);
    disposables.push(orbitTwo.geometry as unknown as { dispose: () => void }, orbitTwo.material as THREE.Material);

    const dustCount = 420;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i += 1) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 22;
      dustPositions[i * 3 + 1] = Math.random() * 7;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMaterial = new THREE.PointsMaterial({
      color: '#bcd7f2',
      size: 0.02,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);
    disposables.push(dustGeometry, dustMaterial);

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const clock = new THREE.Clock();
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      city.rotation.y = -0.16 + Math.sin(time * 0.05) * 0.022 + pointer.x * 0.05;
      camera.position.x += (pointer.x * 0.5 - camera.position.x) * 0.03;
      camera.position.y += (2.3 + pointer.y * -0.22 - camera.position.y) * 0.03;
      camera.lookAt(0, 1.7, -0.6);

      orbit.rotation.z = time * 0.08;
      orbitTwo.rotation.z = -time * 0.05;
      beacon.material.opacity = 0.7 + Math.sin(time * 2.1) * 0.3;
      (beacon.material as THREE.MeshBasicMaterial).transparent = true;

      dust.rotation.y = time * 0.012;
      dust.position.y = Math.sin(time * 0.12) * 0.12;

      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(host);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      resizeObserver.disconnect();
      if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
      renderer.dispose();
      pmrem.dispose();
      disposables.forEach((item) => item.dispose?.());
    };
  }, []);

  return <div className="hero-scene" aria-hidden="true" ref={hostRef} />;
}
