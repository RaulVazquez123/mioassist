# test_emg.py
# Servidor dual: WebSocket (para la web) + HTTP (para los botones)
# Abre http://localhost:8082 en el navegador para ver los botones D e I

import asyncio
import json
import websockets
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

REPOSO   = {"izq": {"click": 0, "conectado": 1}, "der": {"click": 0, "conectado": 1}}
DERECHA  = {"izq": {"click": 0, "conectado": 1}, "der": {"click": 1, "conectado": 1}}
IZQUIERDA = {"izq": {"click": 1, "conectado": 1}, "der": {"click": 0, "conectado": 1}}

clientes = set()

async def enviar_a_todos(msg):
    if clientes:
        await asyncio.gather(*[ws.send(json.dumps(msg)) for ws in clientes])
        await asyncio.sleep(0.15)
        await asyncio.gather(*[ws.send(json.dumps(REPOSO)) for ws in clientes])

loop_global = None

class Botones(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # silenciar logs HTTP

    def do_GET(self):
        if self.path == "/d":
            print("  → DERECHA")
            asyncio.run_coroutine_threadsafe(enviar_a_todos(DERECHA), loop_global)
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"ok")
        elif self.path == "/i":
            print("  → IZQUIERDA")
            asyncio.run_coroutine_threadsafe(enviar_a_todos(IZQUIERDA), loop_global)
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"ok")
        else:
            # Página con botones
            html = """<!DOCTYPE html>
<html>
<head>
  <title>EMG Test</title>
  <style>
    body { font-family: sans-serif; display: flex; flex-direction: column;
           align-items: center; justify-content: center; height: 100vh;
           background: #0f172a; color: white; gap: 24px; }
    h2 { margin: 0; }
    .btns { display: flex; gap: 20px; }
    button { padding: 24px 48px; font-size: 24px; font-weight: bold;
             border: none; border-radius: 16px; cursor: pointer; }
    .d { background: #3b82f6; color: white; }
    .i { background: #10b981; color: white; }
    button:active { opacity: 0.7; }
    p { color: #94a3b8; font-size: 14px; text-align: center; }
  </style>
</head>
<body>
  <h2>EMG Simulator</h2>
  <div class="btns">
    <button class="d" onclick="fetch('/d')">DERECHA<br><small>bajar fila / mover col</small></button>
    <button class="i" onclick="fetch('/i')">IZQUIERDA<br><small>bloquear / seleccionar</small></button>
  </div>
  <p>Abre MioAssist en otra pestaña y presiona los botones aquí</p>
</body>
</html>"""
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(html.encode())

async def ws_handler(ws):
    clientes.add(ws)
    print(f"✅ Web conectada ({len(clientes)} cliente(s))")
    try:
        await ws.wait_closed()
    finally:
        clientes.discard(ws)

async def main():
    global loop_global
    loop_global = asyncio.get_event_loop()

    # Servidor HTTP en hilo separado
    http = HTTPServer(("localhost", 8082), Botones)
    t = threading.Thread(target=http.serve_forever, daemon=True)
    t.start()

    print("🚀 Listo!")
    print("   WebSocket: ws://localhost:8081  (para MioAssist)")
    print("   Botones:   http://localhost:8082  (ábrelo en el navegador)\n")

    async with websockets.serve(ws_handler, "localhost", 8081):
        await asyncio.Future()

asyncio.run(main())