import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const mount = document.querySelector("#success-scene");
const fallback = mount?.querySelector(".success-scene__fallback");

if (mount) {
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-3, 3, 1.9, -1.9, 0.1, 50);
    camera.position.set(0, 0, 12);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.append(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.45));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(-3, 5, 8);
    scene.add(keyLight);
    const greenLight = new THREE.PointLight(0x25d366, 18, 8);
    greenLight.position.set(2, 1.5, 3);
    scene.add(greenLight);

    const buttonRadius = 1;
    const button = new THREE.Group();
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x173d30, roughness: 0.3, metalness: 0.24 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(buttonRadius, buttonRadius, 0.42, 96), baseMaterial);
    base.rotation.x = Math.PI / 2;
    button.add(base);

    const capMaterial = new THREE.MeshBasicMaterial({ color: 0x25d366, toneMapped: false });
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.91, 0.91, 0.12, 96), capMaterial);
    cap.rotation.x = Math.PI / 2;
    cap.position.z = 0.22;
    button.add(cap);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.91, 0.025, 10, 96),
      new THREE.MeshStandardMaterial({ color: 0x92ffd0, roughness: 0.22, metalness: 0.28 }),
    );
    rim.position.z = 0.285;
    button.add(rim);

    const borderPoints = Array.from({ length: 129 }, (_, index) => {
      const angle = (index / 128) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle) * 0.96, Math.sin(angle) * 0.96, 0.3);
    });
    const borderGeometry = new THREE.BufferGeometry().setFromPoints(borderPoints);
    const borderGlow = new THREE.Line(borderGeometry.clone(), new THREE.LineBasicMaterial({ color: 0x79ffd0, transparent: true, opacity: 0.42 }));
    const border = new THREE.Line(borderGeometry, new THREE.LineBasicMaterial({ color: 0xd0ffeb }));
    borderGlow.geometry.setDrawRange(0, 0);
    border.geometry.setDrawRange(0, 0);
    button.add(borderGlow, border);

    const checkPoints = [];
    const checkStart = new THREE.Vector3(-0.4, -0.02, 0.34);
    const checkCorner = new THREE.Vector3(-0.1, -0.32, 0.34);
    const checkEnd = new THREE.Vector3(0.47, 0.32, 0.34);
    for (let index = 0; index <= 60; index += 1) {
      const progress = index / 60;
      const point = progress < 0.44
        ? checkStart.clone().lerp(checkCorner, progress / 0.44)
        : checkCorner.clone().lerp(checkEnd, (progress - 0.44) / 0.56);
      checkPoints.push(point);
    }
    const checkCurve = new THREE.CatmullRomCurve3(checkPoints);
    const checkGeometry = new THREE.BufferGeometry().setFromPoints(checkPoints);
    checkGeometry.setDrawRange(0, 0);
    const checkMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });
    const check = new THREE.Line(checkGeometry, checkMaterial);
    const checkGlowGeometry = new THREE.TubeGeometry(checkCurve, 60, 0.055, 8, false);
    checkGlowGeometry.setDrawRange(0, 0);
    const checkGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const checkGlow = new THREE.Mesh(checkGlowGeometry, checkGlowMaterial);
    const checkLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    button.add(checkGlow, check, checkLight);

    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const shadowContext = shadowCanvas.getContext("2d");
    if (!shadowContext) throw new Error("Unable to create the button shadow texture.");
    const shadowGradient = shadowContext.createRadialGradient(64, 64, 8, 64, 64, 64);
    shadowGradient.addColorStop(0, "rgba(14, 45, 34, 0.32)");
    shadowGradient.addColorStop(0.45, "rgba(14, 45, 34, 0.16)");
    shadowGradient.addColorStop(1, "rgba(14, 45, 34, 0)");
    shadowContext.fillStyle = shadowGradient;
    shadowContext.fillRect(0, 0, 128, 128);
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.1, 3.1),
      new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }),
    );
    shadow.scale.set(1, 0.42, 1);
    shadow.position.set(0, -0.82, -0.45);
    scene.add(shadow);
    const contactShadow = new THREE.Mesh(
      new THREE.CircleGeometry(1, 64),
      new THREE.MeshBasicMaterial({ color: 0x173d30, transparent: true, opacity: 0.12, depthWrite: false }),
    );
    contactShadow.scale.set(1.05, 0.16, 1);
    contactShadow.position.set(0, -0.72, -0.36);
    scene.add(contactShadow);

    button.scale.setScalar(1.15);
    button.rotation.set(-0.08, -0.13, 0.025);
    scene.add(button);

    const startColor = new THREE.Color(0x25d366);
    const finishColor = new THREE.Color(0x25d366);
    const animationDuration = 3200;
    const startedAt = performance.now();

    function resize() {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      const aspect = width / Math.max(height, 1);
      const viewHeight = 3.8;
      camera.left = -viewHeight * aspect / 2;
      camera.right = viewHeight * aspect / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    function ease(value) {
      const clamped = Math.max(0, Math.min(1, value));
      return clamped * clamped * (3 - 2 * clamped);
    }

    function render(now) {
      const progress = animationDuration === 0 ? 1 : Math.min((now - startedAt) / animationDuration, 1);
      const borderProgress = ease(progress / 0.48);
      const fillProgress = ease((progress - 0.28) / 0.48);
      const checkProgress = ease((progress - 0.64) / 0.3);
      const borderCount = Math.max(0, Math.floor(borderPoints.length * borderProgress));
      border.geometry.setDrawRange(0, borderCount);
      borderGlow.geometry.setDrawRange(0, borderCount);
      baseMaterial.color.lerpColors(startColor, finishColor, fillProgress);
      check.geometry.setDrawRange(0, Math.floor((checkPoints.length - 1) * checkProgress) + (checkProgress > 0 ? 1 : 0));
      checkGlow.geometry.setDrawRange(0, Math.floor(checkGlowGeometry.index.count * checkProgress));
      checkMaterial.opacity = 0.25 + checkProgress * 0.75;
      checkGlowMaterial.opacity = 0.18 + checkProgress * 0.32;
      checkLight.position.copy(checkCurve.getPointAt(checkProgress));
      checkLight.material.opacity = checkProgress > 0 && checkProgress < 1 ? 0.9 : 0;
      greenLight.intensity = 5 + fillProgress * 15;
      button.position.y = progress < 1 ? Math.sin(progress * Math.PI) * 0.08 : 0;
      button.rotation.y = -0.12 + (progress < 1 ? Math.sin(progress * Math.PI) * 0.035 : 0);
      renderer.render(scene, camera);
      if (progress < 1) requestAnimationFrame(render);
    }

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(render);
  } catch {
    if (fallback) fallback.hidden = false;
  }
}