import { drawMesh } from "./graphics/Renderer.js";
import { Camera } from "./graphics/Camera.js";
import { createMartianLevel } from "./scene/Level.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const positionReadout = document.getElementById("positionReadout");
if (!ctx) throw new Error("Could not create a 2D Canvas rendering context.");

const { objects, playerObjects } = createMartianLevel();
const player = { x: 0, z: 5.5, speed: 4.2, yaw: 0 };
const startPosition = { x: 0, z: 5.5 };
const keys = new Set();

// Save each astronaut component's offset from the player's origin.
const playerParts = playerObjects.map(object => ({
  object,
  offsetX: object.transform.position.x - startPosition.x,
  offsetZ: object.transform.position.z - startPosition.z,
  baseYaw: object.transform.rotation.y
}));

let width = 0;
let height = 0;
let camera;
let lastFrameTime = 0;
let cameraPosition = { x: player.x, y: 4.8, z: player.z - 7.2 };

const cameraOffset = { x: 0, y: 4.8, z: -7.2 };
const cameraLookOffset = { x: 0, y: 1.35, z: 0.65 };
const worldBounds = { minX: -12, maxX: 12, minZ: 3, maxZ: 43 };

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = rect.width;
  height = rect.height;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (!camera) {
    camera = new Camera({
      position: cameraPosition,
      target: { x: player.x, y: 1.35, z: player.z + 0.65 },
      fx: height * 0.95,
      fy: height * 0.95,
      cx: width / 2,
      cy: height / 2,
      near: 0.1,
      width,
      height
    });
  } else {
    camera.setViewport(width, height);
  }
  render();
}

function updatePlayer(deltaTime) {
  let moveX = 0;
  let moveZ = 0;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) moveX -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) moveX += 1;
  if (keys.has("KeyW") || keys.has("ArrowUp")) moveZ += 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) moveZ -= 1;

  const magnitude = Math.hypot(moveX, moveZ);
  if (magnitude > 0) {
    // Normalize diagonal input so diagonal movement is not faster.
    moveX /= magnitude;
    moveZ /= magnitude;
    const running = keys.has("ShiftLeft") || keys.has("ShiftRight");
    const speed = player.speed * (running ? 1.65 : 1);

    player.x += moveX * speed * deltaTime;
    player.z += moveZ * speed * deltaTime;
    player.x = clamp(player.x, worldBounds.minX, worldBounds.maxX);
    player.z = clamp(player.z, worldBounds.minZ, worldBounds.maxZ);

    // +Z is the astronaut's forward direction; yaw rotates its group toward motion.
    player.yaw = Math.atan2(moveX, moveZ);
  }

  updatePlayerGeometry();
}

function updatePlayerGeometry() {
  const cos = Math.cos(player.yaw);
  const sin = Math.sin(player.yaw);
  for (const part of playerParts) {
    const { object, offsetX, offsetZ, baseYaw } = part;
    object.transform.position.x = player.x + offsetX * cos + offsetZ * sin;
    object.transform.position.z = player.z - offsetX * sin + offsetZ * cos;
    object.transform.rotation.y = baseYaw + player.yaw;
  }
}

function updateCamera(deltaTime) {
  const desiredPosition = {
    x: player.x + cameraOffset.x,
    y: cameraOffset.y,
    z: player.z + cameraOffset.z
  };
  const target = {
    x: player.x + cameraLookOffset.x,
    y: cameraLookOffset.y,
    z: player.z + cameraLookOffset.z
  };

  // Exponential smoothing keeps the camera follow responsive but not abrupt.
  const follow = 1 - Math.exp(-8 * deltaTime);
  cameraPosition.x += (desiredPosition.x - cameraPosition.x) * follow;
  cameraPosition.y += (desiredPosition.y - cameraPosition.y) * follow;
  cameraPosition.z += (desiredPosition.z - cameraPosition.z) * follow;
  camera.setPose(cameraPosition, target);
}

function render() {
  if (!camera) return;
  ctx.fillStyle = "#191b1e";
  ctx.fillRect(0, 0, width, height);

  for (const object of objects) {
    drawMesh(ctx, object.mesh, object.transform, camera, {
      color: object.color,
      lineWidth: object.lineWidth
    });
  }

  positionReadout.textContent = `X ${player.x.toFixed(1)} · Z ${player.z.toFixed(1)}`;
}

function frame(timestamp) {
  const deltaTime = lastFrameTime === 0
    ? 0
    : Math.min((timestamp - lastFrameTime) / 1000, 0.05);
  lastFrameTime = timestamp;

  updatePlayer(deltaTime);
  updateCamera(deltaTime);
  render();
  requestAnimationFrame(frame);
}

function resetPlayer() {
  player.x = startPosition.x;
  player.z = startPosition.z;
  player.yaw = 0;
  updatePlayerGeometry();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

window.addEventListener("keydown", event => {
  const movementKeys = ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ShiftLeft", "ShiftRight"];
  if (movementKeys.includes(event.code)) event.preventDefault();
  if (event.code === "KeyR" && !event.repeat) resetPlayer();
  keys.add(event.code);
});

window.addEventListener("keyup", event => keys.delete(event.code));
window.addEventListener("blur", () => keys.clear());
window.addEventListener("resize", resizeCanvas);

updatePlayerGeometry();
resizeCanvas();
requestAnimationFrame(frame);
