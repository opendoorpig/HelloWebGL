// PointLightedCube_perFragment.js (c) 2012 matsuda and kanda
// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
      //  'attribute vec4 a_Color;\n' + // Defined constant in main()
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 uMVPMatrix;\n' +
    'uniform mat4 uModelMatrix;\n' +    // Model matrix
    'uniform mat4 uNormalMatrix;\n' +   // Transformation matrix of the normal
    'varying vec4 v_Color;\n' +
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'void main() {\n' +
    '  vec4 color = vec4(1.0, 1.0, 1.0, 1.0);\n' + // Sphere color
    '  gl_Position = uMVPMatrix * a_Position;\n' +
      // Calculate the vertex position in the world coordinate
    '  v_Position = vec3(uModelMatrix * a_Position);\n' +
    '  v_Normal = normalize(vec3(uNormalMatrix * a_Normal));\n' +
    '  v_Color = color;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'uniform vec3 u_LightColor;\n' +     // Light color
    'uniform vec3 u_LightPosition;\n' +  // Position of the light source
    'uniform vec3 u_AmbientLight;\n' +   // Ambient light color
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
      // Normalize the normal because it is interpolated and not 1.0 in length any more
    '  vec3 normal = normalize(v_Normal);\n' +
      // Calculate the light direction and make it 1.0 in length
    '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
      // The dot product of the light direction and the normal
    '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
      // Calculate the final color from diffuse reflection and ambient reflection
    '  vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;\n' +
    '  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
    '  gl_FragColor = vec4(diffuse + ambient, v_Color.a);\n' +
    '}\n';

// Retrieve <canvas> element
var canvas = document.getElementById('webgl');
var label = document.getElementById('nearFar');

function main() {
  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  //
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }else {
    console.log('Vertex: ' + n);
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables
  var uModelMatrix = gl.getUniformLocation(gl.program, 'uModelMatrix');
  var uMVPMatrix = gl.getUniformLocation(gl.program, 'uMVPMatrix');
  var uNormalMatrix = gl.getUniformLocation(gl.program, 'uNormalMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  if (!uModelMatrix || !uMVPMatrix || !uNormalMatrix || !u_LightColor || !u_LightPosition　|| !u_AmbientLight) {
    console.log('Failed to get the storage location');
    return;
  }

  // Set the light color (white)
  gl.uniform3f(u_LightColor, 0.8, 0.8, 0.8);
  // Set the light direction (in the world coordinate)
  gl.uniform3f(u_LightPosition, 5.0, 8.0, 7.0);
  // Set the ambient light
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

  var modelMatrix = new Matrix4();  // Model matrix
  var mvpMatrix = new Matrix4();    // Model view projection matrix
  var normalMatrix = new Matrix4(); // Transformation matrix for normals

  // Calculate the model matrix
  modelMatrix.setRotate(90, 0, 1, 0); // Rotate around the y-axis
  // Calculate the view projection matrix
  mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  mvpMatrix.lookAt(0, 0, 6, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(modelMatrix);
  // Calculate the matrix to transform the normal based on the model matrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();

  // Pass the model matrix to uModelMatrix
  gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix.elements);

  // Pass the model view projection matrix to uMVPMatrix
  gl.uniformMatrix4fv(uMVPMatrix, false, mvpMatrix.elements);

  // Pass the transformation matrix for normals to uNormalMatrix
  gl.uniformMatrix4fv(uNormalMatrix, false, normalMatrix.elements);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  document.onkeydown = function(ev) {
    keydown(ev, gl, n, uMVPMatrix, mvpMatrix);
  }

  document.onmousewheel = function(ev) {
    mousewheel(ev, gl, n, uMVPMatrix, mvpMatrix);
  }

  // Draw the cube
  draw(gl, n, uMVPMatrix, mvpMatrix);
  //gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
}

function initVertexBuffers(gl) { // Create a sphere
  var SPHERE_DIV = 32;

  var i, ai, si, ci;
  var j, aj, sj, cj;
  var p1, p2;

  var positions = [];
  var indices = [];

  // Generate coordinates
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = j * Math.PI / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = i * 2 * Math.PI / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      positions.push(si * sj);  // X
      positions.push(cj);       // Y
      positions.push(ci * sj);  // Z
    }
  }

  // Generate indices
  for (j = 0; j < SPHERE_DIV; j++) {
    for (i = 0; i < SPHERE_DIV; i++) {
      p1 = j * (SPHERE_DIV+1) + i;
      p2 = p1 + (SPHERE_DIV+1);

      indices.push(p1);
      indices.push(p2);
      indices.push(p1 + 1);

      indices.push(p1 + 1);
      indices.push(p2);
      indices.push(p2 + 1);
    }
  }

  // Write the vertex property to buffers (coordinates and normals)
  // Same data can be used for vertex and normal
  // In order to make it intelligible, another buffer is prepared separately
  if (!initArrayBuffer(gl, 'a_Position', new Float32Array(positions), gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(positions), gl.FLOAT, 3))  return -1;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer(gl, attribute, data, type, num) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}


