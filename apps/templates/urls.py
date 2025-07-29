from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TemplateCategoryViewSet,
    TemplateViewSet,
    TemplateVersionViewSet,
    TemplateCategorizationViewSet
)

router = DefaultRouter()
router.register(
    r'workspaces/(?P<workspace_slug>[\w-]+)/template-categories',
    TemplateCategoryViewSet,
    basename='template-category'
)
router.register(
    r'workspaces/(?P<workspace_slug>[\w-]+)/templates',
    TemplateViewSet,
    basename='template'
)
router.register(
    r'workspaces/(?P<workspace_slug>[\w-]+)/templates/(?P<template_pk>[^/.]+)/versions',
    TemplateVersionViewSet,
    basename='template-version'
)
router.register(
    r'workspaces/(?P<workspace_slug>[\w-]+)/templates/(?P<template_pk>[^/.]+)/categories',
    TemplateCategorizationViewSet,
    basename='template-categorization'
)

urlpatterns = [
    path('', include(router.urls)),
]