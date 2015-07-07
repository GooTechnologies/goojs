void main(void) {
    float r, g, b;
  /* for (var i = 0; i < data.lights.length; i++) { */
  /*   var light = data.lights[i]; */
  /*   if (light.type === 'point') { */
    r/*i*/ = 123 * 456 + 789 + light[/*i*/].color[0];
    g/*i*/ = 123 * 456 + 789 + light[/*i*/].color[0];
    b/*i*/ = 123 * 456 + 789 + light[/*i*/].color[0];
    r += g * b;
    g += b * r;
    b += r * g;
  /*   } else if (light.type === 'spot') { */
    r = cos(lights[/*i*/].angle) * light[/*i*/].color[0];
    g = cos(lights[/*i*/].angle) * light[/*i*/].color[0];
    b = cos(lights[/*i*/].angle) * light[/*i*/].color[0];
    r += max(g, 123);
    g += max(b, 456);
    b += max(r, 789);
  /*   } */
    float z/*i*/ = r + g + b;
  /* } */
}