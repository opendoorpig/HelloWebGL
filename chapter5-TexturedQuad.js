/**
 * Created by xiawei on 2014/12/12.
 */
/**
 * Created by xiawei on 2014/12/8.
 */

var VSHADER_SOURCE =
    'attribute vec4 aPosition;\n' +
    'attribute vec2 aTexCoord;\n' +
    'varying vec2 vTexCoord;\n' +
    'uniform mat4 uModelMatrix;\n' +
    'void main() {\n' +
    ' gl_Position = uModelMatrix * aPosition;\n' +
    ' vTexCoord = aTexCoord;\n' +
    '}\n';

var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform sampler2D uSampler0;\n' +
    'uniform sampler2D uSampler1;\n' +
    'varying vec2 vTexCoord;\n' +
    'void main() {\n' +
    ' vec4 color0 = texture2D(uSampler0, vTexCoord);\n' +
    ' vec4 color1 = texture2D(uSampler1, vTexCoord);\n' +
    ' gl_FragColor = color0 * color1;\n' +
    '}\n';

var angleStep = 30;
var tick;
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

    gl.clearColor(0.2, 0.6, 0.3, 0.9);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var n = initVertexBuffers(gl);
    if(n < 0) {
        console.log('设置顶点位置失败！');
        return;
    }

    if(!initTextures(gl, n)) {

    }

    var uModelMatrix = gl.getUniformLocation(gl.program, 'uModelMatrix');
    if(!uModelMatrix) {
        console.log('获取旋转变换矩阵失败！');
        return;
    }

    var currentAngle = 0.0;
    var modelMatrix = new Matrix4();

    tick = function() {
        currentAngle = animate(currentAngle);
        draw(gl, n, currentAngle, modelMatrix, uModelMatrix);
        if(isMove) {
            requestAnimationFrame(tick);
        }
    };

    //setInterval(tick, 17);//另外一种持续调用的方法，页面未激活时也会运行。17毫秒的调用间隔约等于60帧/秒

    modelMatrix.setIdentity();
    tick();

    //注册鼠标事件
    canvas.onmousedown = function(ev) {
        click(ev, gl, canvas, aPosition, uColor);
    };
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        //-0.5, 0.5, -0.3, 1.7,
        //-0.5, -0.5, -0.3, -0.2,
        //0.5, 0.5, 1.7, 1.7,
        //0.5, -0.5, 1.7, -0.2]);
        -0.5, 0.5, 0.0, 1.0,
        -0.5, -0.5, 0.0, 0.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, -0.5, 1.0, 0.0]);
    var n = 4;
    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer) {
        console.log('创建缓冲区对象失败！');
        return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var FSIZE = vertices.BYTES_PER_ELEMENT;
    var aPosition = gl.getAttribLocation(gl.program, 'aPosition');
    if(aPosition < 0) {
        console.log('获取顶点属性失败！');
        return;
    }
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(aPosition);

    var aTexCoord = gl.getAttribLocation(gl.program, 'aTexCoord');
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(aTexCoord);

    return n;
}

function initTextures(gl, n) {
    var texture0 = gl.createTexture();
    var texture1 = gl.createTexture();
    var uSampler0 = gl.getUniformLocation(gl.program, 'uSampler0');
    var uSampler1 = gl.getUniformLocation(gl.program, 'uSampler1');
    var image0 = new Image();
    var image1 = new Image();
    image0.onload = function() {
        loadTexture(gl, n, texture0, uSampler0, image0, 0);
    };
    image1.onload = function() {
        loadTexture(gl, n, texture1, uSampler1, image1, 1);
    };
    image0.src = 'resources/sky.jpg';
    image1.src = 'resources/circle.gif';
    return true;
}

var gTexUnit0 = false;
var gTexUnit1 = false;
function loadTexture(gl, n, texture, uSampler, image, texUnit) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    if(texUnit == 0) {
        gl.activeTexture(gl.TEXTURE0);
        gTexUnit0 = true;
    } else {
        gl.activeTexture(gl.TEXTURE1);
        gTexUnit1 = true;
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);//可以与上一个参数设置一起使用
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);//
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);//使用gl.RGB参数也有gif的透明叠加效果
    //将纹理单元编号传给取样器
    gl.uniform1i(uSampler, texUnit);

    if(gTexUnit0 && gTexUnit1) {
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    }
}

function draw(gl, n, currentAngle, modelMatrix, uModelMatrix) {
    //modelMatrix.translate(-0.05, 0.03, 0.0);
    modelMatrix.setRotate(currentAngle, 0, 1, 1);

    gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    //gl.drawArrays(gl.LINE_STRIP, 0, n);
    //gl.drawArrays(gl.POINTS, 0, n);
}

var timeLast = Date.now();
var isMove = true;
function animate(angle, isStop) {
    if(isMove) {
        var now = Date.now();
        var elapsed = now - timeLast;
        timeLast = now;
        var newAngle = angle + (angleStep * elapsed) / 1000.0;
        return newAngle %= 360;
    }else {
        return angle;
    }
}

var g_points = [];
var g_colors = [];
function click(ev, gl, canvas, aPosition, uColor) {
    isMove = !isMove;
    if(isMove){
        timeLast = Date.now();
        requestAnimationFrame(tick);
    }
}