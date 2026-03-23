from rest_framework import serializers
from PostsApp.models import Categories,AllPost,UploadPostFile

class CategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categories
        fields = '__all__'



class AllPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = AllPost
        fields = '__all__'
        depth = 1
    
    def get_queryset(self):
        post = AllPost.objects.all()
        return post


class UploadPostFileSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = UploadPostFile
        fields = ['PostId','Author','title', 'cover']
    
    # def get_queryset(self):
