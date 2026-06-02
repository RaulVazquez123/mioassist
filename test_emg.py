import asyncio
import json
import websockets
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

REPOSO   = {"izq": {"click": 0, "rms": 50, "mnf": 80, "conectado": 1}, "der": {"click": 0, "rms": 50, "mnf": 80, "conectado": 1}}
DERECHA  = {"izq": {"click": 0, "rms": 50, "mnf": 80, "conectado": 1}, "der": {"click": 1, "rms": 200, "mnf": 80, "conectado": 1}}
IZQUIERDA = {"izq": {"click": 1, "rms": 200, "mnf": 80, "conectado": 1}, "der": {"click": 0, "rms": 50, "mnf": 80, "conectado": 1}}

clientes = set()
loop_global = None

async def enviar_a_todos(msg):
    if clientes:
        await asyncio.gather(*[ws.send(json.dumps(msg)) for ws in clientes])

class Botones(BaseHTTPRequestHandler):
    def log_message(self, format, *args): pass

    def do_GET(self):
        if self.path == "/d":
            print("  → DERECHA")
            asyncio.run_coroutine_threadsafe(enviar_a_todos(DERECHA), loop_global)
            await_reset()
        elif self.path == "/i":
            print("  → IZQUIERDA")
            asyncio.run_coroutine_threadsafe(enviar_a_todos(IZQUIERDA), loop_global)
            await_reset()
        elif self.path == "/desconectar_izq":
            print("  → ELECTRODO IZQUIERDO DESCONECTADO")
            msg = {"izq": {"click": 0, "rms": 0, "mnf": 0, "conectado": 0}, "der": {"click": 0, "rms": 50, "mnf": 80, "conectado": 1}}
            asyncio.run_coroutine_threadsafe(enviar_a_todos(msg), loop_global)
        elif self.path == "/desconectar_der":
            print("  → ELECTRODO DERECHO DESCONECTADO")
            msg = {"izq": {"click": 0, "rms": 50, "mnf": 80, "conectado": 1}, "der": {"click": 0, "rms": 0, "mnf": 0, "conectado": 0}}
            asyncio.run_coroutine_threadsafe(enviar_a_todos(msg), loop_global)
        elif self.path == "/reconectar":
            print("  → RECONECTADO TODO")
            asyncio.run_coroutine_threadsafe(enviar_a_todos(REPOSO), loop_global)
        else:
            html = """<!DOCTYPE html>
<html>
<head>
  <title>EMG Test</title>
  <style>
    body { font-family: sans-serif; display: flex; flex-direction: column;
           align-items: center; justify-content: center; min-height: 100vh;
           background: #0f172a; color: white; gap: 24px; padding: 40px; }
    h2 { margin: 0; }
    .btns { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }
    button { padding: 24px 48px; font-size: 20px; font-weight: bold;
             border: none; border-radius: 16px; cursor: pointer; }
    .d { background: #3b82f6; color: white; }
    .i { background: #10b981; color: white; }
    .warn { background: #ef4444; color: white; font-size: 15px; padding: 14px 28px; }
    .ok { background: #22c55e; color: white; font-size: 15px; padding: 14px 28px; }
    button:active { opacity: 0.7; }
    p { color: #94a3b8; font-size: 14px; text-align: center; }
    hr { border-color: #334155; width: 100%; }
  </style>
</head>
<body>
  <h2>EMG Simulator</h2>
  <div class="btns">
    <button class="d" onclick="fetch('/d')">DERECHA<br><small>bajar fila / mover col</small></button>
    <button class="i" onclick="fetch('/i')">IZQUIERDA<br><small>bloquear / seleccionar</small></button>
  </div>
  <hr/>
  <p>Prueba de electrodos:</p>
  <div class="btns">
    <button class="warn" onclick="fetch('/desconectar_izq')">⚠️ Desconectar izquierdo</button>
    <button class="warn" onclick="fetch('/desconectar_der')">⚠️ Desconectar derecho</button>
    <button class="ok" onclick="fetch('/reconectar')">✅ Reconectar todo</button>
  </div>
  <p>Abre MioAssist en otra pestaña</p>
</body>
</html>"""
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(html.encode())
            return

        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"ok")

def await_reset():
    import time
    time.sleep(0.5)
    asyncio.run_coroutine_threadsafe(enviar_a_todos(REPOSO), loop_global)

async def ws_handler(ws):
    clientes.add(ws)
    print(f"✅ Web conectada ({len(clientes)} cliente(s))")
    # Manda reposo inmediatamente para que el contexto tenga datos
    await ws.send(json.dumps(REPOSO))
    try:
        await ws.wait_closed()
    finally:
        clientes.discard(ws)

async def main():
    global loop_global
    loop_global = asyncio.get_event_loop()

    http = HTTPServer(("localhost", 8082), Botones)
    t = threading.Thread(target=http.serve_forever, daemon=True)
    t.start()

    print("🚀 Listo!")
    print("   WebSocket: ws://localhost:8081")
    print("   Botones:   http://localhost:8082\n")

    async with websockets.serve(ws_handler, "localhost", 8081):
        await asyncio.Future()

asyncio.run(main())