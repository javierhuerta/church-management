from ninja import Router
from django.utils import timezone
from .models import Event
from .schemas import EventOut

router = Router()


@router.get("/upcoming", response=list[EventOut])
def upcoming_events(request, limit: int = 10):
    """Próximos eventos publicados."""
    today = timezone.now().date()
    return (
        Event.objects.filter(start_datetime__date__gte=today, is_published=True)
        .select_related("department")
        .order_by("start_datetime")[:limit]
    )
