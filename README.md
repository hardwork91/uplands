# Uplands

Puzzle isométrico de islas flotantes. Recoge todas las gemas del nivel moviéndote en 4 direcciones;
cada casilla se cae cuando la dejas sin gemas, así que no hay vuelta atrás.

Todo el juego vive en un solo archivo, `index.html` (Three.js 0.128 desde CDN, sonido sintetizado con Web Audio).
Para jugar, abre `index.html` en el navegador o sírvelo con cualquier servidor estático:

```bash
npx serve .
```

## Reglas

- Te mueves arriba, abajo, izquierda o derecha (nunca en diagonal).
- Cada casilla tiene un número de **pasos**: cada vez que entras gastas uno, y al salir de una casilla sin pasos, cae.
  Las casillas de varios pasos se ven más oscuras y con losas apiladas (una por cada paso de más).
- Cada casilla lleva como máximo **1 bidón de combustible**, que se recoge la primera vez que la pisas.
- La casilla de inicio se cae en cuanto sales de ella.
- No puedes moverte hacia un hueco. Si te quedas sin movimientos, reinicias.
- Llenas el tanque (ganas) al recoger todos los bidones.

## Tipos de casilla

| Ficha | Casilla | Comportamiento |
|---|---|---|
| `S` | Inicio | Sin bidón; se cae al salir |
| `1`–`9` | Normal | Con bidón y ese número de pasos. Las de 2 o más solo aparecen en cruces |
| `.` | Hueco | No existe |
| `^ v < >` | Sentido único | 1 paso, sin bidón. Solo se entra moviéndose en la dirección de la flecha; vallas en los otros lados |
| `+` / `+2` | Hielo | 1 o 2 pasos. Resbalas a la casilla siguiente; si detrás hay un hueco, caes |
| `a`, `b` | Portal | Entras por uno y sales por el de su mismo color; ambos desaparecen |
| `K1` | Interruptor | 1 paso, sin bidón. Al pisarlo baja todas las barreras de su color |
| `L1` | Barrera | 1 paso, con bidón. Cerrada hasta pulsar su interruptor |

## Estrellas, monedas y potenciadores

- Cada nivel tiene hasta 3 estrellas con tiempo propio, que empieza con el primer movimiento.
  Si una se apaga, pasa a ser gema normal.
- Monedas: 5 por pasar un nivel por primera vez, 10 por cada estrella nueva y 25 por cada logro oculto.
  Repetir un nivel solo paga las estrellas que mejoran tu récord.
- Potenciadores (el primer uso de cada uno es gratis):
  - **Pista** (15): ilumina los movimientos que aún llevan a una solución.
  - **Deshacer** (40): vuelve un movimiento atrás.
  - **Cámara lenta** (20): el mundo va a mitad de velocidad durante 15 s.

## Controles

| Acción | Teclado | Táctil / ratón |
|---|---|---|
| Moverse | Flechas o WASD | Deslizar, tocar casilla vecina o botones diagonales |
| Reiniciar | R | Botón Reiniciar |
| Pista | H | Botón Pista |
| Deshacer | U | Botón Deshacer |
| Cámara lenta | L | Botón Lento |
| Sonido (todo / efectos / silencio) | M | Botón Sonido |

## Herramientas de niveles (`tools/`)

Requieren Node.js.

```bash
node tools/check-levels.js
```

Comprueba que cada nivel de `index.html` tiene solución y cuenta soluciones y callejones sin salida.

```bash
node tools/stars.js
```

Propone la posición y el tiempo de las 3 estrellas de cada nivel, siguiendo su solución.

```bash
node tools/generate.js '{"W":6,"H":6,"len":[20,24],"maxV":2,"ice":1,"portal":1,"key":1,"locksPerKey":1,"oneway":1,"twos":2}' 7
```

Genera niveles candidatos a partir de un recorrido válido y los ordena por dificultad (menos soluciones y más callejones primero).
