from ninja import Schema
from datetime import datetime
from typing import Optional


class DepartmentOut(Schema):
    id: int
    name: str
    slug: str
    color: str


class EventOut(Schema):
    id: int
    title: str
    slug: str
    start_datetime: datetime
    end_datetime: Optional[datetime] = None
    is_all_day: bool
    location: str
    scope: str
    event_type: str
    dept_name: Optional[str] = None
    dept_color: Optional[str] = None

    @staticmethod
    def resolve_dept_name(obj):
        return obj.department.name if obj.department else None

    @staticmethod
    def resolve_dept_color(obj):
        return obj.department.color if obj.department else None
