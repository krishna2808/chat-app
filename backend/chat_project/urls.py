"""chat_project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('chat_project/', include('chat.urls'))
"""
from django.contrib import admin
from django.urls import path, include

 
from django.conf import settings
from django.conf.urls.static import static


from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import authentication

schema_view = get_schema_view(
    openapi.Info(
        title="chat_project APIs",
        default_version='v1',
        description="chat_project API documentation",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@snippets.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,   
    # authentication_classes=(authentication.BasicAuthentication,), 
    permission_classes=(permissions.AllowAny,),
    
)



urlpatterns = [
    
    # Include DRF-Swagger URLs
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    # my api endpoint     
    
    path('admin/', admin.site.urls),
    path('account/', include("account.urls")),
    path('chat/', include("chat.urls")),
]


if settings.DEBUG:
    """
    static function use to development environment. when we run collectstatic then it all js,images , css in collect from other app to single directory.
    static function return list : path("static_url", static_root).
    For Production environent we need to set static file nginx webserver because it debuger is False.
    """
    urlpatterns +=  static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) +  static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


