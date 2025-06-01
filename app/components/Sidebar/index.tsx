"use client";
import { useMapContext } from '@/app/context/MapContext';
import { Dispositivo, fetchHistorial } from '@/app/services/devices';
import { useEffect, useState } from 'react';

export default function Sidebar({ dispositivos }: { dispositivos: Dispositivo[] }) {
  const { state, dispatch } = useMapContext();
  const [historial, setHistorial] = useState<Dispositivo[]>([]);

  useEffect(() => {
    if (state.selectedDevice) {
      fetchHistorial(state.selectedDevice).then(setHistorial);
    }
  }, [state.selectedDevice]);

  // Obtener el último dispositivo por Devicename
  const dispositivosUnicos = dispositivos.reduce((acc: Dispositivo[], device) => {
    const existing = acc.find(d => d.Devicename === device.Devicename);
    // Si no existe o si este tiene una fecha más reciente, lo reemplazamos
    if (!existing || (device.created_at && existing.created_at && new Date(device.created_at) > new Date(existing.created_at))) {
      return [...acc.filter(d => d.Devicename !== device.Devicename), device];
    }
    return acc;
  }, []);

  return (
    <div className="w-64 h-screen bg-black p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Dispositivos</h2>
    

      <div className="space-y-2">
        {dispositivosUnicos.map(device => (
          <div key={device.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={state.visibleDevices.includes(device.id)}
              onChange={() => dispatch({ type: 'TOGGLE_DEVICE', deviceId: device.id })}
            />
            <button
              onClick={() => dispatch({ type: 'SELECT_DEVICE', deviceId: device.Devicename })}
              className="text-blue-600 hover:underline"
            >
              {device.Devicename}
            </button>
          </div>
        ))}
      </div>

      {state.showHistory && historial.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Historial de {state.selectedDevice}</h3>
          <ul className="space-y-2">
            {historial.map((point, index) => (
              <li key={index} className="text-sm">
                {new Date(point.created_at!).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
