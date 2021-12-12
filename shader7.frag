#ifdef GL_ES

precision highp float;

#endif

// ------------------------------------------------------- //
// INNER SITE OF MY EXISTENCE.
// ------------------------------------------------------- //
uniform float u_time;
uniform float u_seed; 
uniform vec2 u_resolution;
uniform vec2 u_position; 

// Since I can't send in the parameters in this. 
//vec2 u_position = vec2(250.0, 250.0);

// ------------------------------------------------------- //
// MOTION
// ------------------------------------------------------- //
mat2 m = mat2(0.25, -0.45, 0.67, 2.5); 
// Change these values when the eye closes. 

float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 n) {
  const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
  return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

float fbm4( vec2 p )
{
    float f = 0.0;
    f += 0.5000*noise( p ); p = m*p*2.044;
    f += 0.2500*noise( p ); p = m*p*2.022;
    f += 0.1250*noise( p ); p = m*p*2.082;
    f += 0.0625*noise( p );
    return f/0.9375;
}

float pattern(in vec2 p) {
    vec2 q = vec2(0.0, 0.0);
    q.x = fbm4(p + vec2(0.142*u_time,0.096*u_time)); 
    q.y = fbm4(p + vec2(0.150,0.0300)); 
    return fbm4(p + 4.0*q); 
}


// Interleaving colors. 
vec3 col = vec3(1.0); 
vec3 colA = vec3(0.859, 0.11, 0.424); // Fuscia
vec3 colB = vec3(0.867, 0.18, 0.318); // Amaranth
vec3 colC = vec3(0.98, 0.757, 0.192); // Mustard Yellow
vec3 colD = vec3(0.937, 0.624, 0.569); // Peach

// Initial value. 
float patternSeed = u_seed;  
// ------------------------------------------------------- //
// BEGIN.
// ------------------------------------------------------- //
void main(void)
{    
	vec2 st = gl_FragCoord.xy / u_resolution.xy; 
	float factor = (u_resolution.x/u_resolution.y); 

	// Screen
	vec2 p = -1.0 + 2.0 * st; // Remap the space between -1 and 1. 
	p.x *= factor; // Remap x-space based on the factor.

	// Pupil's position
	vec2 cPos = -1.0 + 2.0 * u_position.xy / u_resolution.xy; // Remap the incoming position between -1 and 1. 
	cPos.y = -cPos.y; // Remap the y as per the world coordinates (since y is flipped in the shader world). 
	cPos.x *= factor; // Remap incoming position based on the factor. 
    
    // Distance field of the current position
	float d = distance(cPos, p); 

	// Animate upper and lower eyelid. 
	float lowerLid = step(-2.0 + cos(u_time*0.10)*2.05, p.y); 
	vec3 l = vec3(lowerLid); 
	float upperLid = step(-1.0 + cos(u_time*0.10)*2.05, 1.0-p.y);
	vec3 u = vec3(upperLid); 

    patternSeed = clamp(rand(p + lowerLid + upperLid), -1.0, 1.0);
    
    colB.r = colB.r + sin(u_time*0.1) * d * 0.3; 
    colB.g = colB.g + cos(u_time*0.1) * d * 0.3; 
    colB.b = colB.b + sin(u_time*0.1) * d * 0.3; 
    
    colC.r = colC.r + sin(u_time*0.2) * d * 0.6; 
    colC.g = colC.g + cos(u_time*0.2) * d * 0.6; 
    colC.b = colC.b + sin(u_time*0.2) * d * 0.6; 
    
    colD.r = colD.r + atan(u_time*0.01) * d * 1.0; 
    colD.g = colD.g + atan(u_time*0.01) * d * 0.6; 
    colD.b = colD.b + atan(u_time*0.01) * d * 0.4;     
    
    float f = clamp((fbm4(abs(patternSeed*(p-cPos)/45.0) + pattern(abs((p-cPos)*8.0)) - u_time*(upperLid+lowerLid)*.06)), 0.0, 1.0);
    col = mix(colA, colB, smoothstep(patternSeed/10.0, 0.4, f));
    col = mix(col, colC, smoothstep(patternSeed/10.0, 1.0, f));
    col = mix(col, colD, smoothstep(patternSeed/10.0, 1.0, f));

	// Eyelids
	//col = col* l * u;
	
	gl_FragColor = vec4(col,1.0);
}
