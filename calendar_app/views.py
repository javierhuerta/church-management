import calendar
from datetime import date, datetime

from django.contrib.admin.views.decorators import staff_member_required
from django.contrib import messages
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from django.utils.text import slugify
from django.core.paginator import Paginator
from django.views.decorators.http import require_POST

from .models import Department, Event, Responsible


# Nombres de meses en español
MONTH_NAMES = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']


def calendar_view(request):
    today = date.today()

    try:
        year = int(request.GET.get('year', today.year))
        month = int(request.GET.get('month', today.month))
    except ValueError:
        year, month = today.year, today.month

    if month < 1:
        month, year = 12, year - 1
    elif month > 12:
        month, year = 1, year + 1

    dept_filter = request.GET.get('dept', '')
    scope_filter = request.GET.get('scope', '')

    events_qs = Event.objects.filter(
        start_datetime__year=year,
        start_datetime__month=month,
        is_published=True,
    ).select_related('department', 'responsible')

    if dept_filter:
        events_qs = events_qs.filter(department__slug=dept_filter)
    if scope_filter:
        events_qs = events_qs.filter(scope=scope_filter.upper())

    events_by_day = {}
    for event in events_qs:
        d = event.start_datetime.day
        events_by_day.setdefault(d, []).append(event)

    cal = calendar.monthcalendar(year, month)
    calendar_weeks = []
    for week in cal:
        days = []
        for day in week:
            if day == 0:
                days.append({'day': '', 'in_month': False, 'is_today': False, 'events': []})
            else:
                days.append({
                    'day': day,
                    'in_month': True,
                    'is_today': date(year, month, day) == today,
                    'events': events_by_day.get(day, []),
                })
        calendar_weeks.append(days)

    upcoming_events = Event.objects.filter(
        start_datetime__date__gte=today,
        is_published=True,
    ).select_related('department').order_by('start_datetime')[:5]

    prev_month, prev_year = (month - 1, year) if month > 1 else (12, year - 1)
    next_month, next_year = (month + 1, year) if month < 12 else (1, year + 1)

    return render(request, 'calendar_app/calendar.html', {
        'year': year,
        'month': month,
        'month_name': MONTH_NAMES[month],
        'day_names': DAY_NAMES,
        'calendar_weeks': calendar_weeks,
        'departments': Department.objects.filter(is_active=True),
        'dept_filter': dept_filter,
        'scope_filter': scope_filter,
        'upcoming_events': upcoming_events,
        'prev_year': prev_year,
        'prev_month': prev_month,
        'next_year': next_year,
        'next_month': next_month,
        'today': today,
        'scope_options': [
            ('', 'Todos', 'public'),
            ('local', 'Local', 'church'),
            ('association', 'Asociación', 'corporate_fare'),
            ('union', 'Unión', 'hub'),
            ('general', 'General', 'language'),
        ],
    })


def event_list(request):
    qs = Event.objects.filter(is_published=True).select_related('department').order_by('start_datetime')

    q = request.GET.get('q', '')
    dept = request.GET.get('dept', '')

    if q:
        qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q) | Q(location__icontains=q))
    if dept:
        qs = qs.filter(department__slug=dept)

    paginator = Paginator(qs, 20)
    page_number = request.GET.get('page')
    events = paginator.get_page(page_number)

    return render(request, 'calendar_app/event_list.html', {
        'events': events,
        'departments': Department.objects.filter(is_active=True),
    })


def event_detail(request, slug):
    event = get_object_or_404(Event, slug=slug, is_published=True)
    return render(request, 'calendar_app/event_detail.html', {'event': event})


def agenda_view(request):
    """Vista de agenda estilo lista para móvil."""
    today = date.today()
    from datetime import timedelta
    import calendar as cal_mod

    today_events = Event.objects.filter(
        start_datetime__date=today, is_published=True,
    ).select_related('department').order_by('start_datetime')

    week_end = today + timedelta(days=7)
    week_events = Event.objects.filter(
        start_datetime__date__gt=today,
        start_datetime__date__lte=week_end,
        is_published=True,
    ).select_related('department').order_by('start_datetime')

    last_day = cal_mod.monthrange(today.year, today.month)[1]
    month_end = date(today.year, today.month, last_day)
    month_events = Event.objects.filter(
        start_datetime__date__gt=week_end,
        start_datetime__date__lte=month_end,
        is_published=True,
    ).select_related('department').order_by('start_datetime')

    notice_event = Event.objects.filter(
        start_datetime__date__gte=today,
        is_published=True,
        administrative_note__isnull=False,
    ).exclude(administrative_note='').first()

    return render(request, 'calendar_app/agenda.html', {
        'today': today,
        'today_events': today_events,
        'week_events': week_events,
        'month_events': month_events,
        'notice_event': notice_event,
    })


