var VSHADER_SOURCE =
    "attribute vec4 a_Position;" +
    "attribute vec4 a_Color;" +
    "varying vec4 v_Color;" +
    "void main(){" +
    "gl_Position = a_Position;" +
    "v_Color = a_Color;" +
    "}";

var FSHADER_SOURCE =
    "precision mediump float;" +
    "varying vec4 v_Color;" +
    "void main() {" +
    "gl_FragColor = vec4(1.0,0.0,0.0,1.0);" +
    "}";
const { vec3 } = glMatrix;

var gl,canvas;
var points = [];
var colors = [];
function main() {
    points = [];
    colors = [];
    canvas = document.getElementById("gl");
    gl = getWebGLContext(canvas);
    if(!gl) {
        console.log("Failed to get the rendering context for WebGL");
        return;
    }
    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Failed to initialize shader.");
        return;
    }

    var vertices = ([
        // 0.0000, 0.0000, -1.0000,
        // 0.0000, 0.9428, 0.3333,
        // -0.8165, -0.4714, 0.3333,
        // 0.8165, -0.4714, 0.3333
        0.0,0.5,0.0,
        -0.5,-0.5,0.0,
        0.5,-0.5,0.0,
    ]);
    var p1 = vec3.fromValues(vertices[0],vertices[1],vertices[2]);
    var p2 = vec3.fromValues(vertices[3],vertices[4],vertices[5]);
    var p3 = vec3.fromValues(vertices[6],vertices[7],vertices[8]);

    var num = document.getElementById("show").value;
    // console.log(points);
    divide(p1,p2,p3,num);
    var temp = document.getElementById("show2").value;
    if(temp!="") {
        temp = temp/180.0*Math.PI;
        for(var i = 0; i < points.length; i+=3) {
            var xx = points[i];
            var yy = points[i+1];
            var d = Math.sqrt(xx*xx+yy*yy);
            var x = xx*Math.cos(d/temp) - yy*Math.sin(d/temp);
            var y = xx*Math.sin(d/temp) + yy*Math.cos(d/temp);
            points[i] = x;
            points[i+1] = y;
        }
    }
    // var angle = 90.0;
    // var radian = Math.PI * angle / 180.0;//弧度
    // var cosb = Math.cos(radian);
    // var sinb = Math.sin(radian);
    // var u_cosb = gl.getUniformLocation(gl.program,'u_cosb');
    // var u_sinb = gl.getUniformLocation(gl.program,'u_sosb');
    // gl.uniform1f(u_cosb,cosb);
    // gl.uniform1f(u_sinb,sinb);

    // console.log(points);

    gl.clearColor(1.0,1.0,1.0,1.0);
    // gl.enable(gl.DEPTH_TEST);

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( points ), gl.STATIC_DRAW );

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // var cBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( colors ), gl.STATIC_DRAW);
    //
    // console.log(colors.length);
    // var a_Color = gl.getAttribLocation(gl.program,'a_Color');
    // gl.vertexAttribPointer(a_Color,3, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(a_Color);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.LINES,0,points.length/2);
}
function divide(a,b,c,cnt) {
    if(cnt==0) {
        // gl.drawArrays(gl.TRIANGLES,);
        points.push(a[0],a[1],a[2]);
        points.push(b[0],b[1],b[2]);
        points.push(b[0],b[1],b[2]);
        points.push(c[0],c[1],c[2]);
        points.push(a[0],a[1],a[2]);
        points.push(c[0],c[1],c[2]);
        // gl.clear(gl.COLOR_BUFFER_BIT);
        // gl.drawArrays(gl.TRIANGLES,0,points.length/3);
        return;
    }
    // console.log(b[0]);
    var ab = vec3.create();
    vec3.lerp(ab, a, b, 0.5);
    var ac = vec3.create();
    vec3.lerp(ac, a, c, 0.5);
    var bc = vec3.create();
    vec3.lerp(bc, b, c, 0.5);
    cnt--;
    divide(ab, b, bc, cnt);
    divide(a, ab, ac, cnt);
    divide(ab, bc, ac, cnt);
    divide(c, bc, ac, cnt);
}
function push_color(a,b,c,color) {
    points.push(a[0],a[1],a[2]);
    points.push(b[0],b[1],b[2]);
    points.push(c[0],c[1],c[2]);
    var baseColor = [
        1.0,0.0,0.0,
        0.0,1.0,0.0,
        0.0,0.0,1.0,
        0.0,0.0,0.0,
    ];
    for(var i = 0; i < 9; i++) {
        colors.push(baseColor[color*3+i%3]);
    }
}
function start() {
    solve();
}
function solve() {
	var x = (parseInt(document.getElementById("show2").value))%360;
	if(x == 0) x = 360;
    document.getElementById("show2").value = x.toString();
    main();
}