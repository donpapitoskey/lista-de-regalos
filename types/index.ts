export interface Regalo {
  id: number;
  nombre: string;
  url?: string;
  url_imagen?: string;
  lugarCompra?: string;
  tomado: boolean;
}

export interface Persona {
  id: number;
  nombre: string;
  regalos: Regalo[];
}
