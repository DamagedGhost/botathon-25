const REGION_COORDS = {
  'Región de Arica y Parinacota': { lat: -18.4783, lng: -70.3126 },
  'Región de Tarapacá': { lat: -20.2133, lng: -70.1525 },
  'Región de Antofagasta': { lat: -23.6500, lng: -70.4000 },
  'Región de Atacama': { lat: -27.3668, lng: -70.3322 },
  'Región de Coquimbo': { lat: -29.9533, lng: -71.3436 },
  'Región de Valparaíso': { lat: -33.0458, lng: -71.6197 },
  'Región Metropolitana': { lat: -33.4489, lng: -70.6693 },
  'Región del Libertador General Bernardo O’Higgins': { lat: -34.5750, lng: -70.9859 },
  'Región del Maule': { lat: -35.4264, lng: -71.6554 },
  'Región del Ñuble': { lat: -36.8266, lng: -72.5748 },
  'Región del Biobío': { lat: -36.8201, lng: -73.0444 },
  'Región de La Araucanía': { lat: -38.7397, lng: -72.5984 },
  'Región de Los Ríos': { lat: -39.8173, lng: -73.2425 },
  'Región de Los Lagos': { lat: -41.4689, lng: -72.9411 },
  'Región de Aysén': { lat: -45.5752, lng: -72.0662 },
  'Región de Magallanes y de la Antártica Chilena': { lat: -53.1638, lng: -70.9171 },
};

function coordForRegion(region) {
  return REGION_COORDS[region] || REGION_COORDS['Región Metropolitana'];
}

module.exports = { REGION_COORDS, coordForRegion };
