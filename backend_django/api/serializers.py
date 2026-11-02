from rest_framework import serializers
from .models import CustomUser, Trade, CapitalLog, JournalEntry

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'full_name', 'is_verified', 'created_at']

class TradeSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        entry_price = attrs.get('entry_price', getattr(self.instance, 'entry_price', None))
        quantity = attrs.get('quantity', getattr(self.instance, 'quantity', None))
        status_value = attrs.get('status', getattr(self.instance, 'status', 'CLOSED'))
        exit_price = attrs.get('exit_price', getattr(self.instance, 'exit_price', None))
        direction = attrs.get('direction', getattr(self.instance, 'direction', 'LONG'))
        stop_loss = attrs.get('stop_loss', getattr(self.instance, 'stop_loss', None))
        target_price = attrs.get('target_price', getattr(self.instance, 'target_price', None))

        if entry_price is None or entry_price <= 0:
            raise serializers.ValidationError({'entry_price': 'Entry price must be greater than zero.'})
        if quantity is None or quantity <= 0:
            raise serializers.ValidationError({'quantity': 'Quantity must be greater than zero.'})
        if status_value == 'CLOSED' and (exit_price is None or exit_price <= 0):
            raise serializers.ValidationError({'exit_price': 'Closed trades require a positive exit price.'})
        if status_value == 'OPEN' and exit_price is not None:
            raise serializers.ValidationError({'exit_price': 'Open trades cannot have an exit price.'})

        if stop_loss is not None:
            valid_stop = stop_loss < entry_price if direction == 'LONG' else stop_loss > entry_price
            if not valid_stop:
                raise serializers.ValidationError({'stop_loss': 'Stop loss must be beyond the entry in the trade direction.'})
        if target_price is not None:
            valid_target = target_price > entry_price if direction == 'LONG' else target_price < entry_price
            if not valid_target:
                raise serializers.ValidationError({'target_price': 'Target price must be beyond the entry in the trade direction.'})
        return attrs

    class Meta:
        model = Trade
        fields = '__all__'

class CapitalLogSerializer(serializers.ModelSerializer):
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Capital amount must be greater than zero.')
        return value

    class Meta:
        model = CapitalLog
        fields = '__all__'

class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = '__all__'
