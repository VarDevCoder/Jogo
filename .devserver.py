"""Dev server con Cache-Control: no-store para forzar fresh loads en cada request.
Uso: python .devserver.py [PORT]  (PORT default 8000)
"""
import sys
from http.server import SimpleHTTPRequestHandler, HTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def send_my_headers(self):
        # estos se envian antes del end_headers()
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")

    def end_headers(self):
        self.send_my_headers()
        SimpleHTTPRequestHandler.end_headers(self)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f"Dev server (no-cache) on http://127.0.0.1:{port}", flush=True)
    HTTPServer(("127.0.0.1", port), NoCacheHandler).serve_forever()
