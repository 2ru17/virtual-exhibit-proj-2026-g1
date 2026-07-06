import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function WireframeGlobe({ size = 420, className = "" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const width = size;
    const height = size / 2 + size / 2;

    // Scene
    const scene = new THREE.Scene();

    // Camera - positioned to see the whole curved floor
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.8, 2.8);
    camera.lookAt(0, -0.2, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // ----- CURVED GLOBE-TOP GRID (larger to fill the box) -----
    const radius = 3.2; // Increased radius
    const latSegments = 20;
    const lonSegments = 20;
    const gridLines = [];

    // Latitude lines (horizontal rings at different heights)
    for (let lat = 0; lat <= latSegments; lat++) {
      const phi = (lat / latSegments) * Math.PI / 2;
      const y = radius * Math.cos(phi) - radius;
      const r = radius * Math.sin(phi);
      
      const points = [];
      for (let lon = 0; lon <= lonSegments; lon++) {
        const theta = (lon / lonSegments) * Math.PI * 2;
        points.push(
          new THREE.Vector3(
            r * Math.cos(theta),
            y,
            r * Math.sin(theta)
          )
        );
      }
      gridLines.push(points);
    }

    // Longitude lines (vertical curves from center to edge)
    for (let lon = 0; lon < lonSegments; lon++) {
      const theta = (lon / lonSegments) * Math.PI * 2;
      const points = [];
      for (let lat = 0; lat <= latSegments; lat++) {
        const phi = (lat / latSegments) * Math.PI / 2;
        const y = radius * Math.cos(phi) - radius;
        const r = radius * Math.sin(phi);
        points.push(
          new THREE.Vector3(
            r * Math.cos(theta),
            y,
            r * Math.sin(theta)
          )
        );
      }
      gridLines.push(points);
    }

    // Convert grid lines to LineSegments
    const allPoints = [];
    gridLines.forEach(line => {
      for (let i = 0; i < line.length - 1; i++) {
        allPoints.push(line[i], line[i + 1]);
      }
    });

    const gridGeo = new THREE.BufferGeometry().setFromPoints(allPoints);
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x76c6d7,
      transparent: true,
      opacity: 0.15,
    });
    const grid = new THREE.LineSegments(gridGeo, gridMat);
    scene.add(grid);

    // ----- GLOWING RINGS (concentric on the curved surface) -----
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x76c6d7,
      transparent: true,
      opacity: 0.12,
    });

    for (let lat = 2; lat <= latSegments; lat += 3) {
      const phi = (lat / latSegments) * Math.PI / 2;
      const y = radius * Math.cos(phi) - radius;
      const r = radius * Math.sin(phi);
      
      const points = [];
      const segments = 48;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(
          new THREE.Vector3(
            r * Math.cos(theta),
            y,
            r * Math.sin(theta)
          )
        );
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(points);
      const ring = new THREE.Line(ringGeo, ringMat);
      scene.add(ring);
    }

    // ----- GLOWING CENTER POINT -----
    const glowPoints = [];
    for (let i = 0; i <= 48; i++) {
      const theta = (i / 48) * Math.PI * 2;
      const radius2 = 0.1 + (i / 48) * 0.4;
      const y = -radius * (1 - Math.cos(radius2 / radius * Math.PI / 2));
      glowPoints.push(
        new THREE.Vector3(
          radius2 * Math.cos(theta),
          y,
          radius2 * Math.sin(theta)
        )
      );
    }
    const glowGeo = new THREE.BufferGeometry().setFromPoints(glowPoints);
    const glowMat = new THREE.LineBasicMaterial({
      color: 0x7ee787,
      transparent: true,
      opacity: 0.5,
    });
    const glow = new THREE.Line(glowGeo, glowMat);
    scene.add(glow);

    // ----- CABLE LINES EMERGING FROM THE CURVED SURFACE -----
    const cableColors = [
      0xff279e, 0xbd93f9, 0x76c6d7, 
      0xe2a9f1, 0xff3131, 0xf5d76e, 0x7ee787
    ];
    
    cableColors.forEach((color, i) => {
      const angle = (i / cableColors.length) * Math.PI * 2;
      const spread = 1.8;
      
      // Start from surface of the dome
      const startRadius = 0.5;
      const startY = -radius * (1 - Math.cos(startRadius / radius * Math.PI / 2));
      
      const points = [
        new THREE.Vector3(
          startRadius * Math.cos(angle),
          startY,
          startRadius * Math.sin(angle)
        ),
        new THREE.Vector3(
          spread * Math.cos(angle),
          0.8 + Math.sin(angle) * 0.3,
          spread * Math.sin(angle)
        ),
      ];
      const cableGeo = new THREE.BufferGeometry().setFromPoints(points);
      const cableMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.4,
      });
      scene.add(new THREE.Line(cableGeo, cableMat));
    });

    // ----- CONTROLS - FIXED, ONLY AUTO-ROTATE -----
    // In WireframeGlobe.jsx, update the controls section:
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 2.2; // Lock vertical rotation
    controls.maxPolarAngle = Math.PI / 2.2; // Lock vertical rotation
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.target.set(0, -0.2, 0);

    // Animation
    let frameId;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      controls.dispose();
      renderer.dispose();
      gridGeo.dispose();
      gridMat.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  return (
    <div
      ref={mountRef}
      className={`pointer-events-none ${className}`} // pointer-events-none so clicks pass through to buttons
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    />
  );
}