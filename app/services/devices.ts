export type Dispositivo = {
    id: string;
    latitude: string;
    longitude: string;
    Devicename: string;
    created_at?: string;
  };
  
  export async function fetchDispositivos(): Promise<Dispositivo[]> {
    const res = await fetch("http://esaki-jrr.com/gps/getgps");
    return processCoordinates(await res.json());
  }
  
  export async function fetchHistorial(deviceName: string): Promise<Dispositivo[]> {
    const res = await fetch(`http://esaki-jrr.com/gps/getgps`);
    const data = await res.json();
  
    // Filtra solo los registros del dispositivo con el nombre indicado
    const filtered = data.filter((d: Dispositivo) => d.Devicename === deviceName);
  
    // Procesa las coordenadas (si es necesario)
    return processCoordinates(filtered);
  }
  
  
  function processCoordinates(data: Dispositivo[]): Dispositivo[] {
    return data.map(d => ({
      ...d,
      latitude: insertDecimal(d.latitude, 2),
      longitude: insertDecimal(d.longitude, 2)
    }));
  }
  
  function insertDecimal(value: string, digits: number): string {
    if (value.includes('.')) return String(value);

    const cleanValue = value.replace("-", "");
    const parts = [
      cleanValue.slice(0, digits),
      cleanValue.slice(digits)
    ].join(".");
    return (value.startsWith("-") ? "-" : "") + parts;
  }
  