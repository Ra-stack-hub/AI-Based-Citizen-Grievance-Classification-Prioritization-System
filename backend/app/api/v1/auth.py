from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.database.connection import get_database
from app.core.security import verify_password, get_password_hash, create_access_token
from app.api.deps import get_current_active_user
from app.models.user import UserCreate, UserResponse, UserInDB
from pydantic import BaseModel

router = APIRouter()

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

@router.post("/register", response_model=UserResponse)
async def register_user(user_in: UserCreate):
    db = get_database()
    
    # Check if user already exists
    user = await db.users.find_one({"email": user_in.email})
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )
    
    # Hash password
    hashed_password = get_password_hash(user_in.password)
    user_db = UserInDB(
        **user_in.dict(exclude={"password"}), 
        hashed_password=hashed_password
    )
    
    # Insert to DB
    result = await db.users.insert_one(user_db.dict(by_alias=True))
    user_db.id = result.inserted_id
    
    return user_db

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_database()
    user = await db.users.find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=str(user["_id"]))
    return {"access_token": access_token, "token_type": "bearer", "role": user.get("role", "citizen")}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserInDB = Depends(get_current_active_user)):
    return current_user
