/**
 * Created by xiawei on 2014/12/22.
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

function main() {
    var canvas = document.getElementById('webgl');
    if(!canvas){
        console.log('获取canvas元素失败！');
        return;
    }

    var gl = getWebGLContext(canvas);
    if(!gl){
        console.log('获取WebGL绘图句柄失败！');
        return;
    }

    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('初始化着色器失败！');
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 0.9);
    gl.clear(gl.COLOR_BUFFER_BIT);

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
    var vertices = new Float32Array([
        0.0, 0.5, -0.4, 0.4, 1.0, 0.4, 0.7,
        -0.5, -0.5, -0.4, 0.4, 1.0, 0.4, 0.7,
        0.5, -0.5, -0.4, 1.0, 0.4, 0.4, 0.7,

        0.5, 0.4, -0.2, 1.0, 0.4, 0.4, 0.7,
        -0.5, 0.4, -0.2, 1.0, 1.0, 0.4, 0.7,
        0.0, -0.6, -0.2, 1.0, 1.0, 0.4, 0.7,

        0.0, 0.5, 0.0, 0.4, 0.4, 1.0, 0.7,
        -0.5, -0.5, 0.0, 0.4, 0.4, 1.0, 0.7,
        0.5, -0.5, 0.0, 1.0, 0.4, 0.4, 0.7]);
    var n = 9;
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('创建缓冲区对象失败！');
        return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var FSIZE = vertices.BYTES_PER_ELEMENT;
    var aPosition = gl.getAttribLocation(gl.program, 'aPosition');
    if (aPosition < 0) {
        console.log('获取顶点属性失败！');
        return;
    }
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, FSIZE * 7, 0);
    gl.enableVertexAttribArray(aPosition);

    //var sizes = new Float32Array([5.0, 6.0, 7.0, 8.0, 9.0, 10.0]);
    //var sizeBuffer = gl.createBuffer();
    //gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    //gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
    //var aSize = gl.getAttribLocation(gl.program, 'aSize');
    //gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, FSIZE * 6, FSIZE * 2);
    //gl.enableVertexAttribArray(aSize);

    var aColor = gl.getAttribLocation(gl.program, 'aColor');
    if(aColor<0) {
        console.log('获取颜色失败！');
        return;
    }
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, FSIZE * 7, FSIZE * 3);
    gl.enableVertexAttribArray(aColor);

    return n;
}

var vX = 0.0, vY = 0.0, vZ = 0.25;
var mX = 0, mY = 0, mZ = 0;
function keydown (ev, gl, n, uViewMatrix, viewMatrix, uModelMatrix, modelMatrix, uProjMatrix, projMatrix) {
    if(ev.keyCode == 39) {
        vX += 0.1;
        if(vX > Math.PI) {
            vX = vX - Math.PI;
        }
    } else if (ev.keyCode == 37) {
        vX -= 0.1;
        if(vX < 0){
            vX = vX + Math.PI;
        }
    } else if (ev.keyCode == 38) {
        vY += 0.1;
        if(vY > 1){
            vY = -1.0;
        }
    } else if (ev.keyCode == 40) {
        vY -= 0.1;
        if(vY < -1) {
            vY = 1.0;
        }
    } else if(ev.keyCode == 65) {
        mX += 5;
        if(mX > 360) {
            mX = mX - 360;
        }
    } else if (ev.keyCode == 68) {
        mX -= 5;
        if(mX < 0){
            mX = mX + 360;
        }
    } else if (ev.keyCode == 87) {
        mY += 5;
        if(mY > 360){
            mY = mY - 360;
        }
    } else if (ev.keyCode == 83) {
        mY -= 5;
        if(mY < 0) {
            mY = mY + 360;
        }
    } else {
        return;
    }
    draw(gl, n, uViewMatrix, viewMatrix, uModelMatrix, modelMatrix, uProjMatrix, projMatrix);
}

var gNear = -1.0, gFar = 2.0;
function mousewheel(ev, gl, n, uViewMatrix, viewMatrix, uModelMatrix, modelMatrix, uProjMatrix, projMatrix) {
    if(ev.wheelDelta < 0){
        if(event.shiftKey){
            gNear += 0.1;
        }else if(event.altKey) {
            gFar += 0.1;
        }
    } else if(ev.wheelDelta > 0){
        if(event.shiftKey){
            gNear -= 0.1;
        }else if(event.altKey) {
            gFar -= 0.1;
        }
    }
    draw(gl, n, uViewMatrix, viewMatrix, uModelMatrix, modelMatrix, uProjMatrix, projMatrix);
}

function draw(gl, n, uViewMatrix, viewMatrix, uModelMatrix, modelMatrix, uProjMatrix, projMatrix) {
    viewMatrix.setLookAt(vX, vY, vZ, 0, 0, 0, 0, 1, 0);
    gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix.elements);
    modelMatrix.setRotate(mX, mY, mZ, 1);
    gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix.elements);
    projMatrix.setOrtho(-1, 1, -1, 1, gNear, gFar);
    gl.uniformMatrix4fv(uProjMatrix, false, projMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLES, 0, n);
    label.innerHTML = 'near: ' + Math.round(gNear*100)/100 + ', far: ' + Math.round(gFar*100)/100 +
    ', vX: ' + Math.round(vX*100)/100 + ', vY: ' + Math.round(vY*100)/100 +
    ', mX: ' + Math.round(mX*100)/100 + ', mY: ' + Math.round(mY*100)/100;
}