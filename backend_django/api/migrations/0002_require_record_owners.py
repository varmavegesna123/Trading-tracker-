from django.db import migrations, models
import django.db.models.deletion


def remove_orphaned_records(apps, schema_editor):
    Trade = apps.get_model('api', 'Trade')
    CapitalLog = apps.get_model('api', 'CapitalLog')
    JournalEntry = apps.get_model('api', 'JournalEntry')
    Trade.objects.filter(user__isnull=True).delete()
    CapitalLog.objects.filter(user__isnull=True).delete()
    JournalEntry.objects.filter(user__isnull=True).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(remove_orphaned_records, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='trade',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='trades', to='api.customuser'),
        ),
        migrations.AlterField(
            model_name='capitallog',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='capital_logs', to='api.customuser'),
        ),
        migrations.AlterField(
            model_name='journalentry',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='journal_entries', to='api.customuser'),
        ),
    ]