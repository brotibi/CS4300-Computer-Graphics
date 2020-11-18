const clearScene = (gl) => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT
                 | gl.DEPTH_BUFFER_BIT);
   }

   
const createProjectionMatrix = (gl) => {
    const fieldOfView = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth
                            / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = glMatrix.mat4.create();

    glMatrix.mat4.perspective(
        projectionMatrix, fieldOfView,
        aspect, zNear, zFar);
    return projectionMatrix;
}


let squareRotation = 0.0;

const drawScene = (gl, parameters, buffers, deltaTime, texture) => {
    clearScene(gl);
    const projectionMatrix = createProjectionMatrix(gl);
    const modelViewMatrix = glMatrix.mat4.create();

    glMatrix.mat4.translate(
        modelViewMatrix,
        modelViewMatrix,
        [-0.0, 0.0, -6.0]);

    glMatrix.mat4.rotate(
            modelViewMatrix,
            modelViewMatrix,
            squareRotation,
            [0, 0, 1]);

    glMatrix.mat4.rotate(
        modelViewMatrix,
        modelViewMatrix,
        squareRotation * .7,
        [0, 1, 0]);
    
    squareRotation += deltaTime;

    configurePositionBufferRead(gl, buffers, parameters);
    configureTextureBufferRead(gl, buffers, parameters);
    gl.useProgram(parameters.program);
    setUniforms(gl, parameters,
        projectionMatrix, modelViewMatrix);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        gl.drawElements(
            gl.TRIANGLES,
            36,
            gl.UNSIGNED_SHORT,
            0);
    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(parameters.uniformLocations.uSampler, 0);
}