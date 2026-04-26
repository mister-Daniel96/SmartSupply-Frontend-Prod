import { Usuario } from "./usuario";

export class Soporte {
  idSoporte: number = 0;
  fechaSoporte:Date=new Date();
  tituloSoporte:string='';
  descripcionSoporte:string='';
  pendienteSoporte:boolean=true;
  usuario:Usuario=new Usuario();
}
