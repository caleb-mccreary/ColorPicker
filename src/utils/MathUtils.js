/**
 * @format
*/

export function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}


export function radiansToDegrees(radians) {
  return radians * -180 / Math.PI;
}


/**
* Converts cartesian coordinates (x, y) to polar coordinates (radius, theta)
* @param {number} x
* @param {number} y
* returns object {radius (number), theta (number)}
*/
export function cartesianToPolar(x, y) {
  const radius = Math.sqrt(x * x + y *  y);
  const theta = radiansToDegrees(Math.atan2(y, x));

  return {radius, theta};
}



