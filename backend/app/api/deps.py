from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.config import settings
from app.database.connection import get_database
from app.models.user import UserInDB, UserRole
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    db = get_database()
    
    # Handle mixed data types (str or ObjectId) in the DB due to Pydantic serialization
    try:
        user_doc = await db.users.find_one({"_id": {"$in": [ObjectId(user_id), user_id]}})
    except:
        user_doc = await db.users.find_one({"_id": user_id})
    
    if user_doc is None:
        raise credentials_exception
        
    return UserInDB(**user_doc)

async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_admin_user(current_user: UserInDB = Depends(get_current_active_user)) -> UserInDB:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return current_user

async def get_current_officer_user(current_user: UserInDB = Depends(get_current_active_user)) -> UserInDB:
    if current_user.role not in [UserRole.ADMIN, UserRole.OFFICER]:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return current_user
