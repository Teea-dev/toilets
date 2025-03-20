"use client"
import { useEffect } from "react"
import Map from "./map"

interface DataFormat {
  building: string
  building_code: string
  building_status: string
  rooms: {
    [key: string]: {
      roomNumber: string
      slot: { openTime: string; closeTime: string; status: string }[]
    }
  }
  coordinates: [number, number]
  distance: number
}

export default function MapContainer({
  data,
  userPosition,
  activeBuilding,
  onBuildingSelect,
}: {
  data: DataFormat[]
  userPosition: [number, number]
  activeBuilding: string | null
  onBuildingSelect: string
}) {
  // This component acts as a bridge between the page and the Map component
  const handleMarkerClick = (building: string) => {
    // Use the activeBuilding string to update the URL or trigger a custom event
    window.history.pushState({}, "", `?building=${building}`)

    // Dispatch a custom event that the page component can listen for
    const event = new CustomEvent("buildingSelected", {
      detail: { building },
    })
    window.dispatchEvent(event)
  }

  // Verify the token is available
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      console.error("NEXT_PUBLIC_MAPBOX_TOKEN is not defined in environment variables")
    }
  }, [])

  return <Map data={data} userPosition={userPosition} handleMarkerClick={handleMarkerClick} />
}

