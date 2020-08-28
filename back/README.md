
# VenTuring backend starter

Basado en `Express` `TypeScript` y `TypeORM`.  
Incluye endpoints de auténticación a través de *JWT* y REST de usuarios con checkeo de roles.

## Inicio

    # Instalación de dependencias
    npm install
    # Script de carga inicial (usuario de prueba `admin` pass `admin`)
    npm run migration:run
    # Correr servidor de pruebas
    npm start

## Creación de base de datos y su usuario

    CREATE DATABASE gelplusfrance;
    CREATE USER 'gelplusfrance'@'localhost' IDENTIFIED BY 'gelplusfrance';
    ALTER USER 'gelplusfrance'@'localhost' IDENTIFIED WITH mysql_native_password BY 'gelplusfrance';
    GRANT ALL PRIVILEGES ON gelplusfrance.* TO 'gelplusfrance'@'localhost';

## Dependencias

- **helmet**: Nos ayuda a asegurar nuestra aplicación configurando varios headers HTTP
- **cors**: Habilitar CORS
- **body-parser**: JSON parser
- **jsonwebtoken**: Funciones para la implementación de JWT
- **bcryptjs**: Sifrado de contraseñas de usuario
- **mysql**: Base de datos
- **typeorm**: ORM que vamos a usar para manipular la base de datos
- **reflect-metadata**: Permite algunas funciones de anotaciones utilizadas con TypeORM
- **class-validator**: Un paquete de validación que funciona muy bien con TypeORM
- **ts-node-dev**: Reinicia automáticamente el servidor cuando cambiamos cualquier archivo

### Rutas

Login

    POST http://localhost:3000/auth/login
    
Cambio de contraseña

    POST http://localhost:3000/auth/change-password
    
User, Autenticación y role Admin requeridos (Authentication header)

    GET http://localhost:3000/user/
    GET http://localhost:3000/user/{id}
    POST http://localhost:3000/user/{id}
    PATCH http://localhost:3000/user/{id}
    DELETE http://localhost:3000/user/{id}


### Configuración

- Configuración aplicación `config/config.ts`
- Configuración base de datos `ormconfig.json`


## Comandos útiles

Creación de entidad

    npx typeorm entity:create -n <ClassName>

Sincronización de base de datos con definiciones en modelo

    npx typeorm schema:sync
    
Drop base de datos

    npx typeorm schema:drop
    
Clear Cache

    npx typeorm cache:clear

Creación de migración

    npx typeorm migration:create -n <ClassName>
    
Correr migraciones

    npx typeorm migration:run



## Pendientes

- [ ] Inyección de dependencias como por ejemplo servicios (*awilix*).
- [ ] Configuración por archivo .env (*dotenv*) para la configuración de aplicación y TypeORM.
- [ ] Crear configuración PM2 para producción y formato de logs. 
- [ ] Validación de parámetros recibidos por las APIs (*express-validation* y *express-validator*).