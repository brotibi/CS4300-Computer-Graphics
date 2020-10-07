const RED_HEX = "#FF0000"
const BLUE_HEX = "#0000FF"
const RED_RGB = webglUtils.hexToRgb(RED_HEX)
const BLUE_RGB = webglUtils.hexToRgb(BLUE_HEX)
const RECTANGLE = "RECTANGLE"
const TRIANGLE = "TRIANGLE"
const CIRCLE = "CIRCLE"
const STAR = "STAR"

const origin = {x: 0, y: 0}
const sizeOne = {width: 1, height: 1}
let shapes = [
    {
        type: RECTANGLE,
        position: origin,
        dimensions: sizeOne,
        color: BLUE_RGB,
        translation: {x: 200, y: 100},
        rotation: {z: 0},
        scale: {x: 50, y: 50}
    },
    {
        type: TRIANGLE,
        position: origin,
        dimensions: sizeOne,
        color: RED_RGB,
        translation: {x: 300,y: 100},
        rotation: {z: 0},
        scale: {x: 50, y: 50}
    }

]


const addShape = (translation, type) => {
    const colorHex = document.getElementById("color").value
    const colorRgb = webglUtils.hexToRgb(colorHex)
    let tx = 0
    let ty = 0
    if (translation) {
        tx = translation.x
        ty = translation.y
    }
    const shape = {
        type: type,
        position: origin,
        dimensions: sizeOne,
        color: colorRgb,
        translation: {x: tx, y: ty, z: 0},
        rotation: {x: 0, y: 0, z: 0},
        scale: {x: 20, y: 20, z: 20}
    }
    shapes.push(shape)
    render()
}


let gl
let attributeCoords
let uniformColor
let uniformMatrix
let bufferCoords
let uniformResolution

const doMouseDown = (event) => {
    const boundingRectangle = canvas.getBoundingClientRect();
    const x = event.clientX - boundingRectangle.left;
    const y = event.clientY - boundingRectangle.top;
    const translation = {x, y}
    const shape = document.querySelector("input[name='shape']:checked").value

    addShape(translation, shape)
}


const init = () => {

    const canvas = document.querySelector("#canvas");
    gl = canvas.getContext("webgl");

    canvas.addEventListener(
        "mousedown",
        doMouseDown,
        false);

    const program = webglUtils.createProgramFromScripts(gl, "#vertex-shader-2d", "#fragment-shader-2d");
    gl.useProgram(program);

    // get reference to GLSL attributes and uniforms
    attributeCoords = gl.getAttribLocation(program, "a_coords");
    const uniformResolution = gl.getUniformLocation(program, "u_resolution");
    uniformColor = gl.getUniformLocation(program, "u_color");
    uniformMatrix = gl.getUniformLocation(program, "u_matrix");
    // initialize coordinate attribute
    gl.enableVertexAttribArray(attributeCoords);

    // initialize coordinate buffer
    bufferCoords = gl.createBuffer();

    // configure canvas resolution
    gl.uniform2f(uniformResolution, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    selectShape(0);
}

const deleteShape = (shapeIndex) => {
    shapes.splice(shapeIndex, 1)
    render()
}

const selectShape = (selectedIndex) => {
    selectedShapeIndex = selectedIndex
    document.getElementById("tx").value = shapes[selectedIndex].translation.x
    document.getElementById("ty").value = shapes[selectedIndex].translation.y
    // TODO: update the scale and rotation fields
    document.getElementById("sx").value = shapes[selectedIndex].scale.x
    document.getElementById("sy").value = shapes[selectedIndex].scale.y
    document.getElementById("rz").value = shapes[selectedIndex].rotation.z
    const hexColor = webglUtils.rgbToHex(shapes[selectedIndex].color)
    document.getElementById("color").value = hexColor
}




const render = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
    gl.vertexAttribPointer(
        attributeCoords,
        2,           // size = 2 components per iteration
        gl.FLOAT,    // type = gl.FLOAT; i.e., the data is 32bit floats
        false,       // normalize = false; i.e., don't normalize the data
        0,           // stride = 0; ==> move forward size * sizeof(type)
        // each iteration to get the next position
        0);          // offset = 0; i.e., start at the beginning of the buffer

    shapes.forEach(shape => {
        gl.uniform4f(uniformColor,
                     shape.color.red,
                     shape.color.green,
                     shape.color.blue, 1);

        // compute transformation matrix
        let matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
        matrix = m3.translate(matrix, shape.translation.x, shape.translation.y);
        matrix = m3.rotate(matrix, shape.rotation.z);
        matrix = m3.scale(matrix, shape.scale.x, shape.scale.y);
        // apply transformation matrix.
        gl.uniformMatrix3fv(uniformMatrix, false, matrix);

        if (shape.type === RECTANGLE) {
            renderRectangle(shape)
        } else if (shape.type === TRIANGLE) {
            renderTriangle(shape)
        } else if (shape.type === CIRCLE) {
            renderCircle(shape)
        } else if (shape.type === STAR) {
            renderStar(shape)
        }
    })

    const $shapeList = $("#object-list")
    $shapeList.empty()
    shapes.forEach((shape, index) => {

        const $li = $(`
     <li>
        <button onclick="deleteShape(${index})">
          Delete
        </button>

       <label>
           <input
     type="radio"
     id="${shape.type}-${index}"
     name="shape-index"
     ${index === selectedShapeIndex ? "checked" : ""}
     onclick="selectShape(${index})"
     value="${index}"/>
         ${shape.type};
         X: ${shape.translation.x};
         Y: ${shape.translation.y}
       </label>
     </li>
   `)
        $shapeList.append($li)
    })
}

