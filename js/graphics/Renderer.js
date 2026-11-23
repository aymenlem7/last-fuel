import { projectPoint } from "./Projection.js";
import { localToWorld } from "./Transform.js";

/**
 * Wireframe pipeline:
 * local -> world -> camera -> near-plane clipping -> perspective -> Canvas.
 * Edges are drawn without vertex markers to keep the game view uncluttered.
 */
export function drawMesh(ctx, mesh, transform, camera, style = {}) {
  const color = style.color ?? "#f2a47d";
  const lineWidth = style.lineWidth ?? 1.5;
  const cameraVertices = mesh.vertices.map(vertex => {
    const localPoint = { x: vertex[0], y: vertex[1], z: vertex[2] };
    return camera.worldToCamera(localToWorld(localPoint, transform));
  });

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  let drawnEdges = 0;

  for (const [startIndex, endIndex] of mesh.edges) {
    let a = cameraVertices[startIndex];
    let b = cameraVertices[endIndex];
    const near = camera.near;

    // Discard edges fully behind the camera's near plane.
    if (a.z <= near && b.z <= near) continue;

    // If only one endpoint is behind, move it to the near-plane intersection.
    if (a.z <= near || b.z <= near) {
      const t = (near - a.z) / (b.z - a.z);
      const intersection = {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        z: near
      };
      if (a.z <= near) a = intersection;
      else b = intersection;
    }

    const screenA = projectPoint(a, camera);
    const screenB = projectPoint(b, camera);
    if (!screenA || !screenB) continue;

    ctx.moveTo(screenA.x, screenA.y);
    ctx.lineTo(screenB.x, screenB.y);
    drawnEdges++;
  }

  ctx.stroke();
  return drawnEdges;
}
