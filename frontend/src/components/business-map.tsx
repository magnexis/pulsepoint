import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

import type { BusinessSummary } from "@/lib/types";

function markerColor(score: number) {
  if (score < 45) {
    return "#ff7f73";
  }

  if (score < 70) {
    return "#ffd166";
  }

  return "#24c79b";
}

export function BusinessMap({
  businesses,
  heightClassName = "h-[360px]",
}: {
  businesses: BusinessSummary[];
  heightClassName?: string;
}) {
  const center =
    businesses.length > 0
      ? [
          businesses[0].location.latitude || 40.7128,
          businesses[0].location.longitude || -74.006,
        ]
      : [40.7128, -74.006];

  return (
    <div className={`overflow-hidden rounded-[28px] ${heightClassName}`}>
      <MapContainer center={center as [number, number]} zoom={11} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {businesses.map((business) => (
          <CircleMarker
            key={business.id}
            center={[business.location.latitude, business.location.longitude]}
            pathOptions={{
              color: markerColor(business.healthScore),
              fillColor: markerColor(business.healthScore),
              fillOpacity: 0.85,
            }}
            radius={10}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <div className="font-semibold">{business.name}</div>
                <div>{business.location.label}</div>
                <div>Health score: {business.healthScore}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

