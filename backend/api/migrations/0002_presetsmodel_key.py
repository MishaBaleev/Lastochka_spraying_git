# Generated by Django 4.0 on 2024-10-21 11:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='presetsmodel',
            name='key',
            field=models.CharField(default='key', max_length=20),
            preserve_default=False,
        ),
    ]
