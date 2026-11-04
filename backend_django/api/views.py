import secrets
import uuid
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils.dateparse import parse_datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser, Trade, CapitalLog, JournalEntry, UserTradingData
from .serializers import CustomUserSerializer, TradeSerializer, CapitalLogSerializer, JournalEntrySerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def root_status_view(request):
    base_url = request.build_absolute_uri('/')[:-1]
    return Response({
        'status': 'online',
        'project': 'TRADETRACKER Pro Trading Terminal API',
        'version': 'v2.0 Global',
        'endpoints': {
            'api_root': f'{base_url}/api/',
            'admin_portal': f'{base_url}/admin/',
            'auth_signup': f'{base_url}/api/auth/signup/',
            'auth_login': f'{base_url}/api/auth/login/',
            'data_sync': f'{base_url}/api/data/'
        }
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    data = request.data
    email = str(data.get('email', '')).lower().strip()
    username = str(data.get('username', '')).lower().strip()
    full_name = str(data.get('full_name', '')).strip()
    password = str(data.get('password', ''))

    if not email or not username or not password:
        return Response({'success': False, 'error': 'Please fill in all required fields.'}, status=status.HTTP_400_BAD_REQUEST)

    if CustomUser.objects.filter(email=email).exists():
        return Response({'success': False, 'error': 'Email address is already registered.'}, status=status.HTTP_400_BAD_REQUEST)

    if CustomUser.objects.filter(username=username).exists():
        return Response({'success': False, 'error': 'Username is already taken.'}, status=status.HTTP_400_BAD_REQUEST)

    if len(password) < 6:
        return Response({'success': False, 'error': 'Password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)

    otp_code = f'{secrets.randbelow(900000) + 100000}'
    user = CustomUser.objects.create_user(
        email=email,
        username=username,
        full_name=full_name,
        password=password,
        is_verified=True,
        verification_token=otp_code
    )

    refresh = RefreshToken.for_user(user)
    user_data = {
        'id': str(user.id),
        'full_name': user.full_name or full_name,
        'username': user.username,
        'email': user.email,
        'plan': 'Premium Plan',
        'is_verified': True
    }

    return Response({
        'success': True,
        'message': 'Account created successfully!',
        'user': user_data,
        'token': str(refresh.access_token),
        'requiresVerification': False
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    data = request.data
    email = str(data.get('email', '')).lower().strip()
    password = str(data.get('password', ''))

    if not email or not password:
        return Response({'success': False, 'error': 'Please enter both email address and password.'}, status=status.HTTP_400_BAD_REQUEST)

    user = CustomUser.objects.filter(email=email).first()

    if not user or not user.check_password(password) or not user.is_active:
        return Response({'success': False, 'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_verified:
        user.is_verified = True
        user.save()

    refresh = RefreshToken.for_user(user)

    user_data = {
        'id': str(user.id),
        'full_name': user.full_name or user.username or 'Varma Vegesna',
        'username': user.username,
        'email': user.email,
        'plan': 'Premium Plan',
        'is_verified': True
    }

    return Response({
        'success': True,
        'message': 'Login successful!',
        'user': user_data,
        'token': str(refresh.access_token)
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def social_auth_view(request):
    data = request.data
    provider = str(data.get('provider', 'google')).lower().strip()
    email = str(data.get('email', 'varmavegesna093@gmail.com')).lower().strip()
    full_name = str(data.get('full_name', 'Varma Vegesna')).strip()
    username = email.split('@')[0] if email else 'varma'

    user = CustomUser.objects.filter(email=email).first()
    if not user:
        # If username already taken by another account, append unique suffix
        if CustomUser.objects.filter(username=username).exists():
            username = f"{username}_{secrets.randbelow(900) + 100}"
        user = CustomUser.objects.create_user(
            email=email,
            username=username,
            full_name=full_name,
            password=secrets.token_urlsafe(32),
            is_verified=True
        )
    else:
        if not user.is_verified:
            user.is_verified = True
            user.save()

    refresh = RefreshToken.for_user(user)
    user_data = {
        'id': str(user.id),
        'full_name': user.full_name or full_name,
        'username': user.username,
        'email': user.email,
        'plan': 'Premium Plan',
        'is_verified': True,
        'provider': provider
    }

    return Response({
        'success': True,
        'message': f'Signed in successfully with {provider.capitalize()}!',
        'user': user_data,
        'token': str(refresh.access_token)
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_view(request):
    data = request.data
    email = data.get('email', '').lower().strip()
    otp_code = data.get('otpCode', '').strip()

    user = CustomUser.objects.filter(email=email).first()

    if not user:
        return Response({'success': False, 'error': 'User record not found.'}, status=status.HTTP_404_NOT_FOUND)

    if not otp_code or user.verification_token != otp_code:
        return Response({'success': False, 'error': 'Invalid 6-digit verification code.'}, status=status.HTTP_400_BAD_REQUEST)

    user.is_verified = True
    user.verification_token = None
    user.save()

    refresh = RefreshToken.for_user(user)

    user_data = {
        'id': str(user.id),
        'full_name': user.full_name or 'Varma Vegesna',
        'username': user.username,
        'email': user.email,
        'plan': 'Premium Plan',
        'is_verified': True
    }

    return Response({
        'success': True,
        'message': 'Email verified successfully!',
        'user': user_data,
        'token': str(refresh.access_token)
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_otp_view(request):
    email = request.data.get('email', '').lower().strip()
    user = CustomUser.objects.filter(email=email).first()

    if not user:
        return Response({'success': False, 'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    new_otp = f'{secrets.randbelow(900000) + 100000}'
    user.verification_token = new_otp
    user.save()

    return Response({
        'success': True,
        'message': 'If the account is eligible, a new verification code will be sent.'
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def data_sync_view(request):
    if request.method == 'GET':
        trading_data = UserTradingData.objects.filter(user=request.user).first()
        if trading_data and (trading_data.trades or trading_data.capital_logs):
            return Response({
                'trades': trading_data.trades or [],
                'capitalLogs': trading_data.capital_logs or [],
                'settings': trading_data.settings or {'currency': 'INR'},
                'source': 'usertradingdata'
            })

        # Fallback to relational Trade objects
        trades = TradeSerializer(Trade.objects.filter(user=request.user), many=True).data
        capital_logs = CapitalLogSerializer(CapitalLog.objects.filter(user=request.user), many=True).data
        journal = JournalEntrySerializer(JournalEntry.objects.filter(user=request.user), many=True).data

        return Response({
            'trades': trades,
            'capitalLogs': capital_logs,
            'journal': journal
        })

    elif request.method == 'POST':
        payload = request.data
        trade_items = payload.get('trades', [])
        capital_items = payload.get('capitalLogs', [])
        settings_data = payload.get('settings', {})

        if not isinstance(trade_items, list) or not isinstance(capital_items, list):
            return Response({'success': False, 'error': 'Invalid data payload.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Primary Authority: Save full JSON dataset in UserTradingData
        trading_data, _ = UserTradingData.objects.get_or_create(user=request.user)
        trading_data.trades = trade_items
        trading_data.capital_logs = capital_items
        if isinstance(settings_data, dict) and settings_data:
            trading_data.settings = settings_data
        trading_data.save()

        # 2. Secondary Sync: Safely update relational tables without blocking response
        try:
            trade_fields = {
                'tradeType': 'trade_type', 'entryDate': 'entry_date', 'entryPrice': 'entry_price',
                'exitPrice': 'exit_price', 'exitDate': 'exit_date', 'stopLoss': 'stop_loss',
                'targetPrice': 'target_price', 'chartUrl': 'chart_url', 'h1Bias': 'h1_bias',
                'm15Structure': 'm15_structure', 'm5EntryPoi': 'm5_entry_poi', 'm1BosChoch': 'm1_bos_choch'
            }
            with transaction.atomic():
                incoming_trade_ids = []
                for item in trade_items:
                    normalized = {trade_fields.get(key, key): value for key, value in item.items() if key not in {'user', 'ltfTrigger'}}
                    if normalized.get('id'):
                        try:
                            uuid.UUID(str(normalized['id']))
                        except ValueError:
                            normalized.pop('id')
                    if normalized.get('entry_date'):
                        normalized['entry_date'] = parse_datetime(str(normalized['entry_date']))
                    if normalized.get('exit_date'):
                        normalized['exit_date'] = parse_datetime(str(normalized['exit_date']))
                    instance = Trade.objects.filter(
                        user=request.user,
                        id=normalized.get('id')
                    ).first() if normalized.get('id') else None
                    serializer = TradeSerializer(instance=instance, data=normalized, partial=True)
                    if serializer.is_valid():
                        serializer.save(user=request.user)
                        incoming_trade_ids.append(serializer.instance.id)

                if incoming_trade_ids:
                    Trade.objects.filter(user=request.user).exclude(id__in=incoming_trade_ids).delete()
        except Exception:
            pass

        return Response({
            'success': True,
            'message': 'Data successfully saved to backend database.',
            'tradesCount': len(trade_items),
            'capitalLogsCount': len(capital_items)
        })
