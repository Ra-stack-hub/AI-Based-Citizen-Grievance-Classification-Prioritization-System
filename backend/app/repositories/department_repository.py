from typing import Optional, List
from bson import ObjectId
from app.database.connection import get_database
from app.models.department import DepartmentInDB

class DepartmentRepository:
    def __init__(self):
        self.collection_name = "departments"

    @property
    def collection(self):
        return get_database()[self.collection_name]

    async def create(self, department: DepartmentInDB) -> DepartmentInDB:
        dept_dict = department.model_dump(by_alias=True)
        result = await self.collection.insert_one(dept_dict)
        dept_dict["_id"] = result.inserted_id
        return DepartmentInDB(**dept_dict)

    async def get_by_id(self, dept_id: str) -> Optional[DepartmentInDB]:
        if not ObjectId.is_valid(dept_id):
            return None
        dept = await self.collection.find_one({"_id": ObjectId(dept_id)})
        if dept:
            return DepartmentInDB(**dept)
        return None

    async def get_all(self) -> List[DepartmentInDB]:
        cursor = self.collection.find()
        departments = []
        async for document in cursor:
            departments.append(DepartmentInDB(**document))
        return departments

department_repository = DepartmentRepository()