var vX = 3.0, vY = 3.0, vZ = 7;
var mX = 60, mY = 100, mZ = 100;
var tX = 0.0, tY = 0.0, tZ = 0.0;
function keydown (ev, gl, n, uMVPMatrix, mvpMatrix) {
  if(ev.keyCode == 39) {
    vX += 0.1;
    if(vX > 3) {
      vX = -3;
    }
  } else if (ev.keyCode == 37) {
    vX -= 0.1;
    if(vX < -3){
      vX = 3;
    }
  } else if (ev.keyCode == 38) {
    vY += 0.1;
    if(vY > 3){
      vY = -3.0;
    }
  } else if (ev.keyCode == 40) {
    vY -= 0.1;
    if(vY < -3) {
      vY = 3.0;
    }
  } else if (ev.keyCode == 33) {
    vZ += 1;
    if(vZ > 20){
      vZ = -1;
    }
  } else if (ev.keyCode == 34) {
    vZ -= 1;
    if(vZ < -1) {
      vZ = 20;
    }
  } else if(ev.keyCode == 87) {
    mX += 5;
    if(mX > 360) {
      mX = mX - 360;
    }
  } else if (ev.keyCode == 83) {
    mX -= 5;
    if(mX < 0){
      mX = mX + 360;
    }
  } else if (ev.keyCode == 65) {
    mY += 5;
    if(mY > 360){
      mY = mY - 360;
    }
  } else if (ev.keyCode == 68) {
    mY -= 5;
    if(mY < 0) {
      mY = mY + 360;
    }
  } else if (ev.keyCode == 81) {
    mZ += 5;
    if(mZ > 360){
      mZ = mZ - 360;
    }
  } else if (ev.keyCode == 69) {
    mZ -= 5;
    if(mZ < 0) {
      mZ = mZ + 360;
    }
  } else {
    return;
  }
  draw(gl, n, uMVPMatrix, mvpMatrix);
}

var gNear = 1.0, gFar = 100.0;
function mousewheel(ev, gl, n, uMVPMatrix, mvpMatrix) {
  if(ev.wheelDelta < 0){
    if(event.shiftKey){
      gNear += 1.0;
    }else if(event.altKey) {
      gFar += 1.0;
    }
  } else if(ev.wheelDelta > 0){
    if(event.shiftKey){
      gNear -= 1.0;
    }else if(event.altKey) {
      gFar -= 1.0;
    }
  }
  draw(gl, n, uMVPMatrix, mvpMatrix);
}

function draw(gl, n, uMVPMatrix, mvpMatrix) {
  mvpMatrix.setPerspective(30, canvas.width/canvas.height, gNear, gFar);//透视投影
  mvpMatrix.lookAt(vX, vY, vZ, 0, 0, 0, 0, 1, 0);
  //mvpMatrix.rotate(mX, mY, mZ, 1);
  var uModelMatrix = gl.getUniformLocation(gl.program, 'uModelMatrix');
  var modelMatrix = new Matrix4(); //另一种设置旋转平移的方法，独立出来，方便变换法向量
  modelMatrix.setRotate(mX, mY, mZ, 1);
  mvpMatrix.multiply(modelMatrix);
  gl.uniformMatrix4fv(uMVPMatrix, false, mvpMatrix.elements);

  var uNormalMatrix = gl.getUniformLocation(gl.program, 'uNormalMatrix');
  var normalMatrix = new Matrix4();
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(uNormalMatrix, false, normalMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);

  label.innerHTML = 'near: ' + Math.round(gNear*100)/100 + ', far: ' + Math.round(gFar*100)/100 +
  ', vX: ' + Math.round(vX*100)/100 + ', vY: ' + Math.round(vY*100)/100 + ', vZ: ' + Math.round(vZ*100)/100 +
  ', mX: ' + Math.round(mX*100)/100 + ', mY: ' + Math.round(mY*100)/100 + ', mZ: ' + Math.round(mZ*100)/100;
}