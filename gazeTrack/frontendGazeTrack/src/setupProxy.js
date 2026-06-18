/**
 * Development server proxy to fix MediaPipe WASM asset resolution.
 *
 * When WebGazer's TFFacemesh tracker initializes, it dynamically loads
 * MediaPipe binary files (e.g. face_mesh_solution_simd_wasm_bin.js/.wasm).
 * These are fetched relative to the current page URL, so on SPA routes
 * like /calibrate the browser requests /calibrate/face_mesh_solution_...
 * The CRA dev server can't find these files and returns index.html instead,
 * causing "Unexpected token '<'" errors.
 *
 * This middleware intercepts those requests and redirects them to the
 * official MediaPipe CDN on jsDelivr.
 */
module.exports = function (app) {
  // MediaPipe Tasks-Vision handles asset resolution directly, so the old WebGazer redirection is no longer required.
};
