const res_label = document.getElementById('res');
const title_label = document.getElementById('title');
const status_label = document.getElementById('status');
const level_label = document.getElementById('level');
let width, height, finished, eyeVector, vpRight, vpUp, halfWidth, halfHeight, pixelWidth, pixelHeight, ray, ctx, data;
let level_num=0;
let background = {};
let level_raycount = 0, total_raycount = 0, x = 0, y = 0;
let level_reflect = 0, total_reflect = 0;
let scene = {};
let rps = 32.0; // rays per second.
let rps_interval = 1000.0 / rps;
const cvs = document.getElementById('cvs');
cvs.width = 5;
cvs.height = 5;


function init_level(level_num) {
  scene = {
    info: level_data[level_num].info,
    camera: level_data[level_num].camera,
    objects: level_data[level_num].objects,
    lights: level_data[level_num].lights
  };
  width = scene.info.width;
  height = scene.info.height;
  background = scene.info.background;
  cvs.width = width;
  cvs.height = height;
  ctx = cvs.getContext('2d');
  data = ctx.getImageData(0, 0, width, height);
  cvs.style.cssText = `width: ${width * 8}px;height:${height * 8}px`;
  eyeVector = Vector.unitVector(Vector.subtract(scene.camera.vector, scene.camera.point));
  vpRight = Vector.unitVector(Vector.crossProduct(eyeVector, Vector.UP));
  vpUp = Vector.unitVector(Vector.crossProduct(vpRight, eyeVector));
  halfWidth = Math.tan(Math.PI * (scene.camera.fieldOfView / 2) / 180);
  halfHeight = height / width * halfWidth;
  pixelWidth = halfWidth * 2 / (width - 1);
  pixelHeight = halfHeight * 2 / (height - 1);
  ray = {point: scene.camera.point};
  level_raycount = 0;
  x = 0;
  y = 0;
  finished = false;

  res_label.innerHTML = `${width}x${height}`;
  title_label.innerText = scene.info.title;
  level_label.innerHTML = `Level: ${level_num}`;
  status_label.innerText = `Rendering: 0%`;
  //Fire off first tick
  tick();
}


function render_tick() {
  if (!finished) {
    if (x >= width) {
      x = 0;
      y++;
    }
    if (y >= height) {
      finished = true;
      status_label.innerHTML = "Finished!";
      total_raycount += level_raycount;
      total_reflect += level_reflect;
      level_num++;
      setTimeout(function(){
        init_level(level_num);
      },1000)
    }
    else {
      const xcomp = Vector.scale(vpRight, (x * pixelWidth) - halfWidth);
      const ycomp = Vector.scale(vpUp, (y * pixelHeight) - halfHeight);
      ray.vector = Vector.unitVector(Vector.add3(eyeVector, xcomp, ycomp));
      const color = trace(ray, scene, 0);
      level_raycount++;
      status_label.innerText = `Rendering - ${Math.min(100 / (width * height) * (x + (y * width)), 100)}%\nRays: ${level_raycount}  Reflections: ${level_reflect}`;
      const index = (x * 4) + (y * width * 4);
      data.data[index] = color.x;
      data.data[index + 1] = color.y;
      data.data[index + 2] = color.z;
      data.data[index + 3] = 255;
      ctx.putImageData(data, 0, 0);
      x++;
    }
  }
}

function trace(ray, scene, depth) {
  if (depth > 5) return;
  const distObject = intersectScene(ray, scene);
  if (distObject[0] === Infinity) {
    return {x:background.r, y:background.g, z:background.b};
  }
  const dist = distObject[0];
  const object = distObject[1];
  const pointAtTime = Vector.add(ray.point, Vector.scale(ray.vector, dist));
  return surface(ray, scene, object, pointAtTime, sphereNormal(object, pointAtTime), depth);
}

function intersectScene(ray, scene) {
  let closest = [Infinity, null];
  for (let i = 0; i < scene.objects.length; i++) {
    const object = scene.objects[i];
    const dist = sphereIntersection(object, ray);
    if (dist !== undefined && dist < closest[0]) {
      closest = [dist, object];
    }
  }
  return closest;
}


function sphereIntersection(sphere, ray) {
  const eye_to_center = Vector.subtract(sphere.point, ray.point);
  const v = Vector.dotProduct(eye_to_center, ray.vector);
  const eoDot = Vector.dotProduct(eye_to_center, eye_to_center);
  const discriminant = (sphere.radius * sphere.radius) - eoDot + (v * v);

  if (discriminant >= 0) {
    return v - Math.sqrt(discriminant);
  }
}

function sphereNormal(sphere, pos) {
  return Vector.unitVector(Vector.subtract(pos, sphere.point));
}


function surface(ray, scene, object, pointAtTime, normal, depth) {
  let c = Vector.ZERO;
  let lambertAmount = 0;

  if (object.lambert > 0) {
    for (let i = 0; i < scene.lights.length; i++) {
      const lightPoint = scene.lights[i];
      if (!isLightVisible(pointAtTime, scene, lightPoint)) continue;
      const contribution = Vector.dotProduct(Vector.unitVector(
        Vector.subtract(lightPoint, pointAtTime)), normal);
      if (contribution > 0) lambertAmount += contribution;
    }
  }

  if (object.specular > 0) {
    const reflectedRay = {
      point: pointAtTime,
      vector: Vector.reflectThrough(ray.vector, normal)
    };
    let reflectedColor;
    // Delay the firing of the reflective ray by the rps interval, so the reflection isn't "free"
    setTimeout(function () {
      reflectedColor = trace(reflectedRay, scene, ++depth);
    }, rps_interval);
    level_reflect++;
    level_raycount++;
    if (reflectedColor) {
      c = Vector.add(c, Vector.scale(reflectedColor, object.specular));
    }
  }

  return Vector.add3(c, Vector.scale(object.color, Math.min(1, lambertAmount) * object.lambert), Vector.scale(object.color, object.ambient));
}

function isLightVisible(pt, scene, light) {
  const distObject = intersectScene({
    point: pt,
    vector: Vector.unitVector(Vector.subtract(pt, light))
  }, scene);
  return distObject[0] > -0.005;
}


function tick() {
  render_tick();
  if (!finished) {
    setTimeout(tick, rps_interval);
  }
}


init_level(0);

