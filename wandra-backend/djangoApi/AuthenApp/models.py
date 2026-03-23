from unittest.util import _MAX_LENGTH
from django.db import models

# Create your models here.
class LogIN(models.Model):
    UserId=models.AutoField(primary_key=True)
    UserName=models.CharField(max_length=100)
    UserPass=models.CharField(max_length=100)

class RegisterTable(models.Model):
    UserId=models.AutoField(primary_key=True)
    UserName=models.CharField(max_length=100)
    UserPass=models.CharField(max_length=100)
    UserEmail=models.CharField(max_length=100)


# profile picture -- image file
# username
# password
# first name
# last name
# gender
# birthday
# phone
# address
# email
# registration date
# booked tour names
# booked hotel names
class UploadProfileFile(models.Model):
    UserName = models.CharField(max_length=50)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    gender = models.CharField(max_length=50)
    birthday = models.CharField(max_length=50)
    phone = models.CharField(max_length=50)
    address = models.CharField(max_length=50)
    registrationDate = models.CharField(max_length=50)
    # title = models.CharField(max_length=50, blank=False)
    cover = models.FileField(blank=False, null=False)