from typing import Optional, List, Dict, Any
from bson import ObjectId
from app.database.connection import get_database
from app.models.complaint import ComplaintInDB

class ComplaintRepository:
    def __init__(self):
        self.collection_name = "complaints"

    @property
    def collection(self):
        return get_database()[self.collection_name]

    async def create(self, complaint: ComplaintInDB) -> ComplaintInDB:
        complaint_dict = complaint.model_dump(by_alias=True)
        result = await self.collection.insert_one(complaint_dict)
        complaint_dict["_id"] = result.inserted_id
        return ComplaintInDB(**complaint_dict)

    async def get_by_id(self, complaint_id: str) -> Optional[ComplaintInDB]:
        if not ObjectId.is_valid(complaint_id):
            return None
        complaint = await self.collection.find_one({"_id": ObjectId(complaint_id)})
        if complaint:
            return ComplaintInDB(**complaint)
        return None

    async def get_all(self, skip: int = 0, limit: int = 100, filter_query: Dict[str, Any] = None) -> List[ComplaintInDB]:
        if filter_query is None:
            filter_query = {}
        cursor = self.collection.find(filter_query).sort("created_at", -1).skip(skip).limit(limit)
        complaints = []
        async for document in cursor:
            complaints.append(ComplaintInDB(**document))
        return complaints

    async def update(self, complaint_id: str, update_data: Dict[str, Any]) -> Optional[ComplaintInDB]:
        if not ObjectId.is_valid(complaint_id):
            return None
        await self.collection.update_one({"_id": ObjectId(complaint_id)}, {"$set": update_data})
        return await self.get_by_id(complaint_id)

    async def count(self, filter_query: Dict[str, Any] = None) -> int:
        if filter_query is None:
            filter_query = {}
        return await self.collection.count_documents(filter_query)

complaint_repository = ComplaintRepository()
