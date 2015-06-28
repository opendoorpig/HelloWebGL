/**
 * Created by xiawei on 2014/11/30.
 */

/*
//使用三角运算设置顶点旋转
var VSHADER_SOURCE =
    'attribute vec4 aPosition;\n' +
    'attribute float aSize;\n' +
    'uniform float uCosB, uSinB;\n' +
    'uniform vec4 uTranslation;\n' +
    'void main() {\n' +
    ' gl_Position = aPosition + uTranslation;\n' + //先移再转
    ' gl_Position.x = aPosition.x * uCosB - aPosition.y * uSinB;\n' +
    ' gl_Position.y = aPosition.x * uSinB + aPosition.y * uCosB;\n' +
    ' gl_Position.z = aPosition.z;\n' +
    ' gl_Position.w = 1.0;\n' +
    //' gl_Position = gl_Position + uTranslation;\n' + //先转再移
    ' gl_PointSize = aSize;\n' +
    '}\n';
*/

var VSHADER_SOURCE =
    'attribute vec4 aPosition;\n' +
    'attribute float aSize;\n' +
    'uniform mat4 uRMatrix;\n' +
    'void main() {\n' +
    ' gl_Position = uRMatrix * aPosition;\n' +
    ' gl_PointSize = aSize;\n' +
    '}\n';

var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 uColor;\n' +
    'void main() {\n' +
    ' gl_FragColor = uColor;\n' +
    '}\n';

function main(){
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

    var aPosition = gl.getAttribLocation(gl.program, 'aPosition');
    if(aPosition < 0) {
        console.log('获取顶点属性失败！');
        return;
    }

    var aSize = gl.getAttribLocation(gl.program, 'aSize');
    if(aSize < 0) {
        console.log('获取点大小属性失败！');
        return;
    }
    gl.vertexAttrib1f(aSize, 10.0);

    var uColor = gl.getUniformLocation(gl.program, 'uColor');
    if(!uColor) { //注意：uniform变量取不到会返回null，与attribute不同
        console.log('获取颜色属性失败！');
        return;
    }

    gl.clearColor(0.2, 0.6, 0.3, 0.9);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var n = initVertexBuffers(gl);
    if(n < 0) {
        console.log('设置顶点位置失败！');
        return;
    }

    var angle = 90;
    var radian = Math.PI * angle / 180.0;
    var cosb = Math.cos(radian);
    var sinb = Math.sin(radian);
    var rMatrix = new Float32Array([
        cosb, sinb, 0.0, 0.0,
        -sinb, cosb+1.5, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, -0.5, 0.0, 1.0
    ]);

    //var rMatrix = new Float32Array([
    //    1.0, 0.0, 0.0, 0.0,
    //    0.0, 1.5, 0.0, 0.0,
    //    0.0, 0.0, 1.0, 0.0,
    //    -0.5, 0.2, 0.0, 1.0
    //]);

    var uRMatrix = gl.getUniformLocation(gl.program, 'uRMatrix');
    if(!uRMatrix) {
        console.log('获取旋转变换矩阵失败！');
        return;
    }
    gl.uniformMatrix4fv(uRMatrix, false, rMatrix);

    gl.uniform4f(uColor, 0.8, 0.3, 0.0, 0.9);
    //gl.drawArrays(gl.TRIANGLES, 0, n);
    //gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);

    gl.uniform4f(uColor, 0.1, 0.2, 0.8, 0.9);
    gl.drawArrays(gl.LINE_STRIP, 0, n);

    gl.uniform4f(uColor, 0.2, 0.9, 0.1, 0.9);
    gl.drawArrays(gl.POINTS, 0, n);

    //注册鼠标事件
    canvas.onmousedown = function(ev) {
        click(ev, gl, canvas, aPosition, uColor);
    };
}

function initVertexBuffers(gl) {
    //var vertices = new Float32Array([0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5]);
    //var n = 4;
    var vertices = new Float32Array([0.0, 0.0, 0.15, 0.5, 0.3, 0.0, 0.45, 0.5, 0.6, 0.0, 0.75, 0.5]);
    var n = 6;

    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer) {
        console.log('创建缓冲区对象失败！');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var aPosition = gl.getAttribLocation(gl.program, 'aPosition');
    if(aPosition < 0) {
        console.log('获取顶点属性失败！');
        return;
    }

    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(aPosition);

    return n;
}

var g_points = [];
var g_colors = [];
function click(ev, gl, canvas, aPosition, uColor) {
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    x = ((x-rect.left) - canvas.height/2) / (canvas.height/2);
    y = (canvas.width/2 - (y-rect.top)) / (canvas.width/2);
    g_points.push([x, y]);

    var r = ev.clientX % 255 / 255;
    var g = ev.clientY % 255 / 255;
    var b = (ev.clientX + ev.clientY) % 255 / 255;
    g_colors.push([r, g, b, 1.0]);

    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_points.length;
    for(var i = 0; i < len; i++) {
        gl.vertexAttrib3f(aPosition, g_points[i][0], g_points[i][1], 0.0);
        gl.uniform4f(uColor, g_colors[i][0], g_colors[i][1], g_colors[i][2], g_colors[i][3]);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}