from datetime import datetime, time

from django import forms
from django.utils import timezone
from django.utils.text import slugify

from .models import Department, Event, Responsible


def unique_slug(title, exclude_pk=None):
    """Genera un slug único para un Event, evitando colisiones."""
    base = slugify(title)[:48]
    slug = base
    counter = 1
    while True:
        qs = Event.objects.filter(slug=slug)
        if exclude_pk:
            qs = qs.exclude(pk=exclude_pk)
        if not qs.exists():
            return slug
        slug = f"{base}-{counter}"
        counter += 1


class EventForm(forms.Form):
    """Formulario principal para crear/editar eventos desde el panel de secretaría."""

    title = forms.CharField(max_length=200)
    description = forms.CharField(required=False, widget=forms.Textarea)
    department = forms.ModelChoiceField(
        queryset=Department.objects.filter(is_active=True),
        required=False,
    )
    responsible = forms.ModelChoiceField(
        queryset=Responsible.objects.select_related('department').order_by('full_name'),
        required=False,
    )
    scope = forms.ChoiceField(choices=Event.ScopeChoices.choices)
    event_type = forms.ChoiceField(choices=Event.EventTypeChoices.choices)
    audience = forms.ChoiceField(choices=Event.AudienceChoices.choices)
    location = forms.CharField(max_length=200, required=False)
    bible_verse = forms.CharField(max_length=300, required=False)

    # Fechas y horas separadas para coincidir con los inputs del modal
    start_date = forms.DateField(input_formats=['%Y-%m-%d'])
    start_time = forms.TimeField(input_formats=['%H:%M'], required=False)
    end_date = forms.DateField(input_formats=['%Y-%m-%d'], required=False)
    end_time = forms.TimeField(input_formats=['%H:%M'], required=False)

    is_all_day = forms.BooleanField(required=False)
    is_published = forms.BooleanField(required=False)
    is_featured = forms.BooleanField(required=False)

    @property
    def start_datetime(self):
        d = self.cleaned_data['start_date']
        t = self.cleaned_data.get('start_time') or time(9, 0)
        return timezone.make_aware(datetime.combine(d, t))

    @property
    def end_datetime(self):
        d = self.cleaned_data.get('end_date')
        if not d:
            return None
        t = self.cleaned_data.get('end_time') or time(11, 0)
        return timezone.make_aware(datetime.combine(d, t))


class CalendarFilterForm(forms.Form):
    """Filtros GET para la vista de calendario público."""

    year = forms.IntegerField(required=False)
    month = forms.IntegerField(required=False, min_value=1, max_value=12)
    dept = forms.MultipleChoiceField(required=False, choices=[])
    scope = forms.MultipleChoiceField(required=False, choices=Event.ScopeChoices.choices)
    type = forms.MultipleChoiceField(required=False, choices=Event.EventTypeChoices.choices)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['dept'].choices = [
            (d.slug, d.name) for d in Department.objects.filter(is_active=True)
        ]


class EventListFilterForm(forms.Form):
    """Filtros GET para la vista de listado de actividades."""

    q = forms.CharField(required=False)
    dept = forms.ChoiceField(required=False, choices=[])
    year = forms.IntegerField(required=False)
    month = forms.IntegerField(required=False, min_value=1, max_value=12)
    scope = forms.ChoiceField(required=False, choices=[])

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['dept'].choices = [('', 'Todos')] + [
            (d.slug, d.name) for d in Department.objects.filter(is_active=True)
        ]
        self.fields['scope'].choices = [('', 'Todos')] + list(Event.ScopeChoices.choices)


class AdminPanelFilterForm(forms.Form):
    """Filtros GET para el panel de secretaría."""

    year = forms.IntegerField(required=False)
    month = forms.IntegerField(required=False, min_value=1, max_value=12)
    dept = forms.ChoiceField(required=False, choices=[])
    scope = forms.ChoiceField(required=False, choices=[('', '')] + list(Event.ScopeChoices.choices))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['dept'].choices = [('', '')] + [
            (d.slug, d.name) for d in Department.objects.filter(is_active=True)
        ]


class EventQuickForm(forms.Form):
    """Formulario de creación rápida de borrador desde el panel de secretaría."""

    title = forms.CharField(max_length=200)
    date = forms.DateField(input_formats=['%Y-%m-%d'])
    responsible = forms.ModelChoiceField(
        queryset=Responsible.objects.order_by('full_name'),
        required=False,
    )

    @property
    def start_datetime(self):
        return timezone.make_aware(datetime.combine(self.cleaned_data['date'], time(9, 0)))
