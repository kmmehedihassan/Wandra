from django.db import models

# Create your models here.
#  id: 1,
#             Author: "Fahim",
#             title: "My First Post",
#             datetime: "July 01, 2021 03:17:36 PM",
#             date: "8",
#             month: "NOVEM",
#             likes: 3,
#             catagory: [
#                 {
#                     "categoryName": "Music"
#                 }],
#             imgLink: false,
#             imgOrVideoLink: "http://techslides.com/demos/sample-videos/small.ogv",
#             comments: 3,
#             body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis consequatur expedita, assumenda similique non optio! Modi nesciunt excepturi corrupti atque blanditiis quo nobis, non optio quae possimus illum exercitationem ipsa!",
class UploadPostFile(models.Model):
    PostId=models.IntegerField()
    Author = models.CharField(max_length=50)
    title = models.CharField(max_length=50, blank=False)
    cover = models.FileField(blank=False, null=False)

class Categories(models.Model):
    categoryName = models.CharField(max_length=50)
    category_used= models.IntegerField(default=0)
    # class_room = models.IntegerField()

    def __str__(self):
        return self.module_name

class AllPost(models.Model):
    id=models.AutoField(primary_key=True)
    Author = models.CharField(max_length=50)
    title = models.CharField(max_length=50)
    datetime = models.CharField(max_length=50)
    date = models.CharField(max_length=50)
    month = models.CharField(max_length=50)
    likes = models.IntegerField()
    catagory = models.ManyToManyField(Categories)
    imgLink=models.BooleanField()
    imgOrVideoLink=models.URLField()
    comments=models.IntegerField()
    body=models.CharField(max_length=50)


    def __str__(self):
        return self.name