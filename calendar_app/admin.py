from django.contrib import admin
from django.utils.html import format_html

from .models import Department, Event, Responsible


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "color_preview", "icon", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}

    @admin.display(description="Color")
    def color_preview(self, obj):
        return format_html(
            '<span class="{}" style="padding:2px 8px;border-radius:4px;">{}</span>',
            obj.color_class,
            obj.name,
        )


@admin.register(Responsible)
class ResponsibleAdmin(admin.ModelAdmin):
    list_display = ("full_name", "role", "department")
    list_filter = ("department",)
    search_fields = ("full_name", "role")
    autocomplete_fields = ("department",)


class EventAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "start_datetime",
        "department",
        "scope",
        "event_type",
        "is_published",
        "is_featured",
    )
    list_filter = ("scope", "event_type", "department", "is_published", "is_featured")
    search_fields = ("title", "description", "location")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("department", "responsible")
    date_hierarchy = "start_datetime"
    list_editable = ("is_published", "is_featured")
    fieldsets = (
        (
            "Información general",
            {
                "fields": (
                    "title",
                    "slug",
                    "description",
                    "bible_verse",
                    "cover_image",
                )
            },
        ),
        (
            "Fecha y lugar",
            {
                "fields": (
                    "start_datetime",
                    "end_datetime",
                    "is_all_day",
                    "location",
                )
            },
        ),
        (
            "Clasificación",
            {
                "fields": (
                    "department",
                    "responsible",
                    "scope",
                    "event_type",
                    "audience",
                )
            },
        ),
        (
            "Inscripción y publicación",
            {
                "fields": (
                    "requires_registration",
                    "registration_url",
                    "is_published",
                    "is_featured",
                )
            },
        ),
        (
            "Notas internas",
            {"fields": ("administrative_note",), "classes": ("collapse",)},
        ),
    )


admin.site.register(Event, EventAdmin)

admin.site.site_header = "Iglesia Adventista Osorno Central"
admin.site.site_title = "Calendario Adventista"
admin.site.index_title = "Panel de Administración"
