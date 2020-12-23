#!/usr/bin/python3
#pylint:disable=missing-docstring

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
import re
import socketserver
import urllib

import storage

GET_DEVICE_MATCHER = re.compile('^/devices/([a-f0-9]+)$')
GET_CONVERSATION_MESSAGES_MATCHER = re.compile('^/conversations/([a-f0-9]+)/messages$')
GET_BLOB_MATCHER = re.compile('^/blob/([a-zA-Z0-9]+)$')
PUT_BLOB_MATCHER = re.compile('^/blob/([a-zA-Z0-9]+)$')
PAGE_SIZE_MESSAGES = 25
BLOB_DIR="blob_dir"

def key_id_to_conv_id(keyId):
    table = {}
    for permission in storage.get_all_conversation_permissions():
        table[permission["conversationKeyId"]] = permission["conversationId"]
    return table[keyId]

class MyRequestHandler(BaseHTTPRequestHandler):
    def authorization_params(self):
        authorization_header = self.headers.get('Authorization')
        if authorization_header:
            params_matcher = re.compile(r'(\w+)= ?"([^"]+)"')
            authorization_header = authorization_header.replace("KULLO_V1", "").strip()
            params = dict(params_matcher.findall(authorization_header))
            return params
        else:
            return None

    def authenticated_user_id(self):
        params = self.authorization_params()
        device_id = params["deviceId"]
        device = storage.get_device(device_id)
        # TODO: use device's pubkey to verify signature
        # TODO: check loginKey
        user_id = device["ownerId"]
        return user_id

    def do_GET(self): #pylint:disable=invalid-name
        parts = self.path.split("?")
        path = parts[0]
        query = urllib.parse.parse_qs(parts[1]) if len(parts) > 1 else None

        #print("Authenticated user:", self.authenticated_user_id())

        match = GET_CONVERSATION_MESSAGES_MATCHER.match(path)
        if match:
            conversation_id = match.group(1)
            try:
                possible_messages = storage.get_all_messages(conversation_id)
                if query and query["cursor"]:
                    upper_id_limit = int(query["cursor"][0])
                    possible_messages = [m for m in possible_messages if m["id"] < upper_id_limit]

                messages_for_this_page = possible_messages[-PAGE_SIZE_MESSAGES:]

                if len(messages_for_this_page) < len(possible_messages):
                    # more messages available
                    earliest_delivered_id = messages_for_this_page[0]["id"]
                    next_cursor = str(earliest_delivered_id)
                else:
                    next_cursor = None

                out = {
                    "objects": list(reversed(messages_for_this_page)),
                    "meta": {
                        "nextCursor": next_cursor,
                    },
                }
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(out, indent=2).encode())
                return
            except FileNotFoundError:
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                return

        if path == "/conversations":
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            conversations = storage.get_all_conversations()
            permissions = storage.get_all_conversation_permissions()
            out = {
                "objects": conversations,
                "related": {
                    "permissions": permissions,
                },
                "meta": {
                    "nextCursor": None,
                },
            }
            self.wfile.write(json.dumps(out, indent=2).encode())
            return

        if path == "/conversation_permissions":
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            conversation_permissions = storage.get_all_conversation_permissions()
            out = {
                "objects": conversation_permissions,
                "meta": {
                    "nextCursor": None,
                },
            }
            self.wfile.write(json.dumps(out, indent=2).encode())
            return

        # Undocumented debugging endpoint
        if path == "/devices":
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            devices = storage.get_all_devices()
            self.wfile.write(json.dumps(devices, indent=2).encode())
            return

        match = GET_DEVICE_MATCHER.match(path)
        if match:
            device_id = match.group(1)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            out = storage.get_device(device_id)
            self.wfile.write(json.dumps(out, indent=2).encode())
            return

        if path == "/users":
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            users = storage.get_all_users()
            out = {
               "objects": users,
                "meta": {
                    "nextCursor": None,
                },
            }
            self.wfile.write(json.dumps(out, indent=2).encode())
            return

        match = GET_BLOB_MATCHER.match(path)
        if match:
            filename = match.group(1)
            try:
                with open(os.path.join(BLOB_DIR, "{}.bin".format(filename)), 'rb') as f:
                    self.send_response(200)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Content-Type', 'application/octet-stream')
                    self.end_headers()
                    self.wfile.write(f.read())
            except FileNotFoundError:
                self.send_response(404)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
            return

        self.send_response(404)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

    def do_POST(self): #pylint:disable=invalid-name
        content_len = int(self.headers.get('content-length', 0))
        post_body = self.rfile.read(content_len)

        if self.path == "/messages":
            try:
                server_message = json.loads(post_body)
                conversation_id = key_id_to_conv_id(server_message["context"]["conversationKeyId"])
                stored_message = storage.append_message(server_message, conversation_id)
                self.send_response(201)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(stored_message, indent=2).encode())
            except storage.WrongPreviousMessageIdInContext:
                print("Wrong previous message id in context")
                self.send_response(412) # Precondition Failed
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
        elif self.path == "/users/get_me":
            data = json.loads(post_body)
            email = data["email"]
            user = storage.find_user(email)
            if user:
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                out = {
                    "user": {
                        "id": user["id"],
                        "name": user["name"],
                        "picture": user["picture"],
                        "encryptionPubkey": user["encryptionPubkey"],
                    },
                    "encryptionPrivkey": user["encryptionPrivkey"],
                }
                self.wfile.write(json.dumps(out, indent=2).encode())
            else:
                self.send_response(403)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
        elif self.path == "/users":
            data = json.loads(post_body)
            try:
                new_user = storage.append_user(data)
                response_body = {
                    "verificationCode": "music pear battery t-shirt",
                    "user": {
                        "id": new_user["id"],
                        "name": new_user["name"],
                        "email": new_user["email"],
                        "picture": new_user["picture"],
                        "encryptionPubkey": new_user["encryptionPubkey"],
                    }
                }
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response_body, indent=2).encode())
            except storage.UserAlreadyExists:
                self.send_response(409)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
        elif self.path == "/conversations":
            data = json.loads(post_body)
            conversation = data["conversation"]
            permissions = data["permissions"]
            storage.create_messages_file(conversation["id"])
            storage.append_conversation(conversation)
            for permission in permissions:
                storage.append_conversation_permission(permission)
            self.send_response(204)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
        elif self.path == "/devices":
            data = json.loads(post_body)
            new_device = storage.append_device(data["device"])
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(new_device, indent=2).encode())
        elif self.path == "/ws_urls":
            user_id = self.authenticated_user_id()
            url = "ws://localhost:8765/chat_socket?authenticated_user_id={}".format(
                user_id
            )
            out = {
                "socketUrl": url
            }
            self.send_response(201)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(out, indent=2).encode())
        else:
            self.send_response(404)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

    def do_PUT(self): #pylint:disable=invalid-name
        parts = self.path.split("?")
        path = parts[0]
        query = urllib.parse.parse_qs(parts[1]) if len(parts) > 1 else None

        match = PUT_BLOB_MATCHER.match(path)
        if match:
            filename = match.group(1)
            content_len = int(self.headers.get('content-length', 0))
            body = self.rfile.read(content_len)
            with open(os.path.join(BLOB_DIR, "{}.bin".format(filename)), "wb") as f:
                f.write(body)
            self.send_response(204)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
        else:
            self.send_response(404)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

    def do_OPTIONS(self): #pylint:disable=invalid-name
        # required for pre-flight requests Cross-Origin Resource Sharing (CORS)
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

class ThreadedHTTPServer(socketserver.ThreadingMixIn, HTTPServer):
    """Handle requests in a separate thread."""

def run():
    server_address = ('', 8000)
    print("Starting server at {}:{}".format(server_address[0], server_address[1]))
    httpd = ThreadedHTTPServer(server_address, MyRequestHandler)
    httpd.serve_forever()

if __name__ == "__main__":
    run()