def tv_view(request):
    today = date.today()
    year = today.year
    month = today.month

    today_events = Event.objects.filter(
        start_datetime__date=today,
        is_published=True,
    ).select_related('department').order_by('start_datetime')

    upcoming_events = Event.objects.filter(
        start_datetime__date__gt=today,
        is_published=True,
    ).select_related('department').order_by('start_datetime')[:6]

    events_qs = Event.objects.filter(
        start_datetime__year=year,
        start_datetime__month=month,
        is_published=True,
    ).select_related('department')

    events_by_day = {}
    for event in events_qs:
        d = event.start_datetime.day
        events_by_day.setdefault(d, []).append(event)

    # Domingo primero (firstweekday=6 = domingo en python-calendar)
    cal = calendar.Calendar(firstweekday=6).monthdayscalendar(year, month)
    calendar_weeks = []
    for week in cal:
        days = []
        for day in week:
            if day == 0:
                days.append({'day': '', 'in_month': False, 'is_today': False, 'events': []})
            else:
                days.append({
                    'day': day,
                    'in_month': True,
                    'is_today': date(year, month, day) == today,
                    'events': events_by_day.get(day, []),
                })
        calendar_weeks.append(days)

    DAY_NAMES_FULL_SUN = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    MONTH_NAMES_FULL = [
        '', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ]
    today_label = f"Sábado, {today.day} de {MONTH_NAMES_FULL[today.month]} de {today.year}" \
        if today.weekday() == 5 else \
        f"{DAY_NAMES_FULL_SUN[(today.weekday() + 1) % 7]}, {today.day} de {MONTH_NAMES_FULL[today.month]} de {today.year}"

    return render(request, 'calendar_app/tv.html', {
        'today': today,
        'today_label': today_label,
        'today_events': today_events,
        'upcoming_events': upcoming_events,
        'year': year,
        'month': month,
        'month_name': MONTH_NAMES[month],
        'day_names': DAY_NAMES_FULL_SUN,
        'calendar_weeks': calendar_weeks,
        'num_weeks': len(calendar_weeks),
    })


