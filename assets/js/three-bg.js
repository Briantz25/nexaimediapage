// Three.js Interactive 3D Wave Grid Particle Background
(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  let scene, camera, renderer, particles;
  let positions, initialY;
  const countX = 60;
  const countY = 60;
  const numParticles = countX * countY;
  const separation = 40;

  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  function init() {
    // Scene & Camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;
    camera.position.y = 400;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Particle Geometry
    const geometry = new THREE.BufferGeometry();
    positions = new Float32Array(numParticles * 3);
    initialY = new Float32Array(numParticles);

    let i = 0, p = 0;
    for (let ix = 0; ix < countX; ix++) {
      for (let iy = 0; iy < countY; iy++) {
        // Center the grid on (0, 0)
        const x = ix * separation - (countX * separation) / 2;
        const z = iy * separation - (countY * separation) / 2;
        const y = 0;

        positions[i] = x;
        positions[i + 1] = y;
        positions[i + 2] = z;

        initialY[p] = y;

        i += 3;
        p++;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle Material
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.8,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });

    // Create Points mesh
    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Renderer (Binding to our existing canvas)
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Event Listeners
    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onDocumentMouseMove(event) {
    targetMouseX = event.clientX - windowHalfX;
    targetMouseY = event.clientY - windowHalfY;
  }

  // Animation Loop
  let count = 0;
  function animate() {
    requestAnimationFrame(animate);

    // Smooth mouse interpolation
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Subtle camera tilt following mouse
    camera.position.x = mouseX * 0.3;
    camera.position.y = 400 + (mouseY * 0.3);
    camera.lookAt(scene.position);

    const positionsAttr = particles.geometry.attributes.position;
    const array = positionsAttr.array;

    let i = 0, p = 0;
    for (let ix = 0; ix < countX; ix++) {
      for (let iy = 0; iy < countY; iy++) {
        // Calculate sine/cosine waves for fluid movement
        const waveX = Math.sin((ix + count) * 0.3) * 50;
        const waveY = Math.sin((iy + count) * 0.5) * 50;
        
        // Base coordinate positions
        const px = array[i];
        const pz = array[i + 2];

        // Interaction with mouse distance
        let distEffect = 0;
        if (targetMouseX !== 0 || targetMouseY !== 0) {
          const dx = px - (mouseX * 2);
          const dz = pz - (mouseY * 2);
          const distance = Math.sqrt(dx * dx + dz * dz);
          if (distance < 400) {
            distEffect = (400 - distance) * 0.35 * Math.sin(count * 2);
          }
        }

        // Apply new height position
        array[i + 1] = waveX + waveY + distEffect;

        i += 3;
        p++;
      }
    }

    positionsAttr.needsUpdate = true;
    renderer.render(scene, camera);
    count += 0.05;
  }

  init();
  animate();
})();
