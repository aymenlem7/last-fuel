/**
 * Camera model for LAST FUEL.
 *
 * Camera convention:
 *   +X = camera right
 *   +Y = camera up
 *   +Z = camera forward (toward the target)
 *
 * The camera stores its position and an orthonormal basis in WORLD space.
 * worldToCamera() projects a world-space displacement onto that basis.
 */
export class Camera {
  constructor({
    position,
    target,
    fx,
    fy,
    cx,
    cy,
    near = 0.1,
    width,
    height
  }) {
    this.position = { ...position };
    this.target = { ...target };

    this.fx = fx;
    this.fy = fy;
    this.cx = cx;
    this.cy = cy;
    this.near = near;
    this.width = width;
    this.height = height;

    this.updateOrientation();
  }

  updateOrientation() {
    // Forward points from the camera toward the target.
    this.forward = normalize(subtract(this.target, this.position));

    // World up is the reference used to define camera roll.
    const worldUp = { x: 0, y: 1, z: 0 };

    // With +Z forward, up × forward points toward camera-right (+X).
    let rightCandidate = cross(worldUp, this.forward);

    // Avoid a zero vector if the camera looks almost vertically up/down.
    if (length(rightCandidate) < 1e-8) {
      rightCandidate = cross({ x: 0, y: 0, z: 1 }, this.forward);
    }

    this.right = normalize(rightCandidate);
    this.up = normalize(cross(this.forward, this.right));
  }

  setPose(position, target) {
    this.position = { ...position };
    this.target = { ...target };
    this.updateOrientation();
  }

  setViewport(width, height) {
    this.width = width;
    this.height = height;
    this.cx = width / 2;
    this.cy = height / 2;
    this.fx = height * 0.95;
    this.fy = height * 0.95;
  }

  /**
   * Convert a world-space point into camera-space coordinates.
   *
   * Pc = R(Pw - C)
   *
   * The rows of R are the camera right, up and forward basis vectors.
   * This is equivalent to Pc = R Pw + t, with t = -R C.
   */
  worldToCamera(worldPoint) {
    const relative = subtract(worldPoint, this.position);

    return {
      x: dot(relative, this.right),
      y: dot(relative, this.up),
      z: dot(relative, this.forward)
    };
  }
}

function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

function length(v) {
  return Math.hypot(v.x, v.y, v.z);
}

function normalize(v) {
  const magnitude = length(v);
  if (magnitude < 1e-12) {
    throw new Error("Camera direction is undefined: position and target must differ.");
  }
  return { x: v.x / magnitude, y: v.y / magnitude, z: v.z / magnitude };
}
