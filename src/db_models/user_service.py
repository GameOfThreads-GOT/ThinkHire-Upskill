from database import get_db

db = get_db()
users = db["users"]

def create_user(user_data):
    return users.insert_one(user_data).inserted_id

def get_user(query):
    return users.find_one(query)

def get_all_users():
    return list(users.find())

def update_user(query, new_data):
    return users.update_one(query, {"$set": new_data})

def delete_user(query):
    return users.delete_one(query)
