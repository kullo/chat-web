#!/usr/bin/env python3
#pylint:disable=missing-docstring,invalid-name

import asyncio
import json
import websockets
import secrets
import string
import sys
import urllib

import storage

HOST = "localhost"
PORT = 8765

EVENT_LOOP = asyncio.get_event_loop()
ALL_CONNECTIONS = []

class RequestError(Exception):
    pass

async def broadcast(event, sender):
    receivers = [c for c in ALL_CONNECTIONS if c != sender]
    event_as_string = json.dumps(event)

    print("Broadcasting {} to {}".format("event", receivers))
    for connection in receivers:
        try:
            await connection.send(event_as_string)
        except websockets.exceptions.ConnectionClosed:
            pass

def generate_id(length=20):
    alphabet = string.ascii_uppercase + string.ascii_lowercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def make_response(request):
    return {
        "type": "response",
        "meta": {
            "requestId": request["id"],
            "error": None
        },
        "data": {},
    }


def key_id_to_conv_id(keyId):
    table = {}
    for permission in storage.get_all_conversation_permissions():
        table[permission["conversationKeyId"]] = permission["conversationId"]
    return table[keyId]


async def handle_request_message_new(request, sender_connection):
    message = request["data"]
    conversation_id = key_id_to_conv_id(message["context"]["conversationKeyId"])

    try:
        stored_message = storage.append_message(message, conversation_id)

        event = {
            "type": "message.added",
            "data": stored_message
        }
        await broadcast(event, sender_connection)

        response = make_response(request)
        response["data"] = stored_message
        return response
    except storage.WrongPreviousMessageIdInContext:
        raise RequestError("Message rejected")


async def handle_request_conversation_joinleave(action, user_id, request, sender_connection):
    conversation_id = request["data"]["id"]

    conversation = storage.get_conversation(conversation_id)
    if action == "join":
        conversation["participantIds"].append(user_id)
    elif action == "leave":
        conversation["participantIds"].remove(user_id)
    storage.update_conversation(conversation)

    event = {
        "type": "conversation.updated",
        "data": conversation
    }
    await broadcast(event, sender_connection)

    response = make_response(request)
    response["data"] = conversation
    return response

async def handle_request_device_get(request, sender_connection):
    device_id = request["data"]["id"]
    stored_device = storage.get_device(device_id)

    response = make_response(request)
    response["data"] = stored_device
    return response


async def handle_request_conversation_permission_get(owner_id, request, sender_connection):
    conversation_key_id = request["data"]["conversationKeyId"]

    out_permission = None
    for permission in storage.get_all_conversation_permissions():
        if permission["ownerId"] == owner_id and permission["conversationKeyId"] == conversation_key_id:
            out_permission = permission
            break

    if not out_permission:
        raise RequestError("Permission with key ID {} and owner {} not found".format(conversation_key_id, owner_id))

    response = make_response(request)
    response["data"] = out_permission
    return response


async def handle_request_user_get(request, sender_connection):
    user_id = request["data"]["id"]

    stored_user = storage.get_user(user_id)
    if not stored_user:
        raise RequestError("User with ID {} not found".format(user_id))

    response = make_response(request)
    response["data"] = stored_user
    return response


async def handle_request_attachments_new(request, sender_connection):
    response = make_response(request)
    count = request["data"]["count"]

    attachments = []
    for _ in range(count):
        attachment_id = generate_id()
        attachments.append({
            "id": attachment_id,
            "uploadUrl": "http://localhost:8000/blob/{}".format(attachment_id),
        })
    response["data"] = attachments

    return response


async def single_connection_handler(connection, path):
    identifier = hex(id(connection))
    print("+1 {} opened connection via {}".format(identifier, path))
    url = urllib.parse.urlparse(path)
    query = urllib.parse.parse_qs(url.query)
    #print(query)
    authenticated_user_id = int(query["authenticated_user_id"][0])

    ALL_CONNECTIONS.append(connection)
    try:
        async for request_as_string in connection:
            #print("< {}".format(request_as_string))
            request = json.loads(request_as_string)

            try:
                if request["type"] == "message.new":
                    response = await handle_request_message_new(request, connection)
                elif request["type"] == "device.get":
                    response = await handle_request_device_get(request, connection)
                elif request["type"] == "conversation.join":
                    response = await handle_request_conversation_joinleave("join", authenticated_user_id, request, connection)
                elif request["type"] == "conversation.leave":
                    response = await handle_request_conversation_joinleave("leave", authenticated_user_id, request, connection)
                elif request["type"] == "conversation_permission.get":
                    response = await handle_request_conversation_permission_get(authenticated_user_id, request, connection)
                elif request["type"] == "user.get":
                    response = await handle_request_user_get(request, connection)
                elif request["type"] == "attachments.new":
                    response = await handle_request_attachments_new(request, connection)
                else:
                    error_message = "Unknown request type: '{}'".format(request["type"])
                    # print(error_message)
                    raise RequestError(error_message)
            except RequestError as e:
                response = {
                    "type": "response",
                    "meta": {
                        "requestId": request["id"],
                        "error": str(e)
                    }
                }

            response_as_string = json.dumps(response)
            print("> {}".format(response_as_string))
            await connection.send(response_as_string)

    except websockets.exceptions.ConnectionClosed:
        print("-1 {} closed connection".format(identifier))
        ALL_CONNECTIONS.remove(connection)


if __name__ == "__main__":
    if not "__aiter__" in dir(websockets.WebSocketCommonProtocol):
        print("Python package websockets version >= 4 required.")
        sys.exit(1)

    print("Starting server at {}:{}".format(HOST, PORT))
    server = websockets.serve(single_connection_handler, HOST, PORT)

    EVENT_LOOP.run_until_complete(server)
    EVENT_LOOP.run_forever()
