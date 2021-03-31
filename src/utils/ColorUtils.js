/**
 * @format
*/

export function cartesianToPolar(x, y) {
  const radius = Math.sqrt(x * x + y *  y);
  const theta = radiansToDegrees(Math.atan2(y, x));

  return {radius, theta};
}

export function radiansToDegrees(radians) {
  return radians * -180 / Math.PI;
}

export function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

export function hslToCartesian(h, s, l, radius) {
  h = degreesToRadians(h);
  ({h, s, v} = hslToHSV(h, s, l));
  // convert to x, y and scale to radius
  const x = s * Math.cos(h) * radius;
  const y = s * Math.sin(h) * radius * (v < 0.5 ? 1 : -1);
  return { x, y };
}

export function hslToHSV(h, s, l) {
  // normalize to [0, 1] from [0, 100]
  s /= 100;
  l /= 100;

  const v = l + s * Math.min(l, 1 - l);
  s = v === 0 ? 0 : 2 * (1 - l / v);
  return {h, s, v}
}

export function hsvToHSL(h, s, v) {
  let l = (2 - s) * (v / 2);
  if (l === 1) {
    s = 0;
  } else if (l < 0.5) {
    s = (s * v) / (l * 2);
  } else {
    s = s * v / (2 - l * 2);
  }

  // normalize to [0, 100] for react native
  s *= 100;
  l *= 100;

  return {h, s, l};
}

export function polarToHSV(radius, theta) {
  return {h: theta, s: radius, v: 1};
}

export function polarToHSL(radius, theta) {
  const {h, s, v} = polarToHSV(radius, theta);

  return hsvToHSL(h, s, v);
}

export function hslToString(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}