from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.config import settings
from app.schemas.auth import TokenData
from app.repositories.user_repository import user_repository
from app.models.user import UserInDB, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
        
    user = await user_repository.get_by_email(email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_admin_user(current_user: UserInDB = Depends(get_current_active_user)) -> UserInDB:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="The user doesn't have enough privileges")
    return current_user

async def get_current_officer_user(current_user: UserInDB = Depends(get_current_active_user)) -> UserInDB:
    if current_user.role not in [UserRole.OFFICER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="The user doesn't have enough privileges")
    return current_user
