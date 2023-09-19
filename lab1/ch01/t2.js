"use strict";

const { vec3, mat4 } = glMatrix;

var canvas;
var gl;

var points = [];

var numTimesToSubdivide2D = 4; // For 2D Sierpinski Gasket
var numTimesToSubdivide3D = 2; // For 3D Sierpinski Gasket

window.onload = function initTriangles() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    // Add an input field for subdivision level (2D)
    var inputField2D = document.getElementById("subdivision-level-2d");
    inputField2D.addEventListener("input", function () {
        numTimesToSubdivide2D = parseInt(inputField2D.value);
        points = []; // Clear existing points
        render();
    });

    // Add an input field for subdivision level (3D)
    var inputField3D = document.getElementById("subdivision-level-3d");
    inputField3D.addEventListener("input", function () {
        numTimesToSubdivide3D = parseInt(inputField3D.value);
        points = []; // Clear existing points
        render();
    });

    render();
};

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

function divideTriangle(a, b, c, count) {
    if (count === 0) {
        triangle(a, b, c);
    }
    else {
        var ab = vec3.create();
        vec3.lerp(ab, a, b, 0.5);
        var ac = vec3.create();
        vec3.lerp(ac, a, c, 0.5);
        var bc = vec3.create();
        vec3.lerp(bc, b, c, 0.5);

        ab = normalize(ab);
        ac = normalize(ac);
        bc = normalize(bc);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    }
}

function normalize(v) {
    var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / length, v[1] / length, v[2] / length];
}

// ... Rest of the code for 2D Sierpinski Gasket remains the same ...

function render() {
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Projection matrix setup for 3D effect
    var projection = mat4.create();
    mat4.perspective(projection, Math.PI / 3, canvas.width / canvas.height, 1, 100);

    var modelView = mat4.create();
    var eye = vec3.fromValues(0, 0, 4);
    var at = vec3.fromValues(0, 0, 0);
    var up = vec3.fromValues(0, 1, 0);
    mat4.lookAt(modelView, eye, at, up);

    var modelViewLoc = gl.getUniformLocation(program, "modelView");
    gl.uniformMatrix4fv(modelViewLoc, false, modelView);

    var projectionLoc = gl.getUniformLocation(program, "projection");
    gl.uniformMatrix4fv(projectionLoc, false, projection);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Render 3D Sierpinski Gasket
    var offset = points.length / 9; // Number of vertices for each tetrahedron
    for (var i = 0; i < 4; i++) {
        var translation = vec3.create();
        if (i === 0) {
            vec3.set(translation, 0, 0, 0);
        } else if (i === 1) {
            vec3.set(translation, 2, 0, 0);
        } else if (i === 2) {
            vec3.set(translation, -1, -1.5, 0);
        } else {
            vec3.set(translation, 1, -1.5, 0);
        }
        var translationLoc = gl.getUniformLocation(program, "translation");
        gl.uniform3fv(translationLoc, translation);

        gl.drawArrays(gl.TRIANGLES, i * offset, offset);
    }

    // Render 2D Sierpinski Gasket
    var offset2D = offset * 4; // 4 tetrahedrons for each triangle in 2D
    for (var i = 0; i < 4; i++) {
        var translation = vec3.create();
        vec3.set(translation, -1.5, -2.5, 0);
        var translationLoc = gl.getUniformLocation(program, "translation");
        gl.uniform3fv(translationLoc, translation);

        gl.drawArrays(gl.TRIANGLES, i * offset2D, offset2D);
    }
}