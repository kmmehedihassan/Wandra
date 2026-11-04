from django.conf import settings
from django.db import models

# User accounts use Django's built-in auth User model (hashed passwords).
# First and last name live on the User; everything else is on Profile.


class Profile(models.Model):
    class Gender(models.TextChoices):
        FEMALE = 'Female', 'Female'
        MALE = 'Male', 'Male'
        OTHER = 'Other', 'Other'

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    gender = models.CharField(max_length=10, choices=Gender.choices, blank=True)
    birthday = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=200, blank=True)
    avatar = models.ForeignKey('MediaApp.StoredImage', null=True, blank=True, on_delete=models.SET_NULL,
                               related_name='+')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Profile of {self.user.username}'
