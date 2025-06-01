"use client";
import { useMapContext } from '@/app/context/MapContext';
import { Dispositivo, fetchHistorial } from '@/app/services/devices';
import { useEffect, useState } from 'react';
import "leaflet/dist/leaflet.css";
import { stat } from 'fs';

type Historial = Dispositivo & { created_at: string };

export default function Mapa({ dispositivos }: { dispositivos: Dispositivo[] }) {
  const { state, dispatch } = useMapContext();
  const [isClient, setIsClient] = useState(false);
  const [selectedPath, setSelectedPath] = useState<Historial[]>([]);

  useEffect(() => {
    import("leaflet-defaulticon-compatibility").then(() => {
      import("leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css");
    });
    import("leaflet").then((L) => {
      const DefaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      L.Marker.prototype.options.icon = DefaultIcon;
    });
    setIsClient(true);
  }, []);
  function insertDecimal(value: string, digitsBeforeDecimal: number): number {
    // Si ya contiene un punto decimal, devolverlo directamente como número
    if (value.includes('.')) return Number(value);
  
    const isNegative = value.startsWith("-");
    const cleanValue = isNegative ? value.slice(1) : value;
  
    if (cleanValue.length <= digitsBeforeDecimal) return Number(value);
  
    const withDecimal = cleanValue.slice(0, digitsBeforeDecimal) + "." + cleanValue.slice(digitsBeforeDecimal);
    return Number(isNegative ? "-" + withDecimal : withDecimal);
  }

  // Obtener el último dispositivo por Devicename
  const dispositivosUnicos = dispositivos.reduce((acc: Dispositivo[], device) => {
    const existing = acc.find(d => d.Devicename === device.Devicename);
    if (!existing || (device.created_at && existing.created_at && new Date(device.created_at) > new Date(existing.created_at))) {
      return [...acc.filter(d => d.Devicename !== device.Devicename), device];
    }
    return acc;
  }, []);

  // Filtrar dispositivos visibles según el contexto
  const visibleDevices = dispositivosUnicos.filter(d =>

    state.visibleDevices.includes(d.id)
    
  );

  // Cargar historial al seleccionar un dispositivo
  useEffect(() => {
    async function loadHistorial(devicename: string) {
      
      const data = await fetchHistorial(devicename);

      setSelectedPath(data as Historial[]);
    
    }
    if (state.selectedDevice) {
 
      loadHistorial(state.selectedDevice);
    } else {
      setSelectedPath([]);
    }
  }, [state.selectedDevice]);

  const resetMapa = () => {

    dispatch({ type: "SELECT_DEVICE", deviceId: "" });
  };

  if (!isClient) return <div>Cargando mapa...</div>;

  const { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } = require("react-leaflet");

  return (
    <div>
      <button
        onClick={() => {
          dispatch({ type: "TOGGLE_HISTORY" });
          resetMapa();
        }}
        style={{
          marginBottom: "10px",
          padding: "8px 16px",
          cursor: "pointer",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
      {state.showHistory ? "Ocultar dispositivos" : "Mostrar dispositivos"}
      </button>

      {state.selectedDevice != "" && (
        <button
          onClick={()=>{
            resetMapa()
            dispatch({ type: "TOGGLE_HISTORY"})
          }
        }
          style={{
            marginLeft: "10px",
            marginBottom: "10px",
            padding: "8px 16px",
            cursor: "pointer",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Volver al mapa general
        </button>
      )}

      <MapContainer
        center={[23.113592, -82.366592]}
        zoom={13}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {state.selectedDevice != "" ? (
          
          <Polyline
            key={`polyline-${state.selectedDevice}-${selectedPath.length}`}
            positions={selectedPath
              .map((p, index) => {
          
                const current = {
                  lat: Number(p.latitude), 
                  lng: Number(p.longitude), 
                };
              
                const next = selectedPath[index + 1]
                  ? {
                      lat:Number( selectedPath[index + 1].latitude),
                      lng: Number(selectedPath[index + 1].longitude),
                    }
                  : null;
                if (next && !isNaN(current.lat) && !isNaN(current.lng) && !isNaN(next.lat) && !isNaN(next.lng)) {
        
                  return [current, next];
                }
               
                return null;
              })
              .filter((pair) => pair !== null)
              .flat()}
            pathOptions={{
              color: "#e74c3c",
              weight: 6,
              opacity: 0.7,
              lineJoin: "round",
            }}
          />
        
        ) : (

          state.selectedDevice == "" &&
          visibleDevices.map((d) => (
          
            <Marker
              key={d.id}
              position={[parseFloat(d.latitude), parseFloat(d.longitude)]}
              eventHandlers={{
                click: () =>
                  
                  dispatch({ type: "SELECT_DEVICE", deviceId: d.Devicename })
                  
              }}
            >
              <Tooltip
                permanent
                direction="top"
                offset={[0, -20]}
                opacity={1}
                className="custom-tooltip"
              >
                {d.Devicename}
              </Tooltip>
              <Popup>
                <strong>{d.Devicename}</strong>
                <br />
                Click para ver historial
              </Popup>
            </Marker>
          ))
        )}
      </MapContainer>
    </div>
  );
}
