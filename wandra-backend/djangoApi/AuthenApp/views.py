from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from django.http.response import JsonResponse

from AuthenApp.models import LogIN,RegisterTable,UploadProfileFile
from AuthenApp.serializers import LogInSerializer,RegisterSerializer,UploadProfileFileSerializer
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status

# Create your views here.
@api_view(['GET','POST','PUT','DELETE'])
@csrf_exempt
def LogInApi(request,id=0):
    if request.method=='GET':
        login_data=LogIN.objects.all()
        # userName=LogIN.objects.filter(UserName__icontains=Name)
        
        username=request.query_params.get('username',None)
        userpass=request.query_params.get('userpass',None)
        # if username is not None:
            # login_data=login_data.filter(UserName__icontains=username)
        lcheck=userpass
        if username is not None and userpass is not None:
            login_data=login_data.raw('select * from AuthenApp_login where UserPass=%s and UserName=%s',[lcheck,username])
        
        login_serializer=LogInSerializer(login_data,many=True)
        return JsonResponse(login_serializer.data,safe=False)
    elif   request.method=='POST':
        login_data=JSONParser().parse(request)
        
        print(login_data['UserName'])
        login_serializer=LogInSerializer(data=login_data)
        if login_serializer.is_valid():
            login_serializer.save()
            return JsonResponse('Added Successfull',safe=False)
        return JsonResponse('failed to add',safe=False)
    elif request.method=='PUT':
        login_data=JSONParser().parse(request)
        login_specific_data=LogIN.objects.get( UserName=login_data['UserName'])
        login_serializer=LogInSerializer(login_specific_data,data=login_data)
        if login_serializer.is_valid():
            login_serializer.save()
            return JsonResponse('Update Successfull',safe=False)
        return JsonResponse('failed to Update',safe=False)
    elif request.method=='DELETE':
        login_data=LogIN.objects.get(UserId=id)
        login_data.delete()
        return JsonResponse('Deleted Successfull',safe=False)


@api_view(['GET','POST','PUT','DELETE'])
@csrf_exempt
def RegisterApi(request,id=0):
    if request.method=='GET':
        register_data=RegisterTable.objects.all()
        reg=RegisterTable.UserPass
        temp=register_data.raw('select * from AuthenApp_registertable')
        # userName=LogIN.objects.filter(UserName__icontains=Name)
        # print(register_data.__dict__)
        
        username=request.query_params.get('username',None)
        userpass=request.query_params.get('userpass',None)
        # print(username+" "+userpass)
        # if username is not None:
            # login_data=login_data.filter(UserName__icontains=username)
        lcheck=userpass
        if username is not None and userpass is not None:
            print("Register is called")
            register_data=register_data.raw('select * from AuthenApp_registertable where UserPass=%s and UserName=%s',[lcheck,username])
                
        
        register_serializer=RegisterSerializer(register_data,many=True)
        # temp=register_serializer.data.__dict__['serializer']
        # print(temp[])
        # for x in temp:
        #     print (x)
        print(reg)
        return JsonResponse(register_serializer.data,safe=False)
    elif   request.method=='POST':
        register_data=JSONParser().parse(request)
        register_serializer=RegisterSerializer(data=register_data)
        if register_serializer.is_valid():
            register_serializer.save()
            return JsonResponse('Added Successfull',safe=False)
        return JsonResponse('failed to add',safe=False)
    elif request.method=='PUT':
        register_data=JSONParser().parse(request)
        register_specific_data=RegisterTable.objects.get(UserId=register_data['UserId'])
        register_serializer=RegisterSerializer(register_specific_data,data=register_data)
        if register_serializer.is_valid():
            register_serializer.save()
            return JsonResponse('Update Successfull',safe=False)
        return JsonResponse('failed to Update',safe=False)
    elif request.method=='DELETE':
        register_data=RegisterTable.objects.get(UserId=id)
        register_data.delete()
        return JsonResponse('Deleted Successfull',safe=False)


class ProfileFileView(APIView):
  parser_classes = (MultiPartParser, FormParser)
  def get(self,request):
    username=request.query_params.get('username',None)
    print(username)
    if(username != None):
        imgobj = UploadProfileFile.objects.filter(UserName__icontains=username)     
    else:
        imgobj = UploadProfileFile.objects.all()
    
    serializer = UploadProfileFileSerializer(imgobj, many=True, context= 
        {'request': request})

    return JsonResponse(serializer.data ,safe=False)

    # return Response({
    #         'status' : True,
    #         'message' : 'Image List',
    #         'images' : serializer.data})

  def post(self, request, *args, **kwargs):
    profile_data=request.data
    print(profile_data)
    file_serializer = UploadProfileFileSerializer(data=request.data)
    if file_serializer.is_valid():
      print(file_serializer.error_messages)
      file_serializer.save()
      return JsonResponse(file_serializer.data, status=status.HTTP_201_CREATED)
    else:
      return JsonResponse(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
   
   
  def patch(self, request, *args, **kwargs):
    profile_data=request.data
    profile_specific_data=UploadProfileFile.objects.get(UserName=profile_data['UserName'])
    profile_serializer=UploadProfileFileSerializer(profile_specific_data,data=profile_data)
    if profile_serializer.is_valid():
        profile_serializer.save()
        return JsonResponse('Update Sucess',safe=False)
    return JsonResponse('Fail',safe=False)   

  def delete(self, request, *args, **kwargs):
    profile_data=request.data
    profile_specific_data=UploadProfileFile.objects.filter(UserName=profile_data['UserName'])
    for obj in profile_specific_data:
        obj.delete()
        return JsonResponse('Update Sucess',safe=False)
    return JsonResponse('Fail',safe=False)   





