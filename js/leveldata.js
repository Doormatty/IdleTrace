const level_data =
  [{
    info: {
      width:20,
      height:20,
      title:"Hello Sphere",
      background: {r:0, g:0, b:0}
    },
    camera: {
      point: {x: 0, y: 5, z: 3},
      fieldOfView: 90,
      vector: {x: 0, y: 5, z: 0}
    },
    objects: [
      {
        type: 'sphere',
        point: {x: 0, y: 5, z: 0},
        color: {x: 155, y: 200, z: 155},
        specular: 0.0,
        lambert: 0.0,
        ambient: 1.0,
        radius: 2
      }],
    lights: [{x: -30, y: -10, z: 20}]
  },
    {
      info: {
        width:25,
        height:25,
        title:"Level Two?",
        background: {r:50, g:50, b:50}
      },
      camera: {
        point: {x: 0, y: 5, z: 3},
        fieldOfView: 90,
        vector: {x: 0, y: 5, z: 0}
      },
      objects: [
        {
          type: 'sphere',
          point: {x: 0, y: 5, z: 0},
          color: {x: 0, y: 200, z: 155},
          specular: 0.5,
          lambert: 0.0,
          ambient: 0.5,
          radius: 2
        },
        {
          type: 'sphere',
          point: {x: 1, y: 2, z: 0},
          color: {x: 100, y: 0, z: 155},
          specular: 0.5,
          lambert: 0.0,
          ambient: 0.5,
          radius: 0.5
        }],
      lights: [{x: -30, y: -10, z: 20}]
    }];
