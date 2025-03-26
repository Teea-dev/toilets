"use client";
import { useState, useEffect } from "react";

import Left from "@/components/left";
import { ScrollArea } from "@/components/ui/scroll-area";
import Map from "@/components/map";
import Loading from "@/components/loading";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DataFormat {
  building: string;
  building_code: string;
  building_status: string;
  rooms: {
    [key: string]: {
      roomNumber: string;
      slot: { openTime: string; closeTime: string; status: string }[];
    };
  };
  coordinates: [number, number];
  distance: number;
}

export default function Home() {
  const [data, setData] = useState<DataFormat[]>([]);
  const [userPosition, setUserPosition] = useState<[number, number]>([0, 0]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeBuilding, setActiveBuilding] = useState<string | null>(null);

  const handleMarkerClick = (building: string) => {
    setActiveBuilding(building);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            setUserPosition([
              position.coords.latitude,
              position.coords.longitude,
            ]);
            try {
              const res = await fetch("/api/data", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userPosition,
                }),
              });
              const data = await res.json();
              setData(data);
            } catch (err) {
              console.error(err);
            } finally {
              setLoading(false);
            }
          },
          async (error) => {
            console.error("Error", error);

            const res = await fetch("/api/data");
            const defaultData = await res.json();
            setData(defaultData);

            setLoading(false);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser");

        const res = await fetch("/api/data", {
          method: "GET",
        });
        const defaultData = await res.json();
        setData(defaultData);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="flex flex-col sm:flex-row sm:gap-4 h-screen">
      <div className="basis-2/5  sm-h-full order-last sm:order-first py-4 sm:px-0 sm:py-2 bg-[#18181b]/90 overflow-hidden sm:flex sm:flex-col ">
        <div className="w-full h-20 pl-8 pr-4 hidden sm:flex sm:justify-between items-center">
          <Popover>
            <PopoverTrigger>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width={28}
                height={28}
                fill={"none"}
              >
                <path
                  d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M12.2422 17V12C12.2422 11.5286 12.2422 11.2929 12.0957 11.1464C11.9493 11 11.7136 11 11.2422 11"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.992 8H12.001"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </PopoverTrigger>
            <PopoverContent className="bg-zinc-950 border-zinc-600 text-zinc-100 w-72">
              <div className="font-bold mb-1">Important Notes:</div>
              <ul className="list-disc pl-4">
                <li>
                  Toilet access may be restricted to specific colleges or
                  departments
                </li>
                 <li>
                  Displayed availability only reflects official class schedules
                </li> 
                <li>
                  Rooms may be occupied by unofficial meetings or study groups
                </li> 
                <li>Click on indicators to view toilets for that building</li>
              </ul>
            </PopoverContent>
          </Popover>
        </div>
        <ScrollArea className="h-full">
          <div className="w-full h-20 pl-8 pr-8 sm:hidden flex justify-between items-center">
            <Popover>
              <PopoverTrigger className="">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width={28}
                  height={28}
                  fill={"none"}
                >
                  <path
                    d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M12.2422 17V12C12.2422 11.5286 12.2422 11.2929 12.0957 11.1464C11.9493 11 11.7136 11 11.2422 11"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11.992 8H12.001"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </PopoverTrigger>
              <PopoverContent className="bg-zinc-900 border-zinc-600 text-zinc-200 w-72">
                <div className="font-bold mb-1">Important Notes:</div>
                <ul className="list-disc pl-4">
                  <li>
                    Toilet access may be restricted to specific colleges or
                    departments
                  </li>
                  {/* <li>
                  Displayed availability only reflects official class schedules
                </li> */}
                  {/* <li>
                  Rooms may be occupied by unofficial meetings or study groups
                </li> */}
                  <li>Click on indicators to view toilets for that building</li>
                </ul>
              </PopoverContent>
            </Popover>
          </div>
          <Left
            data={data}
            activeBuilding={activeBuilding || ""}
            setActiveBuilding={setActiveBuilding}
          />
        </ScrollArea>
      </div>
      <div className="h-[60vh] basis-3/5 sm:h-screen">
        <Map
          data={data}
          userPosition={userPosition}
          handleMarkerClick={handleMarkerClick}
        />
      </div>
    </main>
  );
}
