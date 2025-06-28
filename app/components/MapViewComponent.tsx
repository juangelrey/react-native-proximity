import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Place } from '../utils/placesApi';

interface Props {
	userLocation: { latitude: number; longitude: number };
	places: Place[];
	onMarkerPress: (place: Place) => void;
}

const MapViewComponent: React.FC<Props> = ({ userLocation, places, onMarkerPress }) => {
	const region: Region = {
		latitude: userLocation.latitude,
		longitude: userLocation.longitude,
		latitudeDelta: 0.02,
		longitudeDelta: 0.02,
	};

	return (
		<MapView style={styles.map} initialRegion={region} showsUserLocation>
			{places.map((place) => (
				<Marker
					key={place.id}
					coordinate={{
						latitude: place.geometry.location.lat,
						longitude: place.geometry.location.lng,
					}}
					title={place.name}
					description={place.vicinity}
					onPress={() => onMarkerPress(place)}
				/>
			))}
		</MapView>
	);
};

const styles = StyleSheet.create({
	map: {
		flex: 1,
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height,
	},
});

export default MapViewComponent;
