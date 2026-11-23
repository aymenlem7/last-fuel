/**
 * A Mesh is geometry only: a list of 3D vertices and edges.
 * Vertices use local object coordinates, centered around the object's origin.
 * Each edge is [indexOfStartVertex, indexOfEndVertex].
 */
export class Mesh {
  constructor(name, vertices, edges) {
    this.name = name;
    this.vertices = vertices;
    this.edges = edges;
  }
}

export function createCube(size = 2) {
  const h = size / 2;

  const vertices = [
    [-h, -h, -h], // 0: bottom-front-left
    [ h, -h, -h], // 1: bottom-front-right
    [ h,  h, -h], // 2: top-front-right
    [-h,  h, -h], // 3: top-front-left
    [-h, -h,  h], // 4: bottom-back-left
    [ h, -h,  h], // 5: bottom-back-right
    [ h,  h,  h], // 6: top-back-right
    [-h,  h,  h]  // 7: top-back-left
  ];

  const edges = [
    [0,1], [1,2], [2,3], [3,0],
    [4,5], [5,6], [6,7], [7,4],
    [0,4], [1,5], [2,6], [3,7]
  ];

  return new Mesh("Cube", vertices, edges);
}

export function createPyramid(baseSize = 2, height = 2) {
  const h = baseSize / 2;

  const vertices = [
    [-h, 0, -h], // 0: base
    [ h, 0, -h], // 1: base
    [ h, 0,  h], // 2: base
    [-h, 0,  h], // 3: base
    [ 0, height, 0] // 4: apex
  ];

  const edges = [
    [0,1], [1,2], [2,3], [3,0],
    [0,4], [1,4], [2,4], [3,4]
  ];

  return new Mesh("Pyramid", vertices, edges);
}
