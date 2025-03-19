"use client ";
import build from "next/dist/build";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Alert, AlertDescription } from "./ui/alert";

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
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
}

function StatusLabel(status: string) {
  return (
    <>
      <div
        className={` rounded-lg px-2 py-1 text-sm w-[fit-content]${
          status === "available"
            ? "bg-green-500 text-green-50"
            : status === "unavailable"
            ? "bg-red-500 text-red-50"
            : "bg-yellow-500 text-yellow-50"
        } font-bold  px-2`}
      >
        {status}
      </div>
    </>
  );
}

function StatusIndicator(status: string) {
  return (
    <div
      className={`h-2 w-2 rounded-full 
            ${status === "unavailable" && "bg-red-400"}
            ${status === "available" && "bg-green-400"}
            ${status === "upcoming" && "bg-amber-400"}
                `}
    ></div>
  );
}

const date = new Date();
const day = date.getDay();

export default function Left({
  data,
  activeBuilding,
  setActiveBuilding,
}: {
  data: DataFormat[];
  activeBuilding: string;
  setActiveBuilding: (building: string) => void;
}) {
  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert className="mx-auto w-fit text-center">
          <AlertDescription>No data available</AlertDescription>
        </Alert>
      </div>
    );
  }
  return (
    <div className="px-8">
      {day === 0 ? (
        <Alert className="mx-auto w-fit text-center">Today is Sunday</Alert>
      ) : null}
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={activeBuilding || ""}
        onValueChange={(value) => setActiveBuilding(value)}
      >
        {data.map((building) => (
          <AccordionItem
            key={building.building_code}
            id={building.building_code}
            value={building.building_code}
          >
            <AccordionTrigger>
              <div className=" flex justify-between w-[95%] text-left text-lg group items-center">
                <div className="">
                  {building.building_code} - {building.building}
                </div>
                <div>{StatusLabel(building.building_status)}</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="divide-y didvide-dashed ">
              {building.rooms &&
                Object.entries(building.rooms).map(([roomNumber, room]) => {
                  return (
                    <>
                      <div
                        key={roomNumber}
                        className="flex justify-between items-center py-2"
                      >
                        <div className="flex gap-4 items-center h-[fit-content]">
                          <div className="w-18">
                            {building.building_code} {roomNumber}
                          </div>
                          <div className="relative">
                            {StatusIndicator(room.slot[0].status)}
                          </div>
                          <ul className="text-right">
                            {room.slot.map((slot, index) => (
                              <li key={index}>
                                {formatTime(new Date(slot.openTime))} -{" "}
                                {formatTime(new Date(slot.closeTime))}{" "}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </>
                  );
                })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
