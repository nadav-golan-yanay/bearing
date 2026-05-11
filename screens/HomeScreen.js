import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Animated,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { distanceMetres, bearingDegrees, bearingLabel, formatDistance } from '../utils/geo';

export default function HomeScreen({ appOwner, appVersion }) {
  const [myLocation, setMyLocation] = useState(null);
  const [target, setTarget] = useState(null);
  const [latInput, setLatInput] = useState('');
  const [lonInput, setLonInput] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Animate the arrow
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const prevBearing = useRef(0);

  // Start GPS watch
  useEffect(() => {
    let subscription;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Location permission denied. Please grant permission in settings.');
          return;
        }
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 2 },
          (loc) => {
            setMyLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
          }
        );
      } catch (error) {
        console.error('Location error:', error);
        setErrorMsg('Unable to access location. Check permissions.');
      }
    })();
    return () => subscription?.remove();
  }, []);

  // Animate bearing arrow whenever bearing changes
  useEffect(() => {
    if (!myLocation || !target) return;
    const newBearing = bearingDegrees(
      myLocation.latitude, myLocation.longitude,
      target.latitude, target.longitude
    );
    Animated.timing(arrowAnim, {
      toValue: newBearing,
      duration: 400,
      useNativeDriver: true,
    }).start();
    prevBearing.current = newBearing;
  }, [myLocation, target]);

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setTarget({ latitude, longitude });
    setLatInput(latitude.toFixed(6));
    setLonInput(longitude.toFixed(6));
  };

  const handleSetFromInput = () => {
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      Alert.alert('Invalid coordinates', 'Enter valid latitude (-90 to 90) and longitude (-180 to 180).');
      return;
    }
    setTarget({ latitude: lat, longitude: lon });
  };

  const clearTarget = () => {
    setTarget(null);
    setLatInput('');
    setLonInput('');
  };

  const openGithub = () => {
    if (!appOwner?.github) return;
    Linking.openURL(appOwner.github).catch(() => {
      Alert.alert('Link error', 'Could not open GitHub link.');
    });
  };

  // Computed values
  let distance = null;
  let bearing = null;
  let label = null;
  if (myLocation && target) {
    distance = distanceMetres(myLocation.latitude, myLocation.longitude, target.latitude, target.longitude);
    bearing = bearingDegrees(myLocation.latitude, myLocation.longitude, target.latitude, target.longitude);
    label = bearingLabel(bearing);
  }

  const spin = arrowAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const mapRegion = myLocation
    ? {
        latitude: myLocation.latitude,
        longitude: myLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: 32.0,
        longitude: 34.8,
        latitudeDelta: 5,
        longitudeDelta: 5,
      };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Map */}
      <MapView
        style={styles.map}
        region={mapRegion}
        mapType="standard"
        showsUserLocation
        onPress={handleMapPress}
        onMapReady={() => {
          console.log('Map ready');
          setMapLoaded(true);
        }}
        onError={(e) => {
          console.log('Map error:', e);
          setErrorMsg('Map tiles failed to load.');
        }}
      >
        {target && (
          <Marker coordinate={target} pinColor="#e74c3c" title="Target" />
        )}
      </MapView>

      {/* Bottom panel */}
      <ScrollView style={styles.panel} keyboardShouldPersistTaps="handled">
        <Text style={styles.hint}>Tap the map to set a target, or type coordinates below.</Text>

        {/* Coordinate inputs */}
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Latitude"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={latInput}
            onChangeText={setLatInput}
          />
          <TextInput
            style={styles.input}
            placeholder="Longitude"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={lonInput}
            onChangeText={setLonInput}
          />
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={handleSetFromInput}>
            <Text style={styles.btnText}>Set Target</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={clearTarget}>
            <Text style={styles.btnText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Status / error */}
        {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
        {!myLocation && !errorMsg && <Text style={styles.hint}>Acquiring GPS...</Text>}

        {/* Results */}
        {myLocation && target && (
          <View style={styles.results}>
            {/* Compass arrow */}
            <Animated.Text style={[styles.arrow, { transform: [{ rotate: spin }] }]}>↑</Animated.Text>

            <Text style={styles.resultLabel}>Distance</Text>
            <Text style={styles.resultValue}>{formatDistance(distance)}</Text>

            <Text style={styles.resultLabel}>Bearing</Text>
            <Text style={styles.resultValue}>{bearing.toFixed(1)}° {label}</Text>

            <Text style={styles.coords}>
              From: {myLocation.latitude.toFixed(5)}, {myLocation.longitude.toFixed(5)}
            </Text>
            <Text style={styles.coords}>
              To: {target.latitude.toFixed(5)}, {target.longitude.toFixed(5)}
            </Text>
          </View>
        )}

        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>About</Text>
          <Text style={styles.aboutLine}>Version: {appVersion || '1.0.0'}</Text>
          {appOwner?.name ? <Text style={styles.aboutLine}>By: {appOwner.name}</Text> : null}
          {appOwner?.title ? <Text style={styles.aboutLine}>Role: {appOwner.title}</Text> : null}
          {appOwner?.contact ? <Text style={styles.aboutLine}>Contact: {appOwner.contact}</Text> : null}
          {appOwner?.github ? (
            <TouchableOpacity onPress={openGithub}>
              <Text style={styles.aboutLink}>GitHub: {appOwner.github}</Text>
            </TouchableOpacity>
          ) : null}
          {appOwner?.thanks ? <Text style={styles.aboutThanks}>{appOwner.thanks}</Text> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  map: { flex: 1 },
  panel: {
    backgroundColor: '#16213e',
    maxHeight: '45%',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  hint: { color: '#aaa', fontSize: 13, textAlign: 'center', marginBottom: 8 },
  error: { color: '#e74c3c', fontSize: 13, textAlign: 'center', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  input: {
    flex: 1,
    backgroundColor: '#0f3460',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  btn: {
    flex: 1,
    backgroundColor: '#e94560',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnSecondary: { backgroundColor: '#533483' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  results: { alignItems: 'center', paddingVertical: 12 },
  arrow: { fontSize: 72, color: '#e94560', marginBottom: 8 },
  resultLabel: { color: '#aaa', fontSize: 13, marginTop: 8 },
  resultValue: { color: '#fff', fontSize: 28, fontWeight: '700' },
  coords: { color: '#666', fontSize: 11, marginTop: 4 },
  aboutCard: {
    marginTop: 6,
    marginBottom: 14,
    borderRadius: 10,
    backgroundColor: '#0f3460',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  aboutTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  aboutLine: {
    color: '#d6deff',
    fontSize: 12,
    marginBottom: 2,
  },
  aboutLink: {
    color: '#7dd3fc',
    fontSize: 12,
    marginBottom: 2,
    textDecorationLine: 'underline',
  },
  aboutThanks: {
    color: '#9fb1ff',
    fontSize: 11,
    marginTop: 8,
  },
});
