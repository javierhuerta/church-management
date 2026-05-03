from django.urls import path
from . import views

app_name = 'calendar_app'

urlpatterns = [
    path('', views.calendar_view, name='calendar'),
    path('actividades/', views.event_list, name='event_list'),
    path('actividades/<slug:slug>/', views.event_detail, name='event_detail'),
    path('tv/', views.tv_view, name='tv'),
    path('agenda/', views.agenda_view, name='agenda'),
    path('secretaria/', views.admin_panel_view, name='admin_panel'),
    path('secretaria/crear-evento/', views.event_create_view, name='event_create'),
]
