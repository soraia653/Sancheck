from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    pass

class SavedParks(models.Model):
    class Meta:
        verbose_name_plural = 'Saved Parks'

    user_id = models.ForeignKey(User, on_delete= models.CASCADE)
    park_id = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"User {self.user_id} stored park ID {self.park_id} in their favourites."

class ParkTag(models.Model):

    class Meta:
        verbose_name_plural = 'Park Tags'

    tag_name = models.CharField(max_length=255)
    park_id = models.CharField(max_length=255)
    num_upvotes = models.ManyToManyField(User, related_name='tag_upvotes')

    def serialize(self):
        return {
            "id": self.id,
            "park_id": self.park_id,
            "tag": self.tag_name,
            "upvotes": self.num_upvotes.count()
        }

    def __str__(self):
        return f"{self.tag_name} given to park ID {self.park_id}."