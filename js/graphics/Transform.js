/**
 * Rotate a local point around X, then Y, then Z.
 * Angles are in radians.
 *
 * The order matters: 3D rotations are not generally interchangeable.
 */
export function rotateXYZ(point, rotation) {
  let { x, y, z } = point;
  const { x: rx, y: ry, z: rz } = rotation;

  // Rotation around X axis.
  let cos = Math.cos(rx), sin = Math.sin(rx);
  let y1 = y * cos - z * sin;
  let z1 = y * sin + z * cos;
  y = y1; z = z1;

  // Rotation around Y axis.
  cos = Math.cos(ry); sin = Math.sin(ry);
  let x2 = x * cos + z * sin;
  let z2 = -x * sin + z * cos;
  x = x2; z = z2;

  // Rotation around Z axis.
  cos = Math.cos(rz); sin = Math.sin(rz);
  let x3 = x * cos - y * sin;
  let y3 = x * sin + y * cos;
  x = x3; y = y3;

  return { x, y, z };
}

/**
 * Convert a local-space point into world-space coordinates:
 * rotate first, then translate.
 */
export function localToWorld(point, transform) {
  const rotated = rotateXYZ(point, transform.rotation);
  return {
    x: rotated.x + transform.position.x,
    y: rotated.y + transform.position.y,
    z: rotated.z + transform.position.z
  };
}

/**
 * Current milestone camera is at (0,0,0), with no rotation.
 * Therefore world coordinates equal camera coordinates.
 * We will replace this identity operation with a real view transform later.
 */
export function worldToCamera(point) {
  return { x: point.x, y: point.y, z: point.z };
}
