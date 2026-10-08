from typing import Optional, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema
from datetime import datetime
from enum import Enum
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type: Any, handler: Any) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(lambda x: str(x)),
        )

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, _core_schema: core_schema.CoreSchema, handler: Any) -> JsonSchemaValue:
        return {"type": "string"}

class UserRole(str, Enum):
    CITIZEN = "citizen"
    ADMIN = "admin"
    OFFICER = "officer"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CITIZEN
    department: Optional[str] = None # For officers

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

class UserResponse(UserBase):
    id: PyObjectId = Field(alias="_id")
    created_at: datetime
    is_active: bool

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )
