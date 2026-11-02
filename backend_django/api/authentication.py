import os
import uuid

from django.db import IntegrityError
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.backends import TokenBackend
from rest_framework_simplejwt.exceptions import TokenError

from .models import CustomUser


class SupabaseJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        signing_key = os.getenv('SUPABASE_JWT_SECRET')
        if not signing_key:
            return None

        header = get_authorization_header(request).split()
        if len(header) != 2 or header[0].lower() != b'bearer':
            return None

        try:
            token = TokenBackend(
                algorithm='HS256',
                signing_key=signing_key,
                audience='authenticated',
            ).decode(header[1].decode('utf-8'), verify=True)
            user_id = uuid.UUID(str(token['sub']))
            email = str(token.get('email', '')).lower().strip()
            if not email:
                raise AuthenticationFailed('Authenticated token has no email.')
        except (TokenError, KeyError, ValueError, UnicodeDecodeError) as error:
            raise AuthenticationFailed('Invalid authentication token.') from error

        try:
            user, _ = CustomUser.objects.get_or_create(
                id=user_id,
                defaults={
                    'email': email,
                    'username': f'supabase_{str(user_id).replace("-", "")[:40]}',
                    'full_name': token.get('user_metadata', {}).get('full_name', ''),
                    'is_verified': True,
                },
            )
        except IntegrityError as error:
            raise AuthenticationFailed('Unable to provision authenticated user.') from error

        if not user.is_active:
            raise AuthenticationFailed('User account is inactive.')
        return user, token