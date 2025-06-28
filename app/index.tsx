// App.tsx
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
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
	const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
	const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [loadingPlaces, setLoadingPlaces] = useState(false);

	// loading more feature
	const [loadingMore, setLoadingMore] = useState(false);

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

	useEffect(() => {
		if (!location) return;
		setLoadingPlaces(true);

		(async () => {
			try {
				const { places: firstPage, nextPageToken: token } = await getNearbyPlaces({
					latitude: location.latitude,
					longitude: location.longitude,
					keyword: searchType.trim() || undefined,
				});
				setPlaces(firstPage);
				setNextPageToken(token);
			} catch (err: unknown) {
				Alert.alert('Error fetching places', (err as Error).message);
			} finally {
				setLoadingPlaces(false);
			}
		})();
	}, [location, searchType]);

	const onLoadMore = async () => {
		if (!nextPageToken || !location) return;

		setLoadingMore(true);
		try {
			const { places: morePlaces, nextPageToken: token } = await getNearbyPlaces({
				latitude: location.latitude,
				longitude: location.longitude,
				pageToken: nextPageToken,
			});
			setPlaces((prev) => [...prev, ...morePlaces]);
			setNextPageToken(token);
		} catch (err: unknown) {
			Alert.alert('Error loading more places', (err as Error).message);
		} finally {
			setLoadingMore(false);
		}
	};

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
			{/* 🔍 Search Bar */}
			<View style={styles.searchBar}>
				<TextInput
					style={styles.input}
					placeholder="e.g. cinema"
					value={toSearchType}
					onChangeText={setToSearchType}
					returnKeyType="search"
					onSubmitEditing={onSearch}
				/>
				<Button title="Search" onPress={onSearch} />
			</View>

			{/* 🗺 Map */}
			<MapViewComponent
				userLocation={location}
				places={places}
				onMarkerPress={(place) => {
					setSelectedPlace(place);
					setModalVisible(true);
				}}
			/>

			{/* ℹ️ Detail Modal */}
			<PlaceDetailModal
				visible={modalVisible}
				place={selectedPlace}
				onClose={() => setModalVisible(false)}
			/>

			{/* ⏳ Initial loading overlay */}
			{loadingPlaces && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" />
					<Text>Searching for {searchType}s…</Text>
				</View>
			)}

			{/* ▶️ Load More button */}
			{nextPageToken && !loadingPlaces && (
				<View style={styles.loadMoreContainer}>
					<Button
						title={loadingMore ? 'Loading…' : 'Load More'}
						onPress={onLoadMore}
						disabled={loadingMore}
					/>
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
		zIndex: 2, // keep above map
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
		zIndex: 3,
	},
	loadMoreContainer: {
		position: 'absolute',
		bottom: 20,
		alignSelf: 'center',
		backgroundColor: '#fff',
		borderRadius: 4,
		elevation: 4,
		padding: 4,
		zIndex: 2,
	},
});

export default App;
