# Generated by Django 4.0 on 2023-01-31 14:31

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sancheck', '0002_remove_upvotetag_park_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='parktag',
            name='num_upvotes',
            field=models.ManyToManyField(related_name='tag_upvotes', to=settings.AUTH_USER_MODEL),
        ),
        migrations.DeleteModel(
            name='UpvoteTag',
        ),
    ]
