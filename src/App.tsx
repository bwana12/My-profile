import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { CONTENT, SKILLS, PROJECTS } from './constants';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadPct, setLoadPct] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [isEntering, setIsEntering] = useState(false);

  const activePanelRef = useRef<string | null>(null);
  const isLoadedRef = useRef(false);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const planetsRef = useRef<THREE.Group[]>([]);
  const mouse = useRef({ x: 0, y: 0, nx: 0, ny: 0 });
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const hoveredPlanet = useRef<THREE.Group | null>(null);

  useEffect(() => {
    activePanelRef.current = activePanel;
  }, [activePanel]);

  useEffect(() => {
    isLoadedRef.current = isLoaded;
  }, [isLoaded]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // --- SCENE SETUP ---
    planetsRef.current = [];
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050810);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 35);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    labelRenderer.domElement.style.zIndex = '10';
    document.body.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    // --- STARFIELD ---
    const starCount = 2000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 200;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 200;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- CENTRAL PROFILE PHOTO ---
    const profileGroup = new THREE.Group();
    scene.add(profileGroup);

    const textureLoader = new THREE.TextureLoader();
    const githubAvatarUrl = 'https://avatars.githubusercontent.com/u/199301772?v=4';
    const photoUrl = '/profile.jpg';
    
    const photoTexture = textureLoader.load(photoUrl, 
      // Success
      (texture) => {
        const photoGeo = new THREE.CircleGeometry(3, 64);
        const photoMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const photoMesh = new THREE.Mesh(photoGeo, photoMat);
        profileGroup.add(photoMesh);
      },
      // Progress
      undefined,
      // Error - Fallback to GitHub Avatar
      () => {
        textureLoader.load(githubAvatarUrl, (githubTexture) => {
          const photoGeo = new THREE.CircleGeometry(3, 64);
          const photoMat = new THREE.MeshBasicMaterial({ map: githubTexture, side: THREE.DoubleSide });
          const photoMesh = new THREE.Mesh(photoGeo, photoMat);
          profileGroup.add(photoMesh);
        }, undefined, () => {
          // Final fallback to gold orb
          const orbGeo = new THREE.SphereGeometry(2.5, 32, 32);
          const orbMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, emissive: 0xd4af37, emissiveIntensity: 0.5 });
          const orb = new THREE.Mesh(orbGeo, orbMat);
          profileGroup.add(orb);
        });
      }
    );

    // Pulsing ring
    const ringGeo = new THREE.RingGeometry(3.2, 3.4, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    profileGroup.add(ring);
    gsap.to(ring.scale, { x: 1.1, y: 1.1, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    // --- PLANETS ---
    const planetsData = [
      { name: 'About', color: 0xd4af37, radius: 1.5, orbit: 10, speed: 0.4, section: 'about', ring: false },
      { name: 'Skills', color: 0x88ccff, radius: 1.2, orbit: 14, speed: 0.3, section: 'skills', ring: true },
      { name: 'Projects', color: 0xff8844, radius: 1.8, orbit: 18, speed: 0.45, section: 'projects', ring: false },
      { name: 'Contact', color: 0xff4444, radius: 1.0, orbit: 7, speed: 0.35, section: 'contact', ring: false },
      { name: 'Exit', color: 0x444444, radius: 0.8, orbit: 22, speed: 0.25, section: 'exit', ring: false },
    ];

    planetsData.forEach((data) => {
      const planetGroup = new THREE.Group();
      planetGroup.userData = data;
      
      const geo = new THREE.SphereGeometry(data.radius, 32, 32);
      const mat = new THREE.MeshStandardMaterial({ 
        color: data.color, 
        emissive: data.color, 
        emissiveIntensity: 0.2,
        roughness: 0.7,
        metalness: 0.3
      });
      const planet = new THREE.Mesh(geo, mat);
      planetGroup.add(planet);

      // Atmosphere glow
      const glowGeo = new THREE.SphereGeometry(data.radius * 1.2, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.15, side: THREE.BackSide });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      planetGroup.add(glow);

      if (data.ring) {
        const ringGeo = new THREE.TorusGeometry(data.radius * 1.8, 0.05, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.3 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        planetGroup.add(ring);
      }

      // Label
      const labelDiv = document.createElement('div');
      labelDiv.className = 'planet-label';
      labelDiv.textContent = data.name;
      const label = new CSS2DObject(labelDiv);
      label.position.set(0, data.radius + 0.8, 0);
      planetGroup.add(label);
      planetGroup.userData.labelDiv = labelDiv;

      scene.add(planetGroup);
      planetsRef.current.push(planetGroup);
    });

    // --- LIGHTS ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffff, 2, 100);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // --- ANIMATION LOOP ---
    let lastTime = performance.now();
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = performance.now();
      const delta = Math.min((time - lastTime) / 1000, 0.1); // Cap delta to avoid jumps
      lastTime = time;
      const elapsed = time / 1000;

      // Stars slow drift
      if (stars) stars.rotation.y += delta * 0.02;

      // Profile rotation
      if (profileGroup) profileGroup.rotation.y += delta * 0.2;

      // Planets orbit
      planetsRef.current.forEach((p) => {
        if (!p) return;
        const data = p.userData;
        const angle = elapsed * data.speed + (data.orbit * 10); // offset based on orbit
        
        if (data.section === 'exit') {
          // Keep Exit planet in front (z > 0)
          p.position.x = Math.cos(angle) * data.orbit;
          p.position.z = Math.abs(Math.sin(angle)) * (data.orbit * 0.5) + 5; 
        } else {
          p.position.x = Math.cos(angle) * data.orbit;
          p.position.z = Math.sin(angle) * data.orbit;
        }
        
        p.rotation.y += delta * 0.5;
      });

      // Camera idle float
      if (!activePanelRef.current && isLoadedRef.current) {
        camera.position.y = 5 + Math.sin(elapsed * 0.5) * 0.3;
      }

      // Raycasting for hover
      pointer.set(mouse.current.nx, mouse.current.ny);
      raycaster.setFromCamera(pointer, camera);
      
      const planetMeshes = planetsRef.current
        .filter(p => p && p.children && p.children[0])
        .map(p => p.children[0]);
        
      const intersects = raycaster.intersectObjects(planetMeshes);
      
      if (intersects.length > 0) {
        const hit = intersects[0].object.parent as THREE.Group;
        if (hit && hoveredPlanet.current !== hit) {
          if (hoveredPlanet.current) {
            gsap.to(hoveredPlanet.current.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
            if (hoveredPlanet.current.userData.labelDiv) {
              hoveredPlanet.current.userData.labelDiv.classList.remove('visible');
            }
          }
          hoveredPlanet.current = hit;
          gsap.to(hit.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.3 });
          if (hit.userData.labelDiv) {
            hit.userData.labelDiv.classList.add('visible');
          }
        }
      } else {
        if (hoveredPlanet.current) {
          gsap.to(hoveredPlanet.current.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
          if (hoveredPlanet.current.userData.labelDiv) {
            hoveredPlanet.current.userData.labelDiv.classList.remove('visible');
          }
          hoveredPlanet.current = null;
        }
      }

      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    // --- EVENTS ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      labelRenderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.nx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.ny = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleClick = () => {
      if (hoveredPlanet.current && !activePanelRef.current) {
        const targetPlanet = hoveredPlanet.current;
        const data = targetPlanet.userData;
        
        if (data.section === 'exit') {
          gsap.to(camera.position, { x: 0, y: 5, z: 35, duration: 1.8, ease: 'power3.inOut' });
          gsap.to(camera.rotation, { x: 0, y: 0, z: 0, duration: 1.8 });
          return;
        }
        
        // Fly to planet
        const targetPos = new THREE.Vector3().copy(targetPlanet.position);
        const direction = new THREE.Vector3().subVectors(camera.position, targetPos).normalize();
        const flyTo = targetPos.add(direction.multiplyScalar(4));
        
        gsap.to(camera.position, { 
          x: flyTo.x, y: flyTo.y, z: flyTo.z, 
          duration: 1.8, ease: 'power3.inOut',
          onUpdate: () => {
            if (targetPlanet && targetPlanet.position) {
              camera.lookAt(targetPlanet.position);
            }
          },
          onComplete: () => {
            openPanel(data.section);
          }
        });
      }
    };
    window.addEventListener('click', handleClick);

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
    };
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('wheel', handleWheel);
      if (labelRenderer.domElement.parentNode) {
        labelRenderer.domElement.parentNode.removeChild(labelRenderer.domElement);
      }
      renderer.dispose();
      labelRenderer.domElement.remove();
    };
  }, []);

  // --- LOADER ---
  useEffect(() => {
    let currentPct = 0;
    const interval = setInterval(() => {
      currentPct += Math.random() * 10;
      if (currentPct >= 100) {
        currentPct = 100;
        clearInterval(interval);
        setTimeout(() => setIsLoaded(true), 500);
      }
      setLoadPct(currentPct);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const openPanel = (section: string) => {
    setActivePanel(section);
    gsap.to('#panel-overlay', { opacity: 1, pointerEvents: 'all', duration: 0.5 });
    gsap.fromTo('.panel-glass', 
      { opacity: 0, y: 40, scale: 0.96 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }
    );
    
    // Staggered text animation
    setTimeout(() => {
      const elements = document.querySelectorAll('.panel-body p, .panel-title, .panel-label, .skill-chip, .project-card');
      gsap.fromTo(elements, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'back.out(1.4)' }
      );
    }, 100);
  };

  const closePanel = () => {
    const elements = document.querySelectorAll('.panel-body p, .panel-title, .panel-label, .skill-chip, .project-card');
    gsap.to(elements, { opacity: 0, y: -10, duration: 0.3, stagger: 0.02 });
    gsap.to('.panel-glass', { opacity: 0, y: 20, scale: 0.98, duration: 0.4, ease: 'power3.in', onComplete: () => {
      setActivePanel(null);
      gsap.to('#panel-overlay', { opacity: 0, pointerEvents: 'none', duration: 0.3 });
      // Reset camera slightly
      if (cameraRef.current) {
        gsap.to(cameraRef.current.position, { x: 0, y: 5, z: 35, duration: 1.5, ease: 'power2.inOut' });
      }
    }});
  };

  // Dynamic content population
  useEffect(() => {
    if (activePanel === 'skills') {
      const grid = document.getElementById('skill-grid');
      if (grid && grid.children.length === 0) {
        SKILLS.forEach(s => {
          const chip = document.createElement('div');
          chip.className = 'skill-chip';
          chip.innerHTML = `<div>${s.name}</div><div class="skill-bar-wrap"><div class="skill-bar" style="width: 0%" data-pct="${s.pct}"></div></div>`;
          grid.appendChild(chip);
        });
        setTimeout(() => {
          document.querySelectorAll('.skill-bar').forEach(bar => {
            const pct = (bar as HTMLElement).getAttribute('data-pct');
            gsap.to(bar, { width: pct + '%', duration: 1.2, ease: 'power3.out', delay: Math.random() * 0.4 });
          });
        }, 100);
      }
    }
    if (activePanel === 'projects') {
      const body = document.getElementById('projects-body');
      if (body && body.children.length === 0) {
        const username = "bwana12";
        fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`)
          .then(res => res.json())
          .then(data => {
            const repos = Array.isArray(data) ? data.map((repo: any) => ({
              title: repo.name,
              desc: repo.description || "No description provided",
              tags: repo.topics?.length ? repo.topics : [repo.language || "JavaScript"],
              link: repo.html_url
            })) : PROJECTS;
            
            const allProjects = [...PROJECTS, ...repos].slice(0, 6);
            allProjects.forEach(p => {
              const card = document.createElement('div');
              card.className = 'project-card';
              card.innerHTML = `
                <div class="project-title">${p.title}</div>
                <div class="project-desc">${p.desc}</div>
                <div class="project-tags">${p.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}</div>
                <a href="${p.link}" target="_blank" class="project-link">View Project →</a>
              `;
              body.appendChild(card);
            });
          });
      }
    }
  }, [activePanel]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#050810]">
      <canvas ref={canvasRef} id="c"></canvas>
      <div id="vignette"></div>

      {/* LOADING */}
      {!isLoaded && (
        <div id="loader">
          <div className="loader-title">BWANA<span>MWASE</span></div>
          <div className="loader-bar-wrap">
            <div className="loader-bar" style={{ width: `${loadPct}%` }}></div>
          </div>
          <div className="loader-pct">MAPPING STAR SYSTEMS... {Math.floor(loadPct)}%</div>
        </div>
      )}

      {/* HUD */}
      <nav id="hud" style={{ 
        opacity: isLoaded ? 1 : 0, 
        pointerEvents: isLoaded ? 'all' : 'none',
        transition: 'opacity 0.8s ease-out'
      }}>
        <div className="hud-logo">Bwana<span>Mwase</span></div>
        <ul className="hud-nav">
          <li><a href="#" onClick={(e) => { e.preventDefault(); openPanel('about'); }}>About</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); openPanel('skills'); }}>Skills</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); openPanel('projects'); }}>Projects</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); openPanel('contact'); }}>Contact</a></li>
          <li><a href="#" onClick={(e) => { 
            e.preventDefault(); 
            if (cameraRef.current) {
              gsap.to(cameraRef.current.position, { x: 0, y: 5, z: 35, duration: 1.8, ease: 'power3.inOut' });
              gsap.to(cameraRef.current.rotation, { x: 0, y: 0, z: 0, duration: 1.8 });
            }
          }}>Exit</a></li>
        </ul>
      </nav>

      {/* INTRO */}
      {isLoaded && !activePanel && (
        <div id="intro" style={{ opacity: isEntering ? 0 : 1, transition: 'opacity 0.6s' }}>
          <div className="intro-headline">
            <span className="line"><span className="word" style={{ opacity: 1, transform: 'translateY(0)' }}>BWANA</span></span>
            <span className="line"><span className="word" style={{ opacity: 1, transform: 'translateY(0)' }}>MWASE</span></span>
          </div>
          <p className="intro-sub" style={{ opacity: 1, transform: 'translateY(0)' }}>Full Stack Developer · Creative Technology</p>
          <p className="intro-sub" style={{ opacity: 0.6, fontSize: '0.6rem', marginTop: '2rem' }}>Click a planet to explore</p>
        </div>
      )}

      {/* PANEL OVERLAY */}
      <div id="panel-overlay">
        <div className="panel-glass">
          <button className="panel-close" onClick={closePanel}>×</button>
          <div dangerouslySetInnerHTML={{ __html: activePanel ? (CONTENT as any)[activePanel] : '' }}></div>
        </div>
      </div>
    </div>
  );
}
