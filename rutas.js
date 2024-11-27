function calcularDistancia(lat1, lon1, lat2, lon2) {
    const radioTierraKm = 6371; 
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanciaKm = radioTierraKm * c;
    const distanciaMetros = distanciaKm * 1000;
    return distanciaMetros;
  }
  
  function deg2rad(grados) {
    return grados * (Math.PI / 180);
  }

  const lineasLayer = L.layerGroup();

  var toRadians = (degrees) => degrees * (Math.PI / 180);
    
  var toDegrees = (radians) => radians * (180 / Math.PI);

  var projectPoint = (lat, lon, distance, angle) => {
    const R = 6371000; 
    const latRad = toRadians(lat);
    const lonRad = toRadians(lon);
    const angleRad = toRadians(angle);
  
    const newLat =
      Math.asin(
        Math.sin(latRad) * Math.cos(distance / R) +
          Math.cos(latRad) * Math.sin(distance / R) * Math.cos(angleRad)
      );
  
    const newLon =
      lonRad +
      Math.atan2(
        Math.sin(angleRad) * Math.sin(distance / R) * Math.cos(latRad),
        Math.cos(distance / R) - Math.sin(latRad) * Math.sin(newLat)
      );
  
    return {
      lat: toDegrees(newLat),
      lon: toDegrees(newLon),
    };
  };
  
  function degreesToRadians(degrees) {
      return degrees * (Math.PI / 180);
    }
    
function calcularAngulo(latitudA, longitudA, latitudB, longitudB) {
      const latitudARad = degreesToRadians(latitudA);
      const longitudARad = degreesToRadians(longitudA);
      const latitudBRad = degreesToRadians(latitudB);
      const longitudBRad = degreesToRadians(longitudB);
    
      const diferenciaLongitud = longitudBRad - longitudARad;
    
      let angulo = Math.atan2(Math.sin(diferenciaLongitud), Math.cos(latitudARad) * Math.tan(latitudBRad) - Math.sin(latitudARad) * Math.cos(diferenciaLongitud));
    
      let anguloGrados = angulo * (180 / Math.PI);
    
      anguloGrados = (anguloGrados + 360) % 360;
    
      return anguloGrados;
    }
   
function rutas(lat0, lon0, latF, lonF){

  

  lineasLayer.clearLayers();
    var puntoB = [lat0, lon0]; 
    var punto0 = [latF, lonF]

    var acumulator = 0;
    var latitud;
    var longitud;
    var punto01 = true;
    var poligonoPunto;
    var DentroDeEdi = false;
    var indice;

    for (let index = 0; index < ListPoligon.length; index++) {       
      var puntotCoords = [latF, lonF];
      var poligonoCoords = ListPoligon[index].getLatLngs()[0];   
      poligonoCoords.push(poligonoCoords[0]);
      var poligonoArrays = poligonoCoords.map(({lat, lng}) => [lat, lng]);
      var puntoT = turf.point(puntotCoords);  
      var polygono = turf.polygon([poligonoArrays]);
      var isInside = turf.booleanPointInPolygon(puntoT, polygono);
      if(isInside)
        {
          indice = index;
          index=ListPoligon.length;
          
          ListPoligon.splice(indice, 1);
        }
    }
 
  

    for (let index = 0; index < 500; index++) {

    var angle = calcularAngulo(punto0[0], punto0[1], puntoB[0], puntoB[1]);
    if(DentroDeEdi){
      var modiAngu = angle + acumulator;
      var point = projectPoint(puntoB[0], puntoB[1], -4, modiAngu);
    }
    else{
      var point = projectPoint(puntoB[0], puntoB[1], -4, angle);
      acumulator=0;
    }
    var pointCoords = [point.lat, point.lon];

    for (let index = 0; index < ListPoligon.length; index++) {       
    var pointCoords = [point.lat, point.lon];
    var poligonCoords = ListPoligon[index].getLatLngs()[0];   
    poligonCoords.push(poligonCoords[0]);
    var poligonArrays = poligonCoords.map(({lat, lng}) => [lat, lng]);
    var pointT = turf.point(pointCoords);  
    var polygon = turf.polygon([poligonArrays]);
    var isInside = turf.booleanPointInPolygon(pointT, polygon);

      if(isInside && punto01)
      {
        //poligo = ListPoligon[index];
        punto01 = true;
        index=ListPoligon.length;
        DentroDeEdi = true;

      }
      else if(isInside){
            poligo = ListPoligon[index];
            index=ListPoligon.length;
            //console.log(poligo);
            poligonoPunto = poligonArrays[0];
            DentroDeEdi = true;
           
            punto01 = false;
        } 
    else{

          DentroDeEdi =false;
        }
       
    }
   
    if (DentroDeEdi && punto01) {
      var distancias= [];
      for (let g = 0; g < poligonArrays.length; g++) {
        var distan = calcularDistancia(poligonArrays[g][0],poligonArrays[g][1],punto0[0],punto0[1]);
        distancias.push(distan);

      }

      var distanMinima = Infinity;
      for (let g = 0; g < poligonArrays.length; g++) {
        if (distancias[g] <= distanMinima) {
          poligonoPunto = poligonArrays[g];
          distanMinima = distancias[g];
        }

      }
 
      puntoB = [poligonoPunto[0],poligonoPunto[1]];
      punto01 = false;

    }
    else if(DentroDeEdi){
      acumulator += -10;

    }
    else if(!DentroDeEdi){
    var puntoH = [point.lat, point.lon];
    const lineaA = L.polyline([puntoB, puntoH], { color: 'red' });
    latitud = point.lat;
    longitud = point.lon;
    puntoB = [latitud,longitud];
    lineaA.addTo(lineasLayer);
    punto01 = false;

    }
    
   
    }

    lineasLayer.addTo(map);
   

}

function onMapClick(e) {

    
    
    rutas(e.latlng.lat, e.latlng.lng, 27.493935, -109.971948);
   
}
//lineasLayer.addTo(map);
map.on('click', onMapClick);


