import Mapa from "./components/Map";
import Sidebar from "./components/Sidebar";
import { MapProvider } from "./context/MapContext";
import { fetchDispositivos } from "./services/devices";

export default async function Home() {
  const dispositivos = await fetchDispositivos();

  return (
    <MapProvider>
      <main className="flex h-screen">
        <Sidebar dispositivos={dispositivos} />
        <div className="flex-1 p-4">
          <Mapa dispositivos={dispositivos} />
        </div>
      </main>
    </MapProvider>
  );
}
