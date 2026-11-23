/**
 * Perspective-project a point already expressed in CAMERA SPACE.
 * Camera convention: +X right, +Y up, +Z forward.
 * Canvas convention: +u right, +v down.
 */
export function projectPoint(point, camera) {
  const { x, y, z } = point;
  const { fx, fy, cx, cy, near, width, height } = camera;

  if (![x, y, z, fx, fy, cx, cy, near].every(Number.isFinite)) return null;
  if (z <= near) return null;

  const u = cx + fx * (x / z);
  const v = cy - fy * (y / z);

  return {
    x: u,
    y: v,
    depth: z,
    visibleOnCanvas: u >= 0 && u < width && v >= 0 && v < height
  };
}
