## Consideraciones

Debido a la naturaleza del problema, para hacer estas operaciones seguras, se deben usar transacciones. Por lo que una base de datos MySQL sería recomendable. Mongodb no fue concebido para ello inicialmente, pero actualmente existe un modo replicaSet que si que permite hacer transacciones.

## Decisioens de diseño

### Endpoints

He decidido realizar dos endpoints diferentes para separar posibles lógicas adicionales (Enviar email cuando se haya hecho una retirada, pedir código de confirmación, etc.)

Se podría unificar en uno, si se añade el amount como un string con el siguiente formato "-500" para retirada y "+500" para depósito.

### MongoDb

Utilizar el driver nativo de mongo -> evitar capa de abstraccion (mongoose)

Se ha decidido crear una instancia de cliente de clase DbDriver y con ella,
pasarsela como parametro a cada ruta. Obliga a organizar mejor el código y poder seguir el flujo desde un punto. Es decir, no lo exportas y ala, que lo use quien quiera.

Otra opción sería crear una clase con parametro cliente, y hacerlo global.

### Colecciones

Se ha decidio crear dos colecciones diferentes. Transactions y Accounts

    - Transactions:
        Almacenará todas las transacciones en el sistema.
        Para ello, hará referencia al usuario que hizo la transacción, de qué tipo, y la cantidad total.

        Alternativas:
            1.Se podría considerar hacer dos colecciones separadas, una para retiradas y otra para depósitos para que ante un aumento de los registros, disminuir el tiempo de consulta.
    - Fondos:
        Almacenará la cantidad total que tiene el usuario y a futuro se puede añadir otro tipo de información, como tipo de cuenta, permisos asociados, etc.
        Se ha deicido independizar estos datos de las transacciones ya que son datos críticos.
        {
            _id: id de usuario
            totalAmount: cantidadTotal
        }

        Además con este diseño se podría incorporar un sistema de login de usuarios.

Las cantidades se van a poner como tipo number, por simplicidad, que por defecto son 32 bits. Se podrian usar tipos como decimal128 o Int64 ya que este tipo esta pensado para sistemas monetarios como nuestro caso.

### Operaciones de depósito y retirada

Se ha decidido realizar las operaciones BD como transacciones para garantizar la atomicidad y consistencia de las operaciones bancarias. Primero, se actualizará la cantidad total del usuario. Después, se escribirá en la coleccion de transacciones. Si alguna de estas dos operaciones falla, se hace un rollback y no se escribe en BD.

### Inicialización

Como solo se va a tener un único usuario, al iniciar mongodb, creo los datos para un usuario por defecto, como he dicho antes, se podría implantar un sistema de login y esto no sería necesario por tanto.

### Problemas

Mognodb Transactions solo se pueden establecer con mongo en modo replica set.
Solucion: revertir operación si algo falla.

Mas sencillo revertir la operación de crear registro de transaccion, por lo que primero se hace esa, si la segunda falla. Se borra el registro creado.

En produccion Si que configuraría la BD en modoReplica set para garantizar alta disponibilidad ante algun error.