const renderTriangle = (triangle) => {
    const x1 = triangle.position.x
               - triangle.dimensions.width / 2
    const y1 = triangle.position.y
               + triangle.dimensions.height / 2
    const x2 = triangle.position.x
               + triangle.dimensions.width / 2
    const y2 = triangle.position.y
               + triangle.dimensions.height / 2
    const x3 = triangle.position.x
    const y3 = triangle.position.y
               - triangle.dimensions.height / 2

    const float32Array = new Float32Array([
                                              x1, y1,   x2, y2,   x3, y3
                                          ])

    gl.bufferData(gl.ARRAY_BUFFER,
                  float32Array, gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}


function vec2(v0, v1) {
    return gl.uniform2f(uniformResolution,v0, v1);
}

const renderCircle = (circle) => {
    const cX = circle.position.x;
    const cY = circle.position.y;

    const r = circle.dimensions.width/2
    center = [cX, cY]
    points = []
    points.push(center[0], center[1]);
    for (i = 1; i <= 362; i++){
        points.push(center[0] +
            r*Math.cos(i*2*Math.PI/360));
        points.push(center[1] + r*Math.sin(i*2*Math.PI/360));
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, points.length/2);
}

const renderRectangle = (rectangle) => {
    const x1 = rectangle.position.x
               - rectangle.dimensions.width/2;
    const y1 = rectangle.position.y
               - rectangle.dimensions.height/2;
    const x2 = rectangle.position.x
               + rectangle.dimensions.width/2;
    const y2 = rectangle.position.y
               + rectangle.dimensions.height/2;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                                                        x1, y1, x2, y1, x1, y2,
                                                        x1, y2, x2, y1, x2, y2,
                                                    ]), gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

const renderStar = (star) => {
    const x1 = star.position.x
               - star.dimensions.width / 2
    const y1 = star.position.y
               + star.dimensions.height / 2
    const x2 = star.position.x
               + star.dimensions.width / 2
    const x3 = star.position.x
    const y2 = star.position.y
               - star.dimensions.height / 2


    const ay1 = star.position.y
               + star.dimensions.height / 4

    const ay2 = star.position.y
               - star.dimensions.height / 4

    const float32Array = new Float32Array([
                                              x1, ay1,   x2, ay1,   x3, y2,
                                              x1, ay2,   x2, ay2,   x3, y1
                                          ])

    gl.bufferData(gl.ARRAY_BUFFER,
                  float32Array, gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

let selectedShapeIndex = 0

const updateTranslation = (event, axis) => {
    const value = event.target.value
    shapes[selectedShapeIndex].translation[axis] = value
    render()
}

const updateScale = (event, axis) => {
    // TODO: update the shapes scale property
    const value = event.target.value
    shapes[selectedShapeIndex].scale[axis] = value
    render()
}

const updateRotation = (event, axis) => {
    const value = event.target.value
    const angleInDegrees = (360 - value) * Math.PI / 180;
    shapes[selectedShapeIndex].rotation[axis] = angleInDegrees
    render();
}

const updateColor = (event) => {
    // TODO: update the color of the shape.
    // Use webglUtils.hexToRgb to convert hex color to rgb
    const value = event.target.value
    shapes[selectedShapeIndex].color = webglUtils.hexToRgb(value)
    render()
}





document.getElementById("tx").onchange = event => updateTranslation(event, "x")
document.getElementById("ty").onchange = event => updateTranslation(event, "y")

document.getElementById("sx").onchange = event => updateScale(event, "x")
document.getElementById("sy").onchange = event => updateScale(event, "y")

document.getElementById("rz").onchange = event => updateRotation(event, "z")

document.getElementById("color").onchange = event => updateColor(event)