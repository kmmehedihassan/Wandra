from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from django.http.response import JsonResponse
from rest_framework.parsers import MultiPartParser, FormParser
from PostsApp.models import Categories,AllPost,UploadPostFile
from PostsApp.serializers import CategoriesSerializer,AllPostSerializer,UploadPostFileSerializer
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status,viewsets
# Create your views here.


class AllPostViewSet(APIView):
    
    
    serializer_class = AllPostSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get(self,request,Id=0):
        print(Id)
        Title=request.query_params.get('username',None)
        if(Id != None and Id != 0):
            post=AllPost.objects.filter(id=Id)
        elif(Title!=None):
            post=AllPost.objects.filter(Author=Title)
        else:    
            post = AllPost.objects.all()
            
        # student = Students.objects.all()

        allpost_serializer=AllPostSerializer(post,many=True)
                
        return JsonResponse(allpost_serializer.data,safe=False)

    def post(self, request):
        post_data =JSONParser().parse(request)
        new_post = AllPost.objects.create(
             Author=post_data['Author'], title=post_data['title'],
            datetime=post_data["datetime"], date=post_data['date'], month=post_data["month"],
            likes=post_data["likes"], imgLink=post_data['imgLink'], imgOrVideoLink=post_data["imgOrVideoLink"],
            comments=post_data["comments"], body=post_data['body']

            )

        new_post.save()

        for cat in post_data["catagory"]:
            print(cat)
            cat_obj = Categories.objects.get(categoryName=cat["categoryName"])
            new_post.catagory.add(cat_obj)

        serializer = AllPostSerializer(new_post)

        return Response(serializer.data)

    def delete(self,request,ID):
        post_data=AllPost.objects.get(id=ID)
        post_data.delete()
        return JsonResponse("Deleted Succeffully!!", safe=False)


class CategoriesViewSet(APIView):
    serializer_class = CategoriesSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get(self,request):
        categories= Categories.objects.all()
        categories_serializer=CategoriesSerializer(categories,many=True)
        return Response(categories_serializer.data)

    def post(self, request):
        categories_data =JSONParser().parse(request)
        new_category = Categories.objects.create(categoryName=categories_data["categoryName"])
        new_category.save()
        categories_serializer=CategoriesSerializer(categories_data)
        
        return Response(categories_serializer.data)


class PostsFileView(APIView):
  parser_classes = (MultiPartParser, FormParser)
  def get(self,request):
    Title=request.query_params.get('title',None)
    print(Title)
    if(Title == None):
        imgobj = UploadPostFile.objects.all()
    else:
        imgobj = UploadPostFile.objects.filter(title__in=(Title,"test") )     
    
    serializer = UploadPostFileSerializer(imgobj, many=True, context= 
        {'request': request})

    return JsonResponse(serializer.data ,safe=False)

    # return Response({
    #         'status' : True,
    #         'message' : 'Image List',
    #         'images' : serializer.data})

  def post(self, request, *args, **kwargs):
    # dataF=FormParser(request.data)
    # print(request.data['Author'])
    
    file_serializer = UploadPostFileSerializer(data=request.data)
    # file_obj=UploadPostFile.objects.create(Author=request.data['Author'],PostId=)
    # file_obj.save()
    print(file_serializer.is_valid())
    if file_serializer.is_valid():
      file_serializer.save()
      return Response(file_serializer.data, status=status.HTTP_201_CREATED)
    else:
      return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
