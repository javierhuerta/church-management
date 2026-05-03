from django.db import models
from django.utils.translation import gettext_lazy as _


class Department(models.Model):
    """Departamento o ministerio de la iglesia."""

    name = models.CharField(_("nombre"), max_length=100)
    slug = models.SlugField(unique=True)
    color = models.CharField(
        _("color"),
        max_length=20,
        default="#4f46e5",
        help_text=_("Color hexadecimal del departamento, ej: #7c3aed"),
    )
    icon = models.CharField(
        _("ícono Material Symbols"),
        max_length=60,
        blank=True,
        default="groups",
    )
    description = models.TextField(_("descripción"), blank=True)
    is_active = models.BooleanField(_("activo"), default=True)

    class Meta:
        verbose_name = _("departamento")
        verbose_name_plural = _("departamentos")
        ordering = ["name"]

    def __str__(self):
        return self.name


class Responsible(models.Model):
    """Persona responsable o líder a cargo de una actividad."""

    full_name = models.CharField(_("nombre completo"), max_length=150)
    role = models.CharField(_("cargo"), max_length=100, blank=True)
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="responsibles",
        verbose_name=_("departamento"),
    )
    photo = models.ImageField(
        _("foto"), upload_to="responsibles/", null=True, blank=True
    )

    class Meta:
        verbose_name = _("responsable")
        verbose_name_plural = _("responsables")
        ordering = ["full_name"]

    def __str__(self):
        return self.full_name


class Event(models.Model):
    """Actividad o evento del calendario eclesial."""

    class ScopeChoices(models.TextChoices):
        LOCAL = "local", _("Local")
        ASSOCIATION = "association", _("Asociación")
        UNION = "union", _("Unión")
        GENERAL = "general", _("General")

    class EventTypeChoices(models.TextChoices):
        SERVICE = "service", _("Culto")
        SEMINAR = "seminar", _("Seminario")
        MEETING = "meeting", _("Reunión")
        SOCIAL = "social", _("Social")
        YOUTH = "youth", _("Jóvenes")
        CHILDREN = "children", _("Infantil")
        OUTREACH = "outreach", _("Evangelismo")
        OTHER = "other", _("Otro")

    class AudienceChoices(models.TextChoices):
        ALL = "all", _("Todo público")
        MEMBERS = "members", _("Miembros")
        LEADERS = "leaders", _("Directivos")
        YOUTH = "youth", _("Jóvenes")
        JUVENILES = "juveniles", _("Juveniles")
        INTERMEDIARIES = "intermediaries", _("Intermediarios")
        CHILDREN = "children", _("Niños")
        WOMEN = "women", _("Mujeres")
        MEN = "men", _("Varones")

    title = models.CharField(_("título"), max_length=200)
    slug = models.SlugField(unique=True, max_length=220)
    description = models.TextField(_("descripción"), blank=True)
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="events",
        verbose_name=_("departamento"),
    )
    responsible = models.ForeignKey(
        Responsible,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="events",
        verbose_name=_("responsable"),
    )
    scope = models.CharField(
        _("alcance"),
        max_length=20,
        choices=ScopeChoices,
        default=ScopeChoices.LOCAL,
    )
    event_type = models.CharField(
        _("tipo de evento"),
        max_length=20,
        choices=EventTypeChoices,
        default=EventTypeChoices.OTHER,
    )
    audience = models.CharField(
        _("público"),
        max_length=20,
        choices=AudienceChoices,
        default=AudienceChoices.ALL,
    )
    start_datetime = models.DateTimeField(_("inicio"))
    end_datetime = models.DateTimeField(_("término"), null=True, blank=True)
    is_all_day = models.BooleanField(_("todo el día"), default=False)
    location = models.CharField(_("lugar"), max_length=200, blank=True)
    requires_registration = models.BooleanField(
        _("requiere inscripción"), default=False
    )
    registration_url = models.URLField(_("URL de inscripción"), blank=True)
    cover_image = models.ImageField(
        _("imagen de portada"), upload_to="events/", null=True, blank=True
    )
    bible_verse = models.CharField(_("versículo bíblico"), max_length=300, blank=True)
    administrative_note = models.TextField(_("nota administrativa"), blank=True)
    is_published = models.BooleanField(_("publicado"), default=True)
    is_featured = models.BooleanField(_("destacado"), default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("evento")
        verbose_name_plural = _("eventos")
        ordering = ["start_datetime"]

    def __str__(self):
        return f"{self.title} — {self.start_datetime.strftime('%d/%m/%Y')}"

    @property
    def scope_badge_class(self):
        classes = {
            self.ScopeChoices.LOCAL: "border-[#1A365D] text-[#1A365D]",
            self.ScopeChoices.ASSOCIATION: "border-[#343637] text-[#343637]",
            self.ScopeChoices.UNION: "border-amber-700 text-amber-700",
            self.ScopeChoices.GENERAL: "border-red-700 text-red-700",
        }
        return classes.get(self.scope, "border-gray-400 text-gray-600")
