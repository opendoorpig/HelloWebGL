/**
 * Created by xiawei on 2014/12/24.
 */

var VSHADER_SOURCE =
    'attribute vec4 aPosition;\n' +
    'attribute vec4 aColor;\n' +
    'uniform mat4 uViewMatrix;\n' +
    'uniform mat4 uModelMatrix;\n' +
    'uniform mat4 uProjMatrix;\n' +
    'varying vec4 vColor;\n' +
    'void main() {\n' +
    '   gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;\n' +
    '   vColor = aColor;\n' +
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

    var uViewMatrix = gl.getUniformLocation(gl.program, 'uViewMatrix');
    if(!uViewMatrix) {
        console.log('获取视角矩阵失败！');
        return;
    }
    var viewMatrix = new Matrix4();
    //viewMatrix.setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
    //gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix.elements);

    var uModelMatrix = gl.getUniformLocation(gl.program, 'uModelMatrix');
    if(!uModelMatrix) {
        console.log('获取变换矩阵失败！');
        return;
    }
    var modelMatrix = new Matrix4();
    //modelMatrix.setRotate(0, 0, 0, 1);
    //gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix.elements);

    var uProjMatrix = gl.getUniformLocation(gl.program, 'uProjMatrix');
    if(!uProjMatrix) {
        console.log('');
        return;
    }
    var projMatrix = new Matrix4();

    document.onkeydown = function(ev) {
        keydown(ev, gl, n, uViewMatrix, viewMatrix, uModelMatrix, modelMatrix, uProjMatrix, projMatrix);
    }

    document.onmousewheel = function(ev) {
        mousewheel(ev, gl, n, uViewMatrix, viewMatrix, uModelMatrix, modelMatrix, uProjMatrix, projMatrix);
    }

    draw(gl, n, uViewMatrix, viewMatrix, uModelMatrix, modelMatrix, uProjMatrix, projMatrix);
}

function initVertexBuffers(gl) {
    //var vertices = new Float32Array([
    //    1.0,  1.0,  1.0,     1.0,  1.0,  1.0,  // v0 White
    //    -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 Magenta
    //    -1.0, -1.0,  1.0,     1.0,  0.0,  0.0,  // v2 Red
    //    1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow
    //    1.0, -1.0, -1.0,     0.0,  1.0,  0.0,  // v4 Green
    //    1.0,  1.0, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
    //    -1.0,  1.0, -1.0,     0.0,  0.0,  1.0,  // v6 Blue
    //    -1.0, -1.0, -1.0,     0.0,  0.0,  0.0   // v7 Black
    //]);
    //var n = 8;
    //
    //var indices = new Uint8Array([
    //    0, 1, 2,   0, 2, 3,    // front
    //    0, 3, 4,   0, 4, 5,    // right
    //    0, 5, 6,   0, 6, 1,    // up
    //    1, 6, 7,   1, 7, 2,    // left
    //    7, 4, 3,   7, 3, 2,    // down
    //    4, 7, 6,   4, 6, 5     // back
    //]);

    var vertices = new Float32Array([   // Vertex coordinates
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
        -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
    ]);

    //var colors = new Float32Array([     // Colors
    //    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
    //    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
    //    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
    //    1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
    //    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
    //    0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
    //]);

    var colors = new Float32Array([     // Colors
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v0-v1-v2-v3 front(white)
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v0-v3-v4-v5 right(white)
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v0-v5-v6-v1 up(white)
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v1-v6-v7-v2 left(white)
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down(white)
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0   // v4-v7-v6-v5 back(white)
    ]);

    var indices = new Uint8Array([       // Indices of the vertices
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
        12,13,14,  12,14,15,    // left
        16,17,18,  16,18,19,    // down
        20,21,22,  20,22,23     // back
    ]);

    //var vertexBuffer = gl.createBuffer();
    //if (!vertexBuffer || !indexBuffer) {
    //    console.log('创建缓冲区对象失败！');
    //    return -1;
    //}
    //gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    //gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    //var FSIZE = vertices.BYTES_PER_ELEMENT;
    //var aPosition = gl.getAttribLocation(gl.program, 'aPosition');
    //if (aPosition < 0) {
    //    console.log('获取顶点属性失败！');
    //    return;
    //}
    //gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, FSIZE * 6, 0);
    //gl.enableVertexAttribArray(aPosition);
    //
    //
    //var aColor = gl.getAttribLocation(gl.program, 'aColor');
    //if(aColor<0) {
    //    console.log('获取颜色失败！');
    //    return;
    //}
    //gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    //gl.enableVertexAttribArray(aColor);

    if(!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'aPosition')) return -1;
    if(!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'aColor')) return -1;

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

var vX = 0.0, vY = 0.0, vZ = 10;
var mX = 60, mY = 100, mZ = 100;
function keydown (ev, gl, n, uViewMatrix, viewMatrix, uModelMatrix, modelMatrix, uProjMatrix, projMatrix) {
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
    draw(gl, n, uViewMatrix, viewMatrix, uModelMatrix, modelMatrix, uProjMatrix, projMatrix);
}

var gNear = 1.0, gFar = 20.0;
function mousewheel(ev, gl, n, uViewMatrix, viewMatrix, uModelMatrix, modelMatrix, uProjMatrix, projMatrix) {
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
    draw(gl, n, uViewMatrix, viewMatrix, uModelMatrix, modelMatrix, uProjMatrix, projMatrix);
}


function draw(gl, n, uViewMatrix, viewMatrix, uModelMatrix, modelMatrix, uProjMatrix, projMatrix) {
    viewMatrix.setLookAt(vX, vY, vZ, 0, 0, -100, 0, 1, 0);
    gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix.elements);
    modelMatrix.setRotate(mX, mY, mZ, 1);
    gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix.elements);

    //projMatrix.setOrtho(-1, 1, -1, 1, gNear, gFar);//正射投影
    //projMatrix.setOrtho(-0.5, 0.5, -0.5, 0.5, gNear, gFar);//可视空间变形
    projMatrix.setPerspective(30, canvas.width/canvas.height, gNear, gFar);//透视投影
    gl.uniformMatrix4fv(uProjMatrix, false, projMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

    label.innerHTML = 'near: ' + Math.round(gNear*100)/100 + ', far: ' + Math.round(gFar*100)/100 +
    ', vX: ' + Math.round(vX*100)/100 + ', vY: ' + Math.round(vY*100)/100 + ', vZ: ' + Math.round(vZ*100)/100 +
    ', mX: ' + Math.round(mX*100)/100 + ', mY: ' + Math.round(mY*100)/100 + ', mZ: ' + Math.round(mZ*100)/100;
}