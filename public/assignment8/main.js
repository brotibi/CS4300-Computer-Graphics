const main = () => {
    const canvas = document.getElementById("canvas");
    const gl = canvas.getContext("webgl");

    const shaderProgram = initializeShaderProgram(gl)
    const parameters = getProgramParameters(gl, shaderProgram);
    const buffers = initializeBuffers(gl)

    const texture = loadTexture(gl, 'rubics.png');

    let then = 0;
    function render(now) {
        now *= 0.001;
        const deltaTime = now - then;
        then = now;

        drawScene(gl, parameters, buffers, deltaTime, texture);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}



const configureTextureBufferRead
        = (gl, buffers, parameters) => {
    const num = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(parameters.attribLocations.textureCoord,
        num, type, normalize, stride, offset);
    gl.enableVertexAttribArray(
        parameters.attribLocations.textureCoord);
}





const configurePositionBufferRead =
    (gl, buffers, parameters) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        parameters.attribLocations.vertexPosition,
        3,
        gl.FLOAT,
        false,
        0,
        0);
    gl.enableVertexAttribArray(
        parameters.attribLocations.vertexPosition);
}

const setUniforms = (gl, parameters, projectionMatrix, modelViewMatrix) => {
    gl.uniformMatrix4fv(
          parameters.uniformLocations.projectionMatrix,
          false,
          projectionMatrix);
    gl.uniformMatrix4fv(
          parameters.uniformLocations.modelViewMatrix,
          false,
          modelViewMatrix);
}