@staff_member_required
def admin_panel_view(request):
    today = date.today()

    # Gestión rápida: crear evento borrador
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        event_date = request.POST.get('date', '')
        responsible_id = request.POST.get('responsible', '') or None
        if title and event_date:
            try:
                start_dt = timezone.make_aware(
                    datetime.strptime(event_date, '%Y-%m-%d').replace(hour=9, minute=0)
                )
                base_slug = slugify(title)[:48]
                slug = base_slug
                counter = 1
                while Event.objects.filter(slug=slug).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                event = Event.objects.create(
                    title=title,
                    slug=slug,
                    start_datetime=start_dt,
                    is_published=False,
                    responsible_id=responsible_id,
                )
                messages.success(request, f'Actividad "{title}" creada. Completa los detalles.')
                return redirect('admin:calendar_app_event_change', event.pk)
            except (ValueError, Exception):
                messages.error(request, 'Error al crear la actividad. Verifica los datos.')

    try:
        year = int(request.GET.get('year', today.year))
        month = int(request.GET.get('month', today.month))
    except ValueError:
        year, month = today.year, today.month

    if month < 1:
        month, year = 12, year - 1
    elif month > 12:
        month, year = 1, year + 1

    dept_filter = request.GET.get('dept', '')
    scope_filter = request.GET.get('scope', '')

    events_qs = Event.objects.filter(
        start_datetime__year=year,
        start_datetime__month=month,
    ).select_related('department', 'responsible')

    if dept_filter:
        events_qs = events_qs.filter(department__slug=dept_filter)
    if scope_filter:
        events_qs = events_qs.filter(scope=scope_filter.upper())

    events_by_day = {}
    for event in events_qs:
        d = event.start_datetime.day
        events_by_day.setdefault(d, []).append(event)

    # Domingo primero
    sun_cal = calendar.Calendar(firstweekday=6)
    calendar_weeks = []
    for week in sun_cal.monthdayscalendar(year, month):
        days = []
        for day in week:
            if day == 0:
                days.append({'day': '', 'in_month': False, 'is_today': False, 'events': []})
            else:
                days.append({
                    'day': day,
                    'in_month': True,
                    'is_today': date(year, month, day) == today,
                    'events': events_by_day.get(day, []),
                })
        calendar_weeks.append(days)

    upcoming_events = Event.objects.filter(
        start_datetime__date__gte=today,
    ).select_related('department').order_by('start_datetime')[:8]

    prev_month = month - 1 if month > 1 else 12
    prev_year = year if month > 1 else year - 1
    next_month = month + 1 if month < 12 else 1
    next_year = year if month < 12 else year + 1

    return render(request, 'calendar_app/admin_panel.html', {
        'year': year,
        'month': month,
        'month_name': MONTH_NAMES[month],
        'day_names': ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
        'calendar_weeks': calendar_weeks,
        'departments': Department.objects.filter(is_active=True),
        'responsibles': Responsible.objects.filter(
            department__is_active=True
        ).select_related('department').order_by('full_name'),
        'dept_filter': dept_filter,
        'scope_filter': scope_filter,
        'upcoming_events': upcoming_events,
        'prev_year': prev_year,
        'prev_month': prev_month,
        'next_year': next_year,
        'next_month': next_month,
        'today': today,
        'scope_choices': [
            ('', 'Todos los Alcances'),
            ('local', 'Local (Osorno Central)'),
            ('association', 'Asociación Sur Austral'),
            ('union', 'Unión'),
            ('general', 'General'),
        ],
    })


@require_POST
def event_create_view(request):
    """Crear un nuevo evento desde el modal del panel de secretaría."""
    title = request.POST.get('title', '').strip()
    if not title:
        return JsonResponse({'ok': False, 'error': 'El título es obligatorio.'}, status=400)

    start_date = request.POST.get('start_date', '').strip()
    start_time = request.POST.get('start_time', '').strip() or '09:00'
    end_date = request.POST.get('end_date', '').strip()
    end_time = request.POST.get('end_time', '').strip() or '11:00'
    is_all_day = request.POST.get('is_all_day') == '1'

    if not start_date:
        return JsonResponse({'ok': False, 'error': 'La fecha de inicio es obligatoria.'}, status=400)

    try:
        start_naive = datetime.strptime(f"{start_date} {start_time}", '%Y-%m-%d %H:%M')
        start_dt = timezone.make_aware(start_naive)
    except ValueError:
        return JsonResponse({'ok': False, 'error': 'Fecha u hora de inicio inválida.'}, status=400)

    end_dt = None
    if end_date:
        try:
            end_naive = datetime.strptime(f"{end_date} {end_time}", '%Y-%m-%d %H:%M')
            end_dt = timezone.make_aware(end_naive)
        except ValueError:
            pass

    base_slug = slugify(title)[:48]
    slug = base_slug
    counter = 1
    while Event.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1

    dept_id = request.POST.get('department') or None
    resp_id = request.POST.get('responsible') or None
    scope = request.POST.get('scope', 'local')
    event_type = request.POST.get('event_type', 'other')
    audience = request.POST.get('audience', 'all')
    location = request.POST.get('location', '').strip()
    bible_verse = request.POST.get('bible_verse', '').strip()
    description = request.POST.get('description', '').strip()
    is_published = request.POST.get('is_published') == '1'
    is_featured = request.POST.get('is_featured') == '1'

    event = Event.objects.create(
        title=title,
        slug=slug,
        description=description,
        department_id=dept_id,
        responsible_id=resp_id,
        scope=scope,
        event_type=event_type,
        audience=audience,
        start_datetime=start_dt,
        end_datetime=end_dt,
        is_all_day=is_all_day,
        location=location,
        bible_verse=bible_verse,
        is_published=is_published,
        is_featured=is_featured,
    )

    return JsonResponse({
        'ok': True,
        'title': event.title,
        'detail_url': reverse('calendar_app:event_detail', args=[event.slug]),
    })
