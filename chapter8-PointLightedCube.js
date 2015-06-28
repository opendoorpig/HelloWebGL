/**
 * Created by xiawei on 2014/12/26.
 */

var VSHADER_SOURCE =
    'attribute vec4 aPosition;\n' +
    'attribute vec4 aColor;\n' +
    'attribute vec4 aNormal;\n' +
    'uniform mat4 uMVPMatrix;\n' +
    'uniform mat4 uModelMatrix;\n' +
    'uniform mat4 uNormalMatrix;\n' +
    'uniform vec3 uLightColor;\n' +
    'uniform vec3 uLightPosition;\n' +
    'uniform vec3 uAmbientLight;\n' +
    'varying vec4 vColor;\n' +
    'void main() {\n' +
    '   gl_Position = uMVPMatrix * aPosition;\n' +
    '   vec3 normal = normalize(vec3(uNormalMatrix * aNormal));\n' +
    '   vec4 vertexPosition = uModelMatrix * aPosition;\n' +
    '   vec3 lightDirection = normalize(uLightPosition - vec3(vertexPosition));\n' +
    '   float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
    '   vec3 diffuse = uLightColor * vec3(aColor) * nDotL;\n' +
    '   vec3 ambient = uAmbientLight * aColor.rgb;\n' +
    '   vColor = vec4(diffuse+ambient, aColor.a);\n' +
    '}\n';

var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec4 vColor;\n' +
    'void main() {\n' +
    '   gl_FragColor = vColor;\n' +
    '}\n';

var label = document.getElementById('nearFar');
var canvas = document.getElementById('webgl');
if(!canvas){
    console.log('获取canvas元素失败！');
}

function main() {
    var gl = getWebGLContext(canvas);
    if(!gl){
        console.log('获取WebGL绘图句柄失败！');
        return;
    }

    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('初始化着色器失败！');
        return;
    }

    gl.clearColor(0.2, 0.6, 0.3, 0.9);
    //gl.clear(gl.COLOR_BUFFER_BIT);
    //开启隐藏面消除功能
    gl.enable(gl.DEPTH_TEST);
    //gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var n = initVertexBuffers(gl);
    if(n < 0) {
        console.log('初始化顶点缓冲区失败！');
        return;
    }

    var uMVPMatrix = gl.getUniformLocation(gl.program, 'uMVPMatrix');
    if(!uMVPMatrix) {
        console.log('获取视角矩阵失败！');
        return;
    }
    var mvpMatrix = new Matrix4();

    var uNormalMatrix = gl.getUniformLocation(gl.program, 'uNormalMatrix');
    if(!uNormalMatrix) {
        console.log('获取法向量矩阵失败！');
        return;
    }
    var normalMatrix = new Matrix4();

    var uLightColor = gl.getUniformLocation(gl.program, 'uLightColor');
    gl.uniform3f(uLightColor, 1.0, 1.0, 1.0);

    var uLightPosition = gl.getUniformLocation(gl.program, 'uLightPosition');
    gl.uniform3f(uLightPosition, 0.0, 3.0, 4.0);

    var uAmbientLight = gl.getUniformLocation(gl.program, 'uAmbientLight');
    gl.uniform3f(uAmbientLight, 0.2, 0.2, 0.2);

    document.onkeydown = function(ev) {
        keydown(ev, gl, n, uMVPMatrix, mvpMatrix);
    }

    document.onmousewheel = function(ev) {
        mousewheel(ev, gl, n, uMVPMatrix, mvpMatrix);
    }

    draw(gl, n, uMVPMatrix, mvpMatrix);
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([   // Vertex coordinates
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
        -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
    ]);

    var colors = new Float32Array([
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
    ]);

    //var colors = new Float32Array([     // Colors
    //    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v0-v1-v2-v3 front(white)
    //    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v0-v3-v4-v5 right(white)
    //    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v0-v5-v6-v1 up(white)
    //    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v1-v6-v7-v2 left(white)
    //    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down(white)
    //    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0   // v4-v7-v6-v5 back(white)
    //]);

    var normals = new Float32Array([    // Normal
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    ]);

    var indices = new Uint8Array([       // Indices of the vertices
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
        12,13,14,  12,14,15,    // left
        16,17,18,  16,18,19,    // down
        20,21,22,  20,22,23     // back
    ]);

    if(!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'aPosition')) return -1;
    if(!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'aColor')) return -1;
    if(!initArrayBuffer(gl, normals, 3, gl.FLOAT, 'aNormal')) return -1;

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, data, num, type, attribute) {
    var buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    var attrib = gl.getAttribLocation(gl.program, attribute);
    gl.vertexAttribPointer(attrib, num, type, false, 0, 0);
    gl.enableVertexAttribArray(attrib);
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
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

    label.innerHTML = 'near: ' + Math.round(gNear*100)/100 + ', far: ' + Math.round(gFar*100)/100 +
    ', vX: ' + Math.round(vX*100)/100 + ', vY: ' + Math.round(vY*100)/100 + ', vZ: ' + Math.round(vZ*100)/100 +
    ', mX: ' + Math.round(mX*100)/100 + ', mY: ' + Math.round(mY*100)/100 + ', mZ: ' + Math.round(mZ*100)/100;
}