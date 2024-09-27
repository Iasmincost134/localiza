import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { FontAwesome } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const destination = {
    latitude: -23.54, // Latitude de exemplo
    longitude: -46.36, // Longitude de exemplo
  };
  const [route, setRoute] = useState([]);

  const calculateRoute = async (origin, destination) => {
    try {
      const originCoords = `${origin.longitude},${origin.latitude}`;
      const destinationCoords = `${destination.longitude},${destination.latitude}`;
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originCoords};${destinationCoords}?overview=full&geometries=geojson`;

      const response = await fetch(osrmUrl);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const routeData = data.routes[0].geometry.coordinates;
        const routeCoordinates = routeData.map((coord) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
        setRoute(routeCoordinates);
      }
    } catch (error) {
      console.error('Erro ao calcular a rota:', error);
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão para acessar localização negada.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      calculateRoute(location.coords, destination);
    })();
  }, []);

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        <Marker
          coordinate={{
            latitude: destination.latitude,
            longitude: destination.longitude,
          }}
          title="Destino"
          description="Ponto de chegada"
        >
          <FontAwesome name="flag" size={40} color="green" />
        </Marker>
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Você está aqui"
          description="Localização atual"
        >
          <FontAwesome name="map-marker" size={40} color="red" />
        </Marker>

        {route.length > 0 && (
          <Polyline coordinates={route} strokeWidth={4} strokeColor="blue" />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});
