import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=150, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=6, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'full_name']

    def __str__(self):
        return f"{self.email} ({self.username})"


class Trade(models.Model):
    DIRECTION_CHOICES = [('LONG', 'Long'), ('SHORT', 'Short')]
    STATUS_CHOICES = [('OPEN', 'Open'), ('CLOSED', 'Closed')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='trades')
    symbol = models.CharField(max_length=20)
    direction = models.CharField(max_length=5, choices=DIRECTION_CHOICES, default='LONG')
    trade_type = models.CharField(max_length=20, default='Intraday')
    market = models.CharField(max_length=20, default='Equity')
    exchange = models.CharField(max_length=20, default='NSE')

    entry_date = models.DateTimeField()
    entry_price = models.DecimalField(max_digits=14, decimal_places=2)
    quantity = models.DecimalField(max_digits=14, decimal_places=2)

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='CLOSED')
    exit_price = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    exit_date = models.DateTimeField(null=True, blank=True)
    stop_loss = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    target_price = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)

    strategy = models.CharField(max_length=100, default='SMC Order Block')
    notes = models.TextField(blank=True, null=True)
    chart_url = models.TextField(blank=True, null=True)

    # Confluences
    h1_bias = models.BooleanField(default=False)
    m15_structure = models.BooleanField(default=False)
    m5_entry_poi = models.BooleanField(default=False)
    m1_bos_choch = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)


class CapitalLog(models.Model):
    TYPE_CHOICES = [('DEPOSIT', 'Deposit'), ('WITHDRAWAL', 'Withdrawal')]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='capital_logs')
    type = models.CharField(max_length=15, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)


class JournalEntry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='journal_entries')
    title = models.CharField(max_length=200)
    content = models.TextField()
    date = models.DateField(auto_now_add=True)
