from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('upload/', views.upload_image, name='upload_image'),
    path('list/', views.get_user_images, name='get_user_images'),
    path('<str:image_id>/', views.get_image_details, name='get_image_details'),
    path('<str:image_id>/delete/', views.delete_image, name='delete_image'),
] 