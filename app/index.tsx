// App.tsx
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Button,
	Keyboard,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import MapViewComponent from './components/MapViewComponent';
import PlaceDetailModal from './components/PlaceDetailModal';
import { getNearbyPlaces, Place } from './utils/placesApi';

interface LocationCoords {
	latitude: number;
	longitude: number;
}

const App: React.FC = () => {
	const [location, setLocation] = useState<LocationCoords | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	// NEW: searchType and an input to update it
	const [searchType, setSearchType] = useState<string>('cafe');
	const [toSearchType, setToSearchType] = useState<string>('cafe');

	const [places, setPlaces] = useState<Place[]>([]);
	const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [loadingPlaces, setLoadingPlaces] = useState(false);

	// 1. Request permissions & get location
	useEffect(() => {
		(async () => {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				setErrorMsg('Location permission denied');
				return;
			}
			const { coords } = await Location.getCurrentPositionAsync();
			setLocation({ latitude: coords.latitude, longitude: coords.longitude });
		})();
	}, []);

	// 2. Fetch places when location or searchType changes
	const fetchPlaces = useCallback(async () => {
		if (!location) return;
		setLoadingPlaces(true);
		try {
			const results = await getNearbyPlaces({
				latitude: location.latitude,
				longitude: location.longitude,
				keyword: searchType.trim() || undefined,
			});
			setPlaces(results);
		} catch (err: unknown) {
			Alert.alert('Error fetching places', (err as Error).message);
		} finally {
			setLoadingPlaces(false);
		}
	}, [location, searchType]);

	// trigger fetch when location first arrives
	useEffect(() => {
		fetchPlaces();
	}, [fetchPlaces]);

	// Handler for the “Search” button
	const onSearch = () => {
		Keyboard.dismiss();
		setSearchType(toSearchType);
	};

	if (errorMsg) {
		return (
			<View style={styles.centered}>
				<Text>{errorMsg}</Text>
			</View>
		);
	}
	if (!location) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" />
				<Text>Fetching your location…</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* 📍 Search Bar */}
			<View style={styles.searchBar}>
				<TextInput
					style={styles.input}
					placeholder="Search for… e.g. cinema"
					value={toSearchType}
					onChangeText={setToSearchType}
					returnKeyType="search"
					onSubmitEditing={onSearch}
				/>
				<Button title="Search" onPress={onSearch} />
			</View>

			<MapViewComponent
				userLocation={location}
				places={places}
				onMarkerPress={(place) => {
					setSelectedPlace(place);
					setModalVisible(true);
				}}
			/>

			<PlaceDetailModal
				visible={modalVisible}
				place={selectedPlace}
				onClose={() => setModalVisible(false)}
			/>

			{loadingPlaces && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" />
					<Text>Searching for {searchType}s…</Text>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	searchBar: {
		flexDirection: 'row',
		padding: 8,
		backgroundColor: '#fff',
		alignItems: 'center',
		elevation: 2,
	},
	input: {
		flex: 1,
		borderColor: '#ccc',
		borderWidth: 1,
		borderRadius: 4,
		paddingHorizontal: 8,
		height: 40,
		marginRight: 8,
	},
	centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(255,255,255,0.8)',
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default App;
