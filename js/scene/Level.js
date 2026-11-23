import { Mesh, createCube, createPyramid } from "./Mesh.js";

/**
 * Build the first LAST FUEL level from reusable wireframe meshes.
 * Every transform position is expressed in world coordinates.
 */
export function createMartianLevel() {
  const objects = [];

  // 1) A regular grid gives us a clear sense of ground scale and perspective.
  const ground = createGroundGrid(38, 46, 19, 23);
  objects.push({
    mesh: ground,
    transform: at(0, -0.08, 24),
    color: "#9a5140",
    lineWidth: 1
  });

  // 2) Mountains form a visual boundary on both sides of the playable area.
  const mountainSpecs = [
    [-15, 4, 10, 5, 5], [-16, 6, 18, 7, 8],
    [-14, 5, 28, 6, 7], [-16, 7, 38, 8, 10],
    [15, 5, 12, 6, 7], [16, 7, 22, 8, 10],
    [14, 5, 32, 6, 8], [16, 6, 41, 7, 9]
  ];
  mountainSpecs.forEach(([x, width, z, depth, height], i) => {
    objects.push({
      mesh: createPyramid(width, height),
      transform: at(x, 0, z, 0, (i % 2) * 0.22, 0),
      color: i % 2 ? "#a85c45" : "#c16b4c",
      lineWidth: 1.7
    });
  });

  // 3) Irregular rocks: each one is a small low-poly wireframe mesh.
  const rockSpecs = [
    [-5.5, 0, 8, 1.3], [5.2, 0, 10, 1.1],
    [-8.5, 0, 15, 1.7], [7.5, 0, 17, 1.4],
    [-4.5, 0, 21, 1.0], [5.0, 0, 25, 1.6],
    [-9.0, 0, 29, 1.5], [9.0, 0, 31, 1.8],
    [-5.5, 0, 36, 1.2], [4.5, 0, 39, 1.4]
  ];
  rockSpecs.forEach(([x, y, z, size], i) => {
    objects.push({
      mesh: createRock(size, 0.65 + (i % 3) * 0.25),
      transform: at(x, y, z, 0.12 * (i % 3), 0.31 * i, 0.08 * (i % 2)),
      color: "#d08a65",
      lineWidth: 1.5
    });
  });

  // 4) A few larger formations make the route feel less empty.
  [
    [-10, 0, 23, 2.8, 2.8],
    [10, 0, 26, 3.2, 3.4],
    [-11, 0, 34, 2.5, 2.4],
    [11, 0, 14, 2.4, 2.7]
  ].forEach(([x, y, z, size, height], i) => {
    objects.push({
      mesh: createPyramid(size, height),
      transform: at(x, y, z, 0, i * 0.35, 0),
      color: "#b66b50",
      lineWidth: 1.6
    });
  });

  // 5) The astronaut is a temporary low-poly blockout, not a final character.
  // Keep its component meshes together so the player can move as one entity.
  const playerObjects = createAstronaut(0, 0, 5.5);
  objects.push(...playerObjects);

  // 6) The damaged ship is the far-end destination of the level.
  objects.push({
    mesh: createSpaceship(),
    transform: at(0, 0.65, 38, 0, -0.12, 0),
    color: "#9fd0dc",
    lineWidth: 2
  });

  return { objects, playerObjects };
}

function createGroundGrid(width, depth, columns, rows) {
  const vertices = [];
  const edges = [];

  for (let row = 0; row <= rows; row++) {
    const z = -depth / 2 + (depth * row) / rows;
    for (let col = 0; col <= columns; col++) {
      const x = -width / 2 + (width * col) / columns;
      vertices.push([x, 0, z]);
    }
  }

  const index = (row, col) => row * (columns + 1) + col;
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= columns; col++) {
      if (col < columns) edges.push([index(row, col), index(row, col + 1)]);
      if (row < rows) edges.push([index(row, col), index(row + 1, col)]);
    }
  }

  return new Mesh("Martian Ground Grid", vertices, edges);
}

