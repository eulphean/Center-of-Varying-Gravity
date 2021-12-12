attribute vec3 aPosition;

// all shaders have one main function
// the vertex shader requires there to be a vec4 output called gl_Position
void main() {
   
  // copy the position data into a vec4, using 1.0 as the w component
  vec4 pos = vec4(aPosition, 1.0);

  // scale the rect by two, and move it to the center of the screen
  pos.xy = pos.xy * 2.0 - 1.0;

  // send the vertex information on to the fragment shader
  gl_Position = pos;
}