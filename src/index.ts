import app from "./app";

import { initializeDatabase } from "./db/conexion";

const port = parseInt(process.env.PORT || '6505', 10);
const host = process.env.HOST || '0.0.0.0';

async function main(){
    try{
        await initializeDatabase();
        console.log('conectado a la base de datos');

        app.listen(port, host, ()=>{
            console.log(`Servidor OK en puerto ${port}`);
        });
    }catch(err: unknown){
        if(err instanceof Error){
            console.log('Error al conectarse a la base de datos: ', err.message);
        }
    }
}

main();