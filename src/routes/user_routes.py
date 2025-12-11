from fastapi import APIRouter, HTTPException
from db_models.user_model import UserCreate, UserLogin
from db import db
import hashlib

router = APIRouter(prefix="/api/user", tags=["User"])

users = db["users"]

@router.post("/signup")
async def signup(data: UserCreate):
    if users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="User already exists")

    # Hash the password before storing
    hashed_password = hashlib.sha256(data.password.encode()).hexdigest()
    
    user_data = data.model_dump()
    user_data["password"] = hashed_password
    
    users.insert_one(user_data)
    return {"message": "User created"}

@router.post("/login")
async def login(data: UserLogin):
    user = users.find_one({"email": data.email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Hash the provided password for comparison
    hashed_password = hashlib.sha256(data.password.encode()).hexdigest()
    
    # Check if password matches (hashed)
    if hashed_password == user["password"]:
        return {"message": "Login successful", "user": {
            "name": user["name"],
            "email": user["email"]
        }}
    
    # Backward compatibility: check if password matches (plaintext)
    if data.password == user["password"]:
        # Update user with hashed password for future logins
        users.update_one(
            {"email": data.email},
            {"$set": {"password": hashed_password}}
        )
        return {"message": "Login successful", "user": {
            "name": user["name"],
            "email": user["email"]
        }}
    
    raise HTTPException(status_code=400, detail="Incorrect password")