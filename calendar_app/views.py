import calendar
from datetime import date, datetime, timedelta, timezone as dt_timezone
from urllib.parse import urlencode

from django.contrib.admin.views.decorators import staff_member_required
from django.contrib import messages
from django.db.models import Q
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from django.core.paginator import Paginator
from django.views.decorators.http import require_POST

from .forms import AdminPanelFilterForm, CalendarFilterForm, EventForm, EventListFilterForm, EventQuickForm, unique_slug
from .models import Department, Event, Responsible


# Nombres de meses en español
MONTH_NAMES = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']


def calendar_view(request):
    today = date.today()

    filters = CalendarFilterForm(request.GET)
    filters.is_valid()  # limpia los campos válidos, ignora inválidos
    fd = filters.cleaned_data

    year = fd.get('year') or today.year
    month = fd.get('month') or today.month
    if month < 1:
        month, year = 12, year - 1
    elif month > 12:
        month, year = 1, year + 1

    dept_filters = fd.get('dept', [])
    scope_filters = fd.get('scope', [])
    type_filters = fd.get('type', [])

    events_qs = Event.objects.filter(
        start_datetime__year=year,
        start_datetime__month=month,
        is_published=True,
    ).select_related('department', 'responsible')

    if dept_filters:
        events_qs = events_qs.filter(department__slug__in=dept_filters)
    if scope_filters:
        events_qs = events_qs.filter(scope__in=scope_filters)
    if type_filters:
        events_qs = events_qs.filter(event_type__in=type_filters)

    events_by_day = {}
    for event in events_qs:
        d = event.start_datetime.day
        events_by_day.setdefault(d, []).append(event)

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

    return render(request, 'calendar_app/calendar.html', {
        'year': year,
        'month': month,
        'month_name': MONTH_NAMES[month],
        'day_names': DAY_NAMES,
        'calendar_weeks': calendar_weeks,
        'departments': Department.objects.filter(is_active=True),
        'dept_filters': dept_filters,
        'scope_filters': scope_filters,
        'type_filters': type_filters,
        'today': today,
        'scope_options': [
            ('local', 'Local'),
            ('association', 'Asociación'),
            ('union', 'Unión'),
            ('general', 'General'),
        ],
        'event_type_options': [
            ('service', 'Culto'),
            ('seminar', 'Seminario'),
            ('meeting', 'Reunión'),
            ('social', 'Social'),
            ('youth', 'Jóvenes'),
            ('children', 'Infantil'),
            ('outreach', 'Evangelismo'),
            ('other', 'Otro'),
        ],
    })


def event_list(request):
    filters = EventListFilterForm(request.GET)
    filters.is_valid()
    fd = filters.cleaned_data

    qs = Event.objects.filter(is_published=True).select_related('department').order_by('start_datetime')

    if fd.get('q'):
        qs = qs.filter(Q(title__icontains=fd['q']) | Q(description__icontains=fd['q']) | Q(location__icontains=fd['q']))
    if fd.get('dept'):
        qs = qs.filter(department__slug=fd['dept'])

    paginator = Paginator(qs, 20)
    events = paginator.get_page(request.GET.get('page'))

    return render(request, 'calendar_app/event_list.html', {
        'events': events,
        'filters': filters,
        'departments': Department.objects.filter(is_active=True),
    })


