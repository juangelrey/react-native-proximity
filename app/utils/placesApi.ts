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
	next_page_token?: string;
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

export interface PlacesResponse {
	places: Place[];
	nextPageToken?: string;
}

interface Params {
	latitude: number;
	longitude: number;
	keyword?: string;
	type?: string;
	radius?: number;
	pageToken?: string;
}

const NEARBY_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const TEXT_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

export const getNearbyPlaces = async ({
	latitude,
	longitude,
	keyword,
	type = 'cafe',
	radius = 1500,
	pageToken,
}: Params): Promise<PlacesResponse> => {
	const isTextSearch = Boolean(keyword && keyword.trim().length > 0);
	let baseUrl: string;

	baseUrl = isTextSearch
		? 'https://maps.googleapis.com/maps/api/place/textsearch/json'
		: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

	const params = new URLSearchParams({
		key: process.env.EXPO_PUBLIC_GPMAPS_API_KEY || '',
		location: `${latitude},${longitude}`,
		radius: radius.toString(),
	});
	if (pageToken) {
		// Pagination: keep same endpoint type as original search
		baseUrl = keyword ? TEXT_URL : NEARBY_URL;
		params.append('pagetoken', pageToken);
	} else {
		// First-page search
		baseUrl = keyword ? TEXT_URL : NEARBY_URL;
		params.append('location', `${latitude},${longitude}`);
		params.append('radius', radius.toString());

		if (keyword && keyword.trim().length > 0) {
			params.append('query', keyword.trim());
		} else {
			params.append('type', type);
		}
	}

	const url = `${baseUrl}?${params.toString()}`;

	console.log(url);
	const res = await fetch(url);
	const data = (await res.json()) as NearbyResponse;

	if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
		throw new Error(data.error_message ?? `Places API error: ${data.status}`);
	}

	const places: Place[] = data.results.map((p) => ({
		id: p.place_id,
		name: p.name,
		vicinity: p.vicinity ?? p.formatted_address ?? '',
		address: p.vicinity ?? p.formatted_address ?? '',
		geometry: p.geometry,
		rating: p.rating,
		user_ratings_total: p.user_ratings_total,
		icon: p.icon,
	}));

	return {
		places,
		nextPageToken: data.next_page_token,
	};
};