function createRock(width, height) {
  const x = width / 2;
  const y = height;
  const z = width / 2;
  const vertices = [
    [-x * 0.75, 0, -z], [x * 0.75, 0, -z * 0.8],
    [x, 0, z * 0.65], [-x * 0.8, 0, z],
    [-x, y * 0.55, -z * 0.35], [x * 0.35, y, -z * 0.25],
    [x * 0.9, y * 0.55, z * 0.5], [-x * 0.4, y * 0.7, z * 0.85]
  ];
  const edges = [
    [0,1],[1,2],[2,3],[3,0],
    [4,5],[5,6],[6,7],[7,4],
    [0,4],[1,5],[2,6],[3,7],
    [4,6],[5,7]
  ];
  return new Mesh("Low-poly Rock", vertices, edges);
}

function createAstronaut(x, y, z) {
  const parts = [];
  const add = (mesh, px, py, pz, color, rotation = {x:0,y:0,z:0}) => {
    parts.push({
      mesh,
      transform: { position: {x:px,y:py,z:pz}, rotation },
      color,
      lineWidth: 2
    });
  };

  // Body, helmet, backpack, arms and legs are separate simple meshes.
  add(createCube(0.85), x, y + 1.45, z, "#f2e7d8");
  add(createOctahedron(0.82), x, y + 2.35, z, "#c9e3e9");
  add(createCube(0.55), x, y + 1.45, z - 0.58, "#8db5c1");
  add(createCube(0.32), x - 0.62, y + 1.35, z, "#f2e7d8", {x:0.15,y:0,z:-0.12});
  add(createCube(0.32), x + 0.62, y + 1.35, z, "#f2e7d8", {x:-0.15,y:0,z:0.12});
  add(createCube(0.34), x - 0.24, y + 0.55, z, "#d7d0c6", {x:0.08,y:0,z:0.04});
  add(createCube(0.34), x + 0.24, y + 0.55, z, "#d7d0c6", {x:-0.08,y:0,z:-0.04});
  return parts;
}

function createOctahedron(size) {
  const h = size / 2;
  const vertices = [
    [0,h,0], [0,-h,0], [-h,0,0], [h,0,0], [0,0,-h], [0,0,h]
  ];
  const edges = [
    [0,2],[0,3],[0,4],[0,5],
    [1,2],[1,3],[1,4],[1,5],
    [2,4],[4,3],[3,5],[5,2]
  ];
  return new Mesh("Astronaut Helmet", vertices, edges);
}

function createSpaceship() {
  // Elongated central fuselage, wings, tail and cockpit outline.
  const vertices = [
    [0, 1.1,  2.8], [0.75, 0.65, 0.9], [0.75, 0.45, -2.2],
    [-0.75, 0.45, -2.2], [-0.75, 0.65, 0.9], [0, 0.35, -2.8],
    [3.3, 0.25, -1.1], [2.7, 0.25, 0.15], [-3.3, 0.25, -1.1],
    [-2.7, 0.25, 0.15], [0, 0.25, 1.1],
    [0, 1.45, 1.65], [0.55, 0.95, 0.9], [-0.55, 0.95, 0.9]
  ];
  const edges = [
    [0,1],[1,2],[2,5],[5,3],[3,4],[4,0],
    [1,4],[1,10],[4,10],[2,3],
    [6,7],[7,1],[1,4],[4,9],[9,8],[8,3],[3,2],[2,7],
    [0,11],[11,12],[12,1],[11,13],[13,4],[12,13],
    [6,8],[7,9]
  ];
  return new Mesh("Damaged Spaceship", vertices, edges);
}

function at(x, y, z, rx = 0, ry = 0, rz = 0) {
  return {
    position: { x, y, z },
    rotation: { x: rx, y: ry, z: rz }
  };
}
