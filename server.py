import http.server
import socketserver
import socket
import sys

PORT = 8080

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

# Force IPv4 binding explicitly
class HTTPServerV4(socketserver.TCPServer):
    address_family = socket.AF_INET
    allow_reuse_address = True

print(f"Server script starting...", flush=True)

try:
    # Bind to '' (all IPv4 interfaces) on port 8080
    with HTTPServerV4(("", PORT), CORSHTTPRequestHandler) as httpd:
        print(f"Serving HTTP on 127.0.0.1 port {PORT} (http://127.0.0.1:{PORT}/) ...", flush=True)
        sys.stdout.flush()
        httpd.serve_forever()
except Exception as e:
    print(f"Server error: {e}", file=sys.stderr, flush=True)
    sys.exit(1)
