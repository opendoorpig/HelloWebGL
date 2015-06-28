/**
 * Created by xiawei on 2014/11/30.
 */
    /*
var VSHADER_SOURCE =
    'void main() {\n' +
    ' gl_Position = vec4(0.5, 0.5, 0.0, 1.0);\n' +
    ' gl_PointSize = 10.0;\n' +
    '}\n';

var FSHADER_SOURCE =
    'void main() {\n' +
    ' gl_FragColor = vec4(1, 0.0, 0.0, 0.9);\n' +
    '}\n';
    */

var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute float psize;\n' +
    'void main() {\n' +
    ' gl_Position = a_Position;\n' +
    ' gl_PointSize = psize;\n' +
    '}\n';

var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 fcolor;\n' +
    'void main() {\n' +
    ' gl_FragColor = fcolor;\n' +
    //' gl_FragColor = vec4(1, 0.0, 0.0, 0.9);\n' +
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

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position < 0) {
        console.log('获取顶点属性失败！');
        return;
    }

    canvas.onmousedown = function(ev) {
        click(ev, gl, canvas, a_Position, fcolor);
    };

    gl.vertexAttrib3f(a_Position, 0.5, 0.5, -0.9);

    var psize = gl.getAttribLocation(gl.program, 'psize');
    if(psize < 0) {
        console.log('获取点大小属性失败！');
        return;
    }
    gl.vertexAttrib1f(psize, 10.0);

    var fcolor = gl.getUniformLocation(gl.program, 'fcolor');
    if(!fcolor) { //注意：uniform变量取不到会返回null，与attribute不同
        console.log('获取颜色属性失败！');
        return;
    }
    gl.vertexAttrib3f(fcolor, 0.2, 0.9, 0.1);

    gl.clearColor(0.2, 0.6, 0.3, 0.9);
    gl.clear(gl.COLOR_BUFFER_BIT);
    //gl.drawArrays(gl.POINTS, 0, 1);
}

var g_points = [];
var g_colors = [];
function click(ev, gl, canvas, a_Position, fcolor) {
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
        gl.vertexAttrib3f(a_Position, g_points[i][0], g_points[i][1], 0.0);
        gl.uniform4f(fcolor, g_colors[i][0], g_colors[i][1], g_colors[i][2], g_colors[i][3]);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}