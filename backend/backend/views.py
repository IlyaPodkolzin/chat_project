from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.views import View

@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCsrfToken(View):
    def get(self, request):
        return JsonResponse({'csrfToken': request.META.get('CSRF_COOKIE', '')}) 