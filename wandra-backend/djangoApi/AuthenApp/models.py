from django.db import models

# User accounts use Django's built-in auth User model (hashed passwords).
# The old plaintext LogIN / RegisterTable models were removed; see migration 0004.


class UploadProfileFile(models.Model):
    # Username of the owning django.contrib.auth User; set server-side from the
    # authenticated request, never from client input.
    UserName = models.CharField(max_length=50)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    gender = models.CharField(max_length=50)
    birthday = models.CharField(max_length=50)
    phone = models.CharField(max_length=50)
    address = models.CharField(max_length=50)
    registrationDate = models.CharField(max_length=50)
    cover = models.FileField(blank=False, null=False)
