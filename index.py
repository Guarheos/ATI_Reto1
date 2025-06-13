import http.server
import socketserver
import json
import os
import urllib.parse
from http.cookies import SimpleCookie
import sys
import io
from http.server import BaseHTTPRequestHandler

PORT = 8000

class MyRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query_params = urllib.parse.parse_qs(parsed_url.query)
        
        cookies = SimpleCookie(self.headers.get('Cookie'))
        default_lang = cookies.get('language', 'ES').value if 'language' in cookies else 'ES'
        
        if path == '/api/config':
            lang = query_params.get('lang', [default_lang])[0]
            self.serve_json_file(f'reto3/conf/config{lang}.json')
        
        elif path == '/api/dummies':
            self.serve_json_file('reto3/datos/index.json')
        
        elif path.startswith('/api/profile/'):
            parts = path.split('/')
            ci = parts[3]
            lang = query_params.get('lang', [default_lang])[0]
            self.serve_profile(ci, lang)
        
        elif path.startswith('/static/'):
            self.serve_static(path)
        
        elif path in ['/', '/index.html'] or path.startswith('/?'):
            self.serve_index(default_lang)
        
        elif path.startswith('/reto3/'):
            self.serve_file(path)
        
        else:
            self.send_error(404, f"File not found: {path}")

    def serve_json_file(self, filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(data).encode('utf-8'))
        except FileNotFoundError:
            self.send_error(404, "JSON file not found")
        except Exception as e:
            self.send_error(500, f"Server error: {str(e)}")

    def serve_profile(self, ci, lang):
        profile_path = f'reto3/{ci}/perfil.json'
        config_path = f'reto3/conf/config{lang}.json'
        
        try:
            with open(profile_path, 'r', encoding='utf-8') as f:
                profile = json.load(f)
            
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            
            combined = {
                **profile,
                "color_label": config["color"],
                "libro_label": config["libro"],
                "musica_label": config["musica"],
                "video_juego_label": config["video_juego"],
                "lenguajes_label": config["lenguajes"],
                "email_label": config["email"]
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(combined).encode('utf-8'))
        except FileNotFoundError:
            self.send_error(404, "Profile not found")
        except Exception as e:
            self.send_error(500, f"Server error: {str(e)}")

    def serve_index(self, lang):
        try:
            with open('templates/index.html', 'rb') as f:
                content = f.read()
            
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            
            if not self.headers.get('Cookie') or 'language' not in SimpleCookie(self.headers.get('Cookie')):
                self.send_header('Set-Cookie', f'language={lang}; Max-Age=31536000; Path=/')
            
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_error(404, "Index file not found")

    def serve_static(self, path):
        filepath = path[1:]  
        try:
            with open(filepath, 'rb') as f:
                content = f.read()
            
            self.send_response(200)
            
            if filepath.endswith('.css'):
                self.send_header('Content-Type', 'text/css')
            elif filepath.endswith('.js'):
                self.send_header('Content-Type', 'application/javascript')
            elif filepath.endswith('.ico'):
                self.send_header('Content-Type', 'image/x-icon')
            else:
                self.send_header('Content-Type', 'application/octet-stream')
            
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_error(404, "Static file not found")

    def serve_file(self, path):
        filepath = path[1:]  
        try:
            with open(filepath, 'rb') as f:
                content = f.read()
            
            self.send_response(200)
            
            if filepath.endswith('.png'):
                self.send_header('Content-Type', 'image/png')
            elif filepath.endswith('.jpg') or filepath.endswith('.jpeg'):
                self.send_header('Content-Type', 'image/jpeg')
            elif filepath.endswith('.json'):
                self.send_header('Content-Type', 'application/json')
            else:
                self.send_header('Content-Type', 'application/octet-stream')
                
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_error(404, "File not found")

def application(environ, start_response):
    request_method = environ['REQUEST_METHOD']
    path = environ.get('PATH_INFO', '')
    query_string = environ.get('QUERY_STRING', '')
    content_length = int(environ.get('CONTENT_LENGTH', 0))
    
    body = environ['wsgi.input'].read(content_length) if content_length > 0 else b''
    
    response_buffer = io.BytesIO()
    
    class WsgiHandler(MyRequestHandler):
        def __init__(self):
            self.request_version = 'HTTP/1.1'
            self.protocol_version = 'HTTP/1.1'
            self.server_version = BaseHTTPRequestHandler.server_version
            self.sys_version = BaseHTTPRequestHandler.sys_version
            self.close_connection = True
            
            self.requestline = f"{request_method} {path}?{query_string} HTTP/1.1"
            self.headers = self.parse_headers(environ)
            self.rfile = io.BytesIO(body)
            self.wfile = response_buffer
            self.client_address = (environ.get('REMOTE_ADDR', '0.0.0.0'), 
                                  int(environ.get('REMOTE_PORT', 0)))
            self.server = self
        
        def parse_headers(self, environ):
            headers = {}
            for key, value in environ.items():
                if key.startswith('HTTP_'):
                    header_name = key[5:].replace('_', '-').title()
                    headers[header_name] = value
                elif key in ['CONTENT_TYPE', 'CONTENT_LENGTH']:
                    header_name = key.replace('_', '-').title()
                    headers[header_name] = value
            return headers
        
        def send_response(self, code, message=None):
            self._status_code = code
            self._status_message = message or self.responses[code][0]
        
        def end_headers(self):
            pass
    
    handler = WsgiHandler()
    handler.command = request_method
    handler.path = path + ('?' + query_string if query_string else '')
    
    if request_method == 'GET':
        handler.do_GET()
    elif request_method == 'POST':
        handler.do_POST()
    
    headers = []
    if hasattr(handler, '_headers_buffer'):
        for header in handler._headers_buffer:
            if isinstance(header, tuple):
                headers.append(header)
    
    status = f"{handler._status_code} {handler._status_message}"
    response_body = response_buffer.getvalue()
    
    start_response(status, headers)
    return [response_body]

app = application

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), MyRequestHandler) as httpd:
        print(f"Serving on port {PORT}")
        httpd.serve_forever()