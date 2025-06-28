export interface Place {
	id: string;
	name: string;
	vicinity: string;
	address: string;
	geometry: { location: { lat: number; lng: number } };
	rating?: number;
	user_ratings_total?: number;
	icon?: string;
}

interface NearbyResponse {
	status: string;
	results: {
		place_id: string;
		name: string;
		vicinity?: string;
		formatted_address?: string;
		geometry: { location: { lat: number; lng: number } };
		rating?: number;
		user_ratings_total?: number;
		icon?: string;
	}[];
	error_message?: string;
}

interface Params {
	latitude: number;
	longitude: number;
	/** free-form text query (e.g. 'cinema', 'bookstore') */
	keyword?: string;
	/** exact type enum (e.g. 'cafe', 'movie_theater') */
	type?: string;
	radius?: number;
}

export const getNearbyPlaces = async ({
	latitude,
	longitude,
	keyword,
	type = 'cafe',
	radius = 1500,
}: {
	latitude: number;
	longitude: number;
	keyword?: string;
	type?: string;
	radius?: number;
}): Promise<Place[]> => {
	const isTextSearch = Boolean(keyword && keyword.trim().length > 0);

	const baseUrl = isTextSearch
		? 'https://maps.googleapis.com/maps/api/place/textsearch/json'
		: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

	const params = new URLSearchParams({
		key: process.env.EXPO_PUBLIC_GPMAPS_API_KEY || '',
		location: `${latitude},${longitude}`,
		radius: radius.toString(),
	});
	if (isTextSearch) {
		params.append('query', keyword!.trim());
	} else {
		params.append('type', type);
	}

	const url = `${baseUrl}?${params.toString()}`;
	console.log(url);
	const response = await fetch(url);
	const data = (await response.json()) as NearbyResponse;

	if (data.status !== 'OK') {
		throw new Error(data.error_message ?? `Places API error: ${data.status}`);
	}

	return data.results.map((p) => ({
		id: p.place_id,
		name: p.name,
		vicinity: p.vicinity || '',
		address: p.formatted_address || p.vicinity || '',
		geometry: p.geometry,
		rating: p.rating,
		user_ratings_total: p.user_ratings_total,
		icon: p.icon,
	}));
};
