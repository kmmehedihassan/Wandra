from django.db import models

# Create your models here.


class Departments(models.Model):
    DepartmentId=models.AutoField(primary_key=True)
    DepartmentName=models.CharField(max_length=100)

class Employees(models.Model):
    EmployeeId= models.AutoField(primary_key=True)
    EmployeeName=models.CharField(max_length=100)
    Department=models.CharField(max_length=100)
    DateOfJoining=models.DateField()
    PhotoFileName=models.CharField(max_length=100)

def upload_path(instance, filname):
    return '/'.join(['covers', str(instance.title), filname])

class UploadFile(models.Model):
    title = models.CharField(max_length=32, blank=False)
    cover = models.FileField(blank=False, null=False)



class Modules(models.Model):
    module_name = models.CharField(max_length=50)
    module_duaration = models.IntegerField()
    class_room = models.IntegerField()

    def __str__(self):
        return self.module_name


class Students(models.Model):
    name = models.CharField(max_length=50)
    age = models.IntegerField()
    grade = models.IntegerField()
    modules = models.ManyToManyField(Modules)

    def __str__(self):
        return self.name

class MyHotelInfo(models.Model):
    room_id=models.IntegerField()
    hotel_id=models.IntegerField()
    roomquantity=models.IntegerField()
    remaining=models.IntegerField()

class MyReservation(models.Model):
    hotel_id=models.IntegerField(default=0)
    check_in = models.DateField()
    check_out = models.DateField()
    room = models.IntegerField()
    price=models.IntegerField(default=0)
    cardata=models.IntegerField(default=0)
    roomquantity=models.IntegerField(default=0)
    guest = models.CharField(max_length=50)


class MyTourInfo(models.Model):
    tour_id=models.IntegerField()
    month=models.IntegerField()
    tourquantity=models.IntegerField(default=0)


class MyTour(models.Model):
    tour_id=models.IntegerField()
    guest= models.CharField(max_length=50)
    ticket=models.IntegerField()
    price=models.IntegerField(default=0)
    cardata=models.IntegerField(default=0)
        