def event_detail(request, slug):
    event = get_object_or_404(Event, slug=slug, is_published=True)

    # URL absoluta del evento (para compartir)
    event_url = request.build_absolute_uri(
        reverse('calendar_app:event_detail', args=[event.slug])
    )

    # URL de Google Calendar
    start_utc = event.start_datetime.astimezone(dt_timezone.utc)
    end_dt = event.end_datetime or (event.start_datetime + timedelta(hours=1))
    end_utc = end_dt.astimezone(dt_timezone.utc)
    fmt = '%Y%m%dT%H%M%SZ'
    gcal_params = urlencode({
        'action': 'TEMPLATE',
        'text': event.title,
        'dates': f"{start_utc.strftime(fmt)}/{end_utc.strftime(fmt)}",
        'details': event.description or '',
        'location': event.location or '',
    })
    google_cal_url = f"https://calendar.google.com/calendar/render?{gcal_params}"

    return render(request, 'calendar_app/event_detail.html', {
        'event': event,
        'event_url': event_url,
        'google_cal_url': google_cal_url,
        'departments': Department.objects.filter(is_active=True),
        'responsibles': Responsible.objects.filter(
            department__is_active=True
        ).select_related('department').order_by('full_name'),
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
        form = EventQuickForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            event = Event.objects.create(
                title=cd['title'],
                slug=unique_slug(cd['title']),
                start_datetime=form.start_datetime,
                is_published=False,
                responsible=cd['responsible'],
            )
            messages.success(request, f'Actividad "{event.title}" creada. Completa los detalles.')
            return redirect('admin:calendar_app_event_change', event.pk)
        else:
            messages.error(request, 'Verifica los datos del formulario.')

    # Filtros de navegación del calendario
    panel_filters = AdminPanelFilterForm(request.GET)
    panel_filters.is_valid()
    fd = panel_filters.cleaned_data

    year = fd.get('year') or today.year
    month = fd.get('month') or today.month
    if month < 1:
        month, year = 12, year - 1
    elif month > 12:
        month, year = 1, year + 1

    dept_filter = fd.get('dept', '')
    scope_filter = fd.get('scope', '')

    events_qs = Event.objects.filter(
        start_datetime__year=year,
        start_datetime__month=month,
    ).select_related('department', 'responsible')

    if dept_filter:
        events_qs = events_qs.filter(department__slug=dept_filter)
    if scope_filter:
        events_qs = events_qs.filter(scope=scope_filter)

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
@staff_member_required
def event_create_view(request):
    """Crear un nuevo evento desde el modal del panel de secretaría."""
    form = EventForm(request.POST)
    if not form.is_valid():
        first_error = next(iter(form.errors.values()))[0]
        return JsonResponse({'ok': False, 'error': first_error}, status=400)

    cd = form.cleaned_data
    event = Event.objects.create(
        title=cd['title'],
        slug=unique_slug(cd['title']),
        description=cd['description'],
        department=cd['department'],
        responsible=cd['responsible'],
        scope=cd['scope'],
        event_type=cd['event_type'],
        audience=cd['audience'],
        location=cd['location'],
        bible_verse=cd['bible_verse'],
        is_all_day=cd['is_all_day'],
        start_datetime=form.start_datetime,
        end_datetime=form.end_datetime,
        is_published=cd['is_published'],
        is_featured=cd['is_featured'],
    )
    return JsonResponse({
        'ok': True,
        'title': event.title,
        'detail_url': reverse('calendar_app:event_detail', args=[event.slug]),
    })


def event_get_view(request, pk):
    """Devuelve datos JSON de un evento para rellenar el modal de edición."""
    event = get_object_or_404(Event, pk=pk)
    local_start = timezone.localtime(event.start_datetime)
    local_end = timezone.localtime(event.end_datetime) if event.end_datetime else None
    return JsonResponse({
        'ok': True,
        'id': event.pk,
        'title': event.title,
        'description': event.description or '',
        'department': event.department_id or '',
        'responsible': event.responsible_id or '',
        'location': event.location or '',
        'is_all_day': event.is_all_day,
        'start_date': local_start.strftime('%Y-%m-%d'),
        'start_time': local_start.strftime('%H:%M'),
        'end_date': local_end.strftime('%Y-%m-%d') if local_end else '',
        'end_time': local_end.strftime('%H:%M') if local_end else '',
        'event_type': event.event_type,
        'scope': event.scope,
        'audience': event.audience,
        'bible_verse': event.bible_verse or '',
        'is_published': event.is_published,
        'is_featured': event.is_featured,
    })


@require_POST
@staff_member_required
def event_update_view(request, pk):
    """Actualizar un evento existente desde el modal de edición."""
    event = get_object_or_404(Event, pk=pk)
    form = EventForm(request.POST)
    if not form.is_valid():
        first_error = next(iter(form.errors.values()))[0]
        return JsonResponse({'ok': False, 'error': first_error}, status=400)

    cd = form.cleaned_data
    if event.title != cd['title']:
        event.slug = unique_slug(cd['title'], exclude_pk=pk)

    event.title = cd['title']
    event.description = cd['description']
    event.department = cd['department']
    event.responsible = cd['responsible']
    event.scope = cd['scope']
    event.event_type = cd['event_type']
    event.audience = cd['audience']
    event.location = cd['location']
    event.bible_verse = cd['bible_verse']
    event.is_all_day = cd['is_all_day']
    event.start_datetime = form.start_datetime
    event.end_datetime = form.end_datetime
    event.is_published = cd['is_published']
    event.is_featured = cd['is_featured']
    event.save()
    return JsonResponse({
        'ok': True,
        'title': event.title,
        'detail_url': reverse('calendar_app:event_detail', args=[event.slug]),
    })


@require_POST
@staff_member_required
def event_delete_view(request, pk):
    """Eliminar un evento."""
    event = get_object_or_404(Event, pk=pk)
    title = event.title
    event.delete()
    return JsonResponse({'ok': True, 'title': title})


def event_ical_view(request, slug):
    """Descarga el evento en formato iCalendar (.ics) para Apple Calendar, Outlook, etc."""
    event = get_object_or_404(Event, slug=slug, is_published=True)

    fmt = '%Y%m%dT%H%M%SZ'
    now_str = datetime.now(tz=dt_timezone.utc).strftime(fmt)
    start_utc = event.start_datetime.astimezone(dt_timezone.utc)
    end_dt = event.end_datetime or (event.start_datetime + timedelta(hours=1))
    end_utc = end_dt.astimezone(dt_timezone.utc)

    event_url = request.build_absolute_uri(
        reverse('calendar_app:event_detail', args=[event.slug])
    )

    def ical_text(value):
        """Escapa caracteres especiales para iCal."""
        return (value or '').replace('\\', '\\\\').replace('\n', '\\n').replace(',', '\\,').replace(';', '\\;')

    ical = (
        "BEGIN:VCALENDAR\r\n"
        "VERSION:2.0\r\n"
        "PRODID:-//Iglesia Adventista Osorno Central//ES\r\n"
        "CALSCALE:GREGORIAN\r\n"
        "METHOD:PUBLISH\r\n"
        "BEGIN:VEVENT\r\n"
        f"UID:{event.slug}@osorno-central\r\n"
        f"DTSTAMP:{now_str}\r\n"
        f"DTSTART:{start_utc.strftime(fmt)}\r\n"
        f"DTEND:{end_utc.strftime(fmt)}\r\n"
        f"SUMMARY:{ical_text(event.title)}\r\n"
        f"DESCRIPTION:{ical_text(event.description)}\r\n"
        f"LOCATION:{ical_text(event.location)}\r\n"
        f"URL:{event_url}\r\n"
        "END:VEVENT\r\n"
        "END:VCALENDAR\r\n"
    )

    response = HttpResponse(ical, content_type='text/calendar; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="{event.slug}.ics"'
    return response
