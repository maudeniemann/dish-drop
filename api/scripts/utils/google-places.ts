import 'dotenv/config';

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE_URL = 'https://places.googleapis.com/v1';

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.addressComponents',
  'places.location',
  'places.types',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.priceLevel',
  'places.currentOpeningHours',
  'places.photos',
].join(',');

interface TextSearchRequest {
  textQuery: string;
  locationBias?: {
    circle: {
      center: { latitude: number; longitude: number };
      radius: number;
    };
  };
  pageSize?: number;
  pageToken?: string;
}

export async function textSearch(query: string, pageToken?: string) {
  if (!API_KEY) {
    throw new Error('GOOGLE_PLACES_API_KEY is not set in .env');
  }

  const body: TextSearchRequest = {
    textQuery: query,
    locationBias: {
      circle: {
        center: { latitude: 42.3355, longitude: -71.1685 },
        radius: 5000.0,
      },
    },
    pageSize: 20,
  };

  if (pageToken) {
    body.pageToken = pageToken;
  }

  const response = await fetch(`${BASE_URL}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Places API error ${response.status}: ${text}`);
  }

  return response.json();
}

export async function fetchAllPages(query: string): Promise<any[]> {
  const allPlaces: any[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < 3; page++) {
    const result = await textSearch(query, pageToken);
    if (result.places) {
      allPlaces.push(...result.places);
    }
    pageToken = result.nextPageToken;
    if (!pageToken) break;
    // Google requires a short delay before using nextPageToken
    await new Promise(r => setTimeout(r, 2000));
  }

  return allPlaces;
}

export function getPhotoUrl(photoName: string, maxWidth = 800): string {
  return `${BASE_URL}/${photoName}/media?maxWidthPx=${maxWidth}&key=${API_KEY}`;
}

export async function fetchPhotoRedirectUrl(photoName: string, maxWidth = 800): Promise<string | null> {
  if (!API_KEY) return null;

  try {
    const url = `${BASE_URL}/${photoName}/media?maxWidthPx=${maxWidth}&key=${API_KEY}&skipHttpRedirect=true`;
    const response = await fetch(url, {
      headers: { 'X-Goog-Api-Key': API_KEY },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.photoUri || null;
  } catch {
    return null;
  }
}
