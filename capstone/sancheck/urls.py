from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', views.index, name="index"),
    path('dashboard', views.dashboard_view, name="dashboard"),

    path('accounts/login/', auth_views.LoginView.as_view(), name="login"),
    path('register/', views.register_view, name="register"),

    # password change + recovery
    path('accounts/password_reset/', auth_views.PasswordResetView.as_view(), name="password-reset"),
    path('accounts/password_reset/done/', auth_views.PasswordResetDoneView.as_view()),
    path('accounts/reset/<uidb64>/<token>', auth_views.PasswordResetConfirmView.as_view()),
    path('accounts/password_reset/complete/', auth_views.PasswordResetCompleteView.as_view()),

    # API routes
    path("tags/<str:park_id>", views.get_park_tags, name="park-tags"),
    path("upvote_tag/<int:id>", views.upvote_tag, name="upvote"),
    path("create_tag/<str:park_id>/<str:tag>", views.create_tag, name="create")
]