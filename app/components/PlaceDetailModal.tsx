import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Place } from '../utils/placesApi';

interface Props {
	visible: boolean;
	place: Place | null;
	onClose: () => void;
}

interface Props {
	visible: boolean;
	place: Place | null;
	onClose: () => void;
}

const PlaceDetailModal: React.FC<Props> = ({ visible, place, onClose }) => {
	if (!place) return null;

	const openInMaps = () => {
		const { lat, lng } = place.geometry.location;
		const label = encodeURIComponent(place.name);
		const url =
			Platform.OS === 'ios'
				? `maps:0,0?q=${lat},${lng}(${label})`
				: `geo:0,0?q=${lat},${lng}(${label})`;
		Linking.openURL(url);
	};

	return (
		<Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
			<View style={styles.overlay}>
				<View style={styles.container}>
					<TouchableOpacity style={styles.close} onPress={onClose}>
						<Ionicons name="close" size={24} />
					</TouchableOpacity>
					<Text style={styles.title}>{place.name}</Text>
					<Text style={styles.vicinity}>{place.vicinity}</Text>
					{place.rating != null && (
						<Text style={styles.rating}>
							Rating: {place.rating} ({place.user_ratings_total} reviews)
						</Text>
					)}
					<TouchableOpacity style={styles.directions} onPress={openInMaps}>
						<Text style={styles.directionsText}>Open in Maps</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.5)',
		justifyContent: 'flex-end',
	},
	container: {
		backgroundColor: '#fff',
		padding: 20,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
	},
	close: { position: 'absolute', top: 12, right: 12 },
	title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
	vicinity: { fontSize: 16, color: '#555', marginBottom: 12 },
	rating: { fontSize: 14, marginBottom: 20 },
	directions: {
		backgroundColor: '#2196F3',
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 8,
		alignSelf: 'flex-start',
	},
	directionsText: { color: '#fff', fontSize: 16 },
});

export default PlaceDetailModal;
