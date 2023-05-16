from django.db import models
import uuid
# Create your models here.


class Room(models.Model):
    code = models.UUIDField(null=False, unique=True)
    host = models.CharField(max_length=64, unique=True)
    guest_can_pause = models.BooleanField(null=False, default=False)
    vote_to_skip = models.IntegerField(null=False, default=1)
    created_at = models.DateTimeField(auto_now_add=True)
