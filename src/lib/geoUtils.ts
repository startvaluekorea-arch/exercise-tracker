// Haversine 공식을 사용한 두 좌표간 직선 거리(km) 계산
export function calculateDistance(
  lat1: number | null | undefined,
  lon1: number | null | undefined,
  lat2: number | null | undefined,
  lon2: number | null | undefined
): number | null {
  if (
    lat1 === null || lat1 === undefined ||
    lon1 === null || lon1 === undefined ||
    lat2 === null || lat2 === undefined ||
    lon2 === null || lon2 === undefined
  ) {
    return null;
  }

  const R = 6371; // 지구 반지름 (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // 소수점 첫째자리까지 (예: 1.2km)
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function formatDistanceText(distanceKm: number | null | undefined): string {
  if (distanceKm === null || distanceKm === undefined) {
    return '위치 미등록 이웃';
  }
  if (distanceKm < 0.1) {
    return '100m 이내 매우 가까운 이웃';
  }
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m 떨어진 이웃`;
  }
  return `${distanceKm}km 떨어진 이웃`;
}
