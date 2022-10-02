# Comando

Para iniciar el sistema. Debe ejecutar el siguiente comando:
`sudo docker compose up -d --build`

He creado una pequeña interfaz para realizar las operaciones requeridas.
Una vez se haya iniciado el servicio.
Se debe ir al navegador a la ruta:

`localhost:3000`

# Notas desarrollo

## Consideraciones

Debido a la naturaleza del problema, para hacer estas operaciones seguras, se podrían usar transacciones. Por lo que una base de datos relacional sería recomendable. Mongodb no fue concebido para ello inicialmente, pero actualmente tiene el modo replicaSet que si que permite hacer transacciones. (Que en mi día a día si utilizo). He elegido mongodb ya ue tiene un modelo de datos flexible y muy escalable. A futuro esto es una ventaja.

## Decisioens de diseño

Con vista al futuro de la aplicacion, he pensado generalizar más el ejercicio, teniendo en cuenta de que el cajero lo puedan utilizar diferentes usuarios y no solo uno, por lo que el diseño se ha basado en esa premisa. Un usuario inicia sesión, y obtiene sus datos.

### Endpoints

Con motivo de la decision tomada anteriormente, se ha añadido el parametro userId a las rutas, correspondiente al id de usuario que ha iniciado sesión.

He decidido realizar dos endpoints diferentes para separar posibles lógicas adicionales (Enviar email cuando se haya hecho una retirada, pedir código de confirmación, etc.). Se podría unificar en uno, por ejemplo, si se añade el amount como un string con el siguiente formato "-500" para retirada y "+500" para depósito. Pero a futurio se perdería la ventaja anteriormente comentada.

Se ha realizado una validacion que verifica:

1. Cantidad mínima de operación es 1 centimo
2. Los datos son del tipo esperado.
3. El dato puede tener muchos decimales. Coger los dos primeros. (En frontend tambien se ha limitado)
   Se ha evitado utilizar la funcion ParseFloat ya que con un dato de mas de dos decimales haría un redondeo. ej 0.056 -> 0.6
   He querido evitar esta situación.

### MongoDb

Diferentes opciones de MongoDb para node (Mongoose, driver nativo...)
Utilizar el driver nativo de mongo -> evitar capa de abstraccion (mongoose)

Se ha decidido crear una instancia de cliente MongoDb y con ella,
pasarsela como parametro a cada ruta. Obliga a organizar mejor el código y poder seguir el flujo desde un punto y que haya trazabilidad. Es decir, no lo exportas y ala, que lo use quien quiera.

Otra opción sería crear el cliente, y exportarlo globalmente.

### Colecciones

Se ha decidio crear dos colecciones diferentes. Transactions y Accounts

    - Transactions:
        Almacenará todas las transacciones en el sistema.
        Para ello, hará referencia al usuario que hizo la transacción, de qué tipo, y la cantidad total.
        {
            _id: id transaccion
            userId: id de usuario
            date: fecha de la transaccion
            type: tipo de la transaccion (deposit o withdrawal) (Ayuda a hacer querys filtrando por ello)
            amount: Cantidad de la transaccion
            balance: balance resultante de la transaccion
        }

        Alternativas:
            1.Se podría considerar hacer dos colecciones separadas, una para retiradas y otra para depósitos para que ante un aumento de los registros, disminuir el tiempo de consulta.
            2.Existe el tipo Decimal128 para mayor precision de los decimales, perfecto para datos monetarios, pero por simplicidad, se ha utilizado el tipo Double, que utiliza 8bytes.

    - Accounts:
        Almacenará la cantidad total que tiene el usuario y a futuro se puede añadir otro tipo de información, como tipo de cuenta, permisos asociados, etc.
        Se ha deicido independizar estos datos de las transacciones ya que son datos críticos.
        {
            _id: id de usuario
            balance: fondos totales del usuario
        }

        Además con este diseño se podría incorporar un sistema de login de usuarios.
        Las consultas más comunes serían:
            - Obtener todas transacciones de un usuario
            - Obtener todas retiradas de un usuario

Las cantidades se van a poner como tipo number, por simplicidad, que por defecto son 32 bits. Se podrian usar tipos como decimal128 o Int64 ya que este tipo esta pensado para sistemas monetarios como nuestro caso.

### Operaciones de depósito y retirada

<!-- Se ha decidido realizar las operaciones BD como transacciones para garantizar la atomicidad y consistencia de las operaciones bancarias. Primero, se actualizará la cantidad total del usuario. Después, se escribirá en la coleccion de transacciones. Si alguna de estas dos operaciones falla, se hace un rollback y no se escribe en BD. -->

Se ha intentado utilizar las menores operaciones sobre BD para evitar sobre carga, por ejemplo con el findOneAndUpdate, en vez de hacer un find, comprobar condiciones y actualizar. De esta manera nos evitamos posibles inconsistencias en los datos ya que mientras hacemos la comprobacion desde codigo, el dato en BD podría cambiarse.

### Inicialización

Como solo se va a tener un único usuario, al iniciar mongodb, creo los datos para un usuario por defecto, como he dicho antes, se podría implantar un sistema de login.

### Problemas

Mognodb Transactions solo se pueden establecer con mongo en modo replica set.
Solucion: revertir operación si algo falla.

Mas sencillo revertir la operación de crear registro de transaccion, por lo que primero se hace esa, si la segunda falla. Se borra el registro creado.

En produccion Si que configuraría la BD en modoReplica set para garantizar alta disponibilidad ante algun error.

### Frontend

Se ha realizado un frontend simple para probar el sistema realizado.
