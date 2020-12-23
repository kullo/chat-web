#pylint:disable=missing-docstring,invalid-name
import copy
import datetime
import json
import os

DATABASE_DIR = "database_dir"
DATABASE_FILE_CONVERSATIONS = os.path.join(DATABASE_DIR, "conversations.json")
DATABASE_FILE_CONVERSATION_PERMISSIONS = os.path.join(DATABASE_DIR, "conversation_permissions.json")
DATABASE_FILE_DEVICES = os.path.join(DATABASE_DIR, "devices.json")
DATABASE_FILE_MESSAGES = os.path.join(DATABASE_DIR, "messages_{}.json")
DATABASE_FILE_USERS = os.path.join(DATABASE_DIR, "users.json")

class WrongPreviousMessageIdInContext(Exception):
    pass

class UserAlreadyExists(Exception):
    pass

def create_messages_file(conversation_id):
    with open(DATABASE_FILE_MESSAGES.format(conversation_id), "w") as f:
        doc = []
        f.write(json.dumps(doc, indent=2))
        f.flush()

def get_latest_message(conversation_id):
    with open(DATABASE_FILE_MESSAGES.format(conversation_id), "r") as f:
        doc = json.load(f)
        if doc:
            return doc[-1]
        else:
            return None

def get_all_messages(conversation_id):
    with open(DATABASE_FILE_MESSAGES.format(conversation_id), "r") as f:
        doc = json.load(f)
        return doc

def get_all_conversation_permissions():
    with open(DATABASE_FILE_CONVERSATION_PERMISSIONS, "r") as f:
        doc = json.load(f)
        return doc

def get_all_conversations():
    with open(DATABASE_FILE_CONVERSATIONS, "r") as f:
        doc = json.load(f)
        return doc

def get_conversation(conversation_id):
    with open(DATABASE_FILE_CONVERSATIONS, "r") as f:
        doc = json.load(f)
        for conversation in doc:
            if conversation["id"] == conversation_id:
                return conversation
        return None

def update_conversation(conversation):
    with open(DATABASE_FILE_CONVERSATIONS, "r+") as f:
        doc = json.load(f)
        for index, item in enumerate(doc):
            if item["id"] == conversation["id"]:
                doc[index] = conversation
                f.seek(0)
                f.truncate()
                f.write(json.dumps(doc, indent=2, sort_keys=True))
                f.flush()
                return
        raise Exception("Conversation to update not found.")

def get_all_devices():
    with open(DATABASE_FILE_DEVICES, "r") as f:
        doc = json.load(f)
        return doc

def get_device(device_id):
    with open(DATABASE_FILE_DEVICES, "r") as f:
        doc = json.load(f)
        return doc[device_id]

def get_all_users():
    with open(DATABASE_FILE_USERS, "r") as f:
        doc = json.load(f)
        return doc

def get_user(user_id):
    with open(DATABASE_FILE_USERS, "r") as f:
        doc = json.load(f)
        for user in doc:
            if user["id"] == user_id:
                return user
        return None

def find_user(email):
    with open(DATABASE_FILE_USERS, "r") as f:
        doc = json.load(f)
        for user in doc:
            if user["email"] == email:
                return user
        return None

def find_user_by_login_key(login_key):
    with open(DATABASE_FILE_USERS, "r") as f:
        doc = json.load(f)
        for user in doc:
            if user["loginKey"] == login_key:
                return user
        return None

def append_user(user):
    new_user = copy.deepcopy(user)
    with open(DATABASE_FILE_USERS, "r+") as f:
        doc = json.load(f)

        for u in doc:
            if u["email"] == new_user['email']:
                raise UserAlreadyExists()

        if doc:
            max_id = max([u["id"] for u in doc])
        else:
            max_id = 0

        new_user["id"] = max_id + 1
        if not "picture" in new_user:
            new_user["picture"] = None
        doc.append(new_user)

        f.seek(0)
        f.truncate()
        f.write(json.dumps(doc, indent=2, sort_keys=True))
        f.flush()
        return new_user

def append_device(device):
    new_device = copy.deepcopy(device)
    new_device["state"] = "active"
    with open(DATABASE_FILE_DEVICES, "r+") as f:
        doc = json.load(f)

        device_id = device["id"]
        doc[device_id] = new_device

        f.seek(0)
        f.truncate()
        f.write(json.dumps(doc, indent=2))
        f.flush()
        return new_device

def append_conversation(conversation):
    with open(DATABASE_FILE_CONVERSATIONS, "r+") as f:
        doc = json.load(f)

        doc.append(conversation)

        f.seek(0)
        f.truncate()
        f.write(json.dumps(doc, indent=2))
        f.flush()

def append_conversation_permission(permission):
    with open(DATABASE_FILE_CONVERSATION_PERMISSIONS, "r+") as f:
        doc = json.load(f)

        doc.append(permission)

        f.seek(0)
        f.truncate()
        f.write(json.dumps(doc, indent=2))
        f.flush()

def rfc3339_now():
    tz = datetime.timezone.utc
    return datetime.datetime.now(tz).isoformat(timespec='milliseconds')

def assign_id_and_time_to_server_message(server_message, identifier):
    server_message["id"] = identifier
    server_message["timeSent"] = rfc3339_now()

def append_message(new_message, conversation_id):
    with open(DATABASE_FILE_MESSAGES.format(conversation_id), "r+") as f:
        doc = json.load(f)

        previous_message_id = doc[-1]["id"] if doc else 0
        try:
            context = new_message["context"]
            if previous_message_id != context["previousMessageId"]:
                raise WrongPreviousMessageIdInContext()
        except KeyError:
            raise WrongPreviousMessageIdInContext()

        new_id = previous_message_id + 1
        assign_id_and_time_to_server_message(new_message, new_id)

        doc.append(new_message)

        f.seek(0)
        f.truncate()
        f.write(json.dumps(doc, indent=2))
        f.flush()

        return doc[-1]
