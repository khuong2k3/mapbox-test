
//export function num2deg(zoom: number, xtile: number, ytile: number) {
//  const n = 1 << zoom  // Equivalent to 2**zoom
//  const lon_deg = xtile / n * 360.0 - 180.0
//  const lat_rad = Math.atan(Math.sinh(Math.PI * (1 - 2 * ytile / n)))
//  const lat_deg = lat_rad * (180.0 / Math.PI)
//
//  return {
//    lat: lat_deg,
//    lng: lon_deg
//  }
//}

export function tileToLatLon(z: number, x: number, y: number) {
    // Calculate longitude
    const lng = (x / Math.pow(2, z) * 360) - 180;

    // Calculate latitude using the inverse Mercator projection formula
    const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
    const lat = 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

    return { lat, lng };
}
