from django.contrib import admin
from django.urls import path, include
from api.views import root_status_view

urlpatterns = [
    path('', root_status_view, name='root_status'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
