let gl
let attributeCoords
let uniformColor
let uniformMatrix
let bufferCoords
let attributeNormals
let uniformWorldViewProjection
let uniformWorldInverseTranspose
let uniformReverseLightDirectionLocation
let normalBuffer
let uniformResolution
const up = [0, 1, 0]
let target = [0, 0, 0]
let lookAt = true


const init = () => {

    const canvas = document.querySelector("#canvas");
    gl = canvas.getContext("webgl");

    canvas.addEventListener(
        "mousedown",
        webglUtils.doMouseDown,
        false);

    const program = webglUtils.createProgramFromScripts(gl, "#vertex-shader-3d", "#fragment-shader-3d");
    gl.useProgram(program);

    // get reference to GLSL attributes and uniforms
    attributeCoords = gl.getAttribLocation(program, "a_coords");
    attributeNormals = gl.getAttribLocation(program, "a_normals");
    // initialize coordinate attribute
    gl.enableVertexAttribArray(attributeCoords);
    gl.enableVertexAttribArray(attributeNormals);
    normalBuffer = gl.createBuffer();

    uniformWorldViewProjection
        = gl.getUniformLocation(program, "u_worldViewProjection");
    uniformWorldInverseTranspose
        = gl.getUniformLocation(program, "u_worldInverseTranspose");
    uniformReverseLightDirectionLocation
        = gl.getUniformLocation(program, "u_reverseLightDirection");
    uniformColor = gl.getUniformLocation(program, "u_color");
    uniformMatrix = gl.getUniformLocation(program, "u_matrix");
    const uniformResolution = gl.getUniformLocation(program, "u_resolution");
    // Set the matrix.
    //gl.uniformMatrix4fv(matrixLocation, false, worldViewProjectionMatrix);

    // Set the color to use
    //gl.uniform4fv(colorLocation, [0.2, 1, 0.2, 1]); // green

    // set the light direction.
    //gl.uniform3fv(reverseLightDirectionLocation, m4.normalize([0.5, 0.7, 1]));

    // initialize coordinate buffer
    bufferCoords = gl.createBuffer();

    // configure canvas resolution
    gl.uniform2f(uniformResolution, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    webglUtils.selectShape(0);


}



let fieldOfViewRadians = webglUtils.degToRad(60)
const computeModelViewMatrix = (shape, viewProjectionMatrix) => {
    M = m4.translate(viewProjectionMatrix,
                     shape.translation.x,
                     shape.translation.y,
                     shape.translation.z)
    M = m4.xRotate(M, webglUtils.degToRad(shape.rotation.x))
    M = m4.yRotate(M, webglUtils.degToRad(shape.rotation.y))
    M = m4.zRotate(M, webglUtils.degToRad(shape.rotation.z))
    M = m4.scale(M, shape.scale.x, shape.scale.y, shape.scale.z)
    return M
}







const render = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
    gl.vertexAttribPointer(
        attributeCoords,
        3,           // size = 3 floats per vertex
        gl.FLOAT,    // type = gl.FLOAT; i.e., the data is 32bit floats
        false,       // normalize = false; i.e., don't normalize the data
        0,           // stride = 0; ==> move forward size * sizeof(type)
        // each iteration to get the next position
        0);          // offset = 0; i.e., start at the beginning of the buffer

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(attributeNormals, 3, gl.FLOAT, false, 0, 0);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 1;
    const zFar = 2000;

    //gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
    let cameraMatrix = m4.identity()

    if(lookAt) {
        cameraMatrix = m4.translate(
            cameraMatrix,
            camera.translation.x,
            camera.translation.y,
            camera.translation.z)
        const cameraPosition = [
            cameraMatrix[12],
            cameraMatrix[13],
            cameraMatrix[14]]
        cameraMatrix = m4.lookAt(
            cameraPosition,
            target,
            up)
        cameraMatrix = m4.inverse(cameraMatrix)
    } else {
        cameraMatrix = m4.zRotate(
            cameraMatrix,
            webglUtils.degToRad(camera.rotation.z));
        cameraMatrix = m4.xRotate(
            cameraMatrix,
            webglUtils.degToRad(camera.rotation.x));
        cameraMatrix = m4.yRotate(
            cameraMatrix,
            webglUtils.degToRad(camera.rotation.y));
        cameraMatrix = m4.translate(
            cameraMatrix,
            camera.translation.x,
            camera.translation.y,
            camera.translation.z);
    }

    const projectionMatrix = m4.perspective(
        fieldOfViewRadians, aspect, zNear, zFar)
    const viewProjectionMatrix = m4.multiply(
        projectionMatrix, cameraMatrix)
    //New Start
    let worldMatrix = m4.identity()
    const worldViewProjectionMatrix
        = m4.multiply(viewProjectionMatrix, worldMatrix);
    const worldInverseMatrix
        = m4.inverse(worldMatrix);
    const worldInverseTransposeMatrix
        = m4.transpose(worldInverseMatrix);

    gl.uniformMatrix4fv(uniformWorldViewProjection, false,
                        worldViewProjectionMatrix);
    gl.uniformMatrix4fv(uniformWorldInverseTranspose, false,
                        worldInverseTransposeMatrix);

    gl.uniform3fv(uniformReverseLightDirectionLocation,
                  m4.normalize(lightSource));
    //New End



    shapes.forEach(shape => {
        gl.uniform4f(uniformColor,
                     shape.color.red,
                     shape.color.green,
                     shape.color.blue, 1);


        let M = computeModelViewMatrix(shape, worldViewProjectionMatrix)
        gl.uniformMatrix4fv(uniformWorldViewProjection, false, M)


        gl.uniformMatrix4fv(uniformMatrix, false, M);

        if (shape.type === RECTANGLE) {
            webglUtils.renderRectangle(shape)
        } else if (shape.type === TRIANGLE) {
            webglUtils.renderTriangle(shape)
        } else if (shape.type === CIRCLE) {
            webglUtils.renderCircle(shape)
        } else if (shape.type === STAR) {
            webglUtils.renderStar(shape)
        } else if (shape.type === CUBE) {
            webglUtils.renderCube(shape)
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
     onclick="webglUtils.selectShape(${index})"
     value="${index}"/>
         ${shape.type};
         X: ${shape.translation.x};
         Y: ${shape.translation.y};
         Z: ${shape.translation.z};
       </label>
     </li>
   `)
        $shapeList.append($li)
    })
}









let selectedShapeIndex = 0


document.getElementById("tx").onchange = event => webglUtils.updateTranslation(event, "x")
document.getElementById("ty").onchange = event => webglUtils.updateTranslation(event, "y")
document.getElementById("tz").onchange = event => webglUtils.updateTranslation(event, "z")

document.getElementById("sx").onchange = event => webglUtils.updateScale(event, "x")
document.getElementById("sy").onchange = event => webglUtils.updateScale(event, "y")
document.getElementById("sz").onchange = event => webglUtils.updateScale(event, "z")

document.getElementById("rx").onchange = event => webglUtils.updateRotation(event, "x")
document.getElementById("ry").onchange = event => webglUtils.updateRotation(event, "y")
document.getElementById("rz").onchange = event => webglUtils.updateRotation(event, "z")

document.getElementById("fv").onchange = event => webglUtils.updateFieldOfView(event)

document.getElementById("lookAt").onchange = event => webglUtils.toggleLookAt(event)
document.getElementById("ctx").onchange = event => webglUtils.updateCameraTranslation(event, "x")
document.getElementById("cty").onchange = event => webglUtils.updateCameraTranslation(event, "y")
document.getElementById("ctz").onchange = event => webglUtils.updateCameraTranslation(event, "z")
document.getElementById("crx").onchange = event => webglUtils.updateCameraRotation(event, "x")
document.getElementById("cry").onchange = event => webglUtils.updateCameraRotation(event, "y")
document.getElementById("crz").onchange = event => webglUtils.updateCameraRotation(event, "z")
document.getElementById("ltx").onchange = event => webglUtils.updateLookAtTranslation(event, 0)
document.getElementById("lty").onchange = event => webglUtils.updateLookAtTranslation(event, 1)
document.getElementById("ltz").onchange = event => webglUtils.updateLookAtTranslation(event, 2)
document.getElementById("dlrx").value = lightSource[0]
document.getElementById("dlry").value = lightSource[1]
document.getElementById("dlrz").value = lightSource[2]

document.getElementById("dlrx").onchange
    = event => webglUtils.updateLightDirection(event, 0)
document.getElementById("dlry").onchange
    = event => webglUtils.updateLightDirection(event, 1)
document.getElementById("dlrz").onchange
    = event => webglUtils.updateLightDirection(event, 2)

document.getElementById("lookAt").checked = lookAt
document.getElementById("ctx").value = camera.translation.x
document.getElementById("cty").value = camera.translation.y
document.getElementById("ctz").value = camera.translation.z
document.getElementById("crx").value = camera.rotation.x
document.getElementById("cry").value = camera.rotation.y
document.getElementById("crz").value = camera.rotation.z

document.getElementById("color").onchange = event => webglUtils.updateColor(event)