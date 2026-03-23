from turtle import title
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from django.http.response import JsonResponse
from rest_framework.parsers import MultiPartParser, FormParser
from EmployeeApp.models import Departments, Employees,UploadFile,Students,Modules,MyReservation,MyHotelInfo,MyTourInfo,MyTour
from EmployeeApp.serializers import DepartmentSerializer,EmployeeSerializer,BookSerializer,StudentsSerializer,ModulesSerializer,MyReservationSerializer,MyHotelInfoSerializer,MyTourInfoSerializer,MyTourSerializer
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status,viewsets
from django.utils.dateparse import parse_date
from django.core.files.storage import default_storage
from django.forms.models import model_to_dict
import json
# Create your views here.

@csrf_exempt
def departmentApi(request,id=0):
    if request.method=='GET':
        departments=Departments.objects.all()
        departments_serializer=DepartmentSerializer(departments,many=True)
        return JsonResponse(departments_serializer.data,safe=False)
    elif   request.method=='POST':
        department_data=JSONParser().parse(request)
        department_serializer=DepartmentSerializer(data=department_data)
        if department_serializer.is_valid():
            department_serializer.save()
            return JsonResponse('Added Successfull',safe=False)
        return JsonResponse('failed to add',safe=False)
    elif request.method=='PUT':
        department_data=JSONParser().parse(request)
        department=Departments.objects.get(DepartmentId=department_data['DepartmentId'])
        department_serializer=DepartmentSerializer(department,data=department_data)
        if department_serializer.is_valid():
            department_serializer.save()
            return JsonResponse('Update Successfull',safe=False)
        return JsonResponse('failed to Update',safe=False)
    elif request.method=='DELETE':
        department=Departments.objects.get(DepartmentId=id)
        department.delete()
        return JsonResponse('Deleted Successfull',safe=False)

@csrf_exempt
def employeeApi(request,id=0):
    if request.method=='GET':
        employees = Employees.objects.all()
        employees_serializer = EmployeeSerializer(employees, many=True)
        return JsonResponse(employees_serializer.data, safe=False)

    elif request.method=='POST':
        employee_data=JSONParser().parse(request)
        employee_serializer = EmployeeSerializer(data=employee_data)
        if employee_serializer.is_valid():
            employee_serializer.save()
            return JsonResponse("Added Successfully!!" , safe=False)
        return JsonResponse("Failed to Add.",safe=False)
    
    elif request.method=='PUT':
        employee_data = JSONParser().parse(request)
        employee=Employees.objects.get(EmployeeId=employee_data['EmployeeId'])
        employee_serializer=EmployeeSerializer(employee,data=employee_data)
        if employee_serializer.is_valid():
            employee_serializer.save()
            return JsonResponse("Updated Successfully!!", safe=False)
        return JsonResponse("Failed to Update.", safe=False)

    elif request.method=='DELETE':
        employee=Employees.objects.get(EmployeeId=id)
        employee.delete()
        return JsonResponse("Deleted Succeffully!!", safe=False)



@csrf_exempt
def SaveFile(request):
    file=request.FILES['myFile']
    file_name = default_storage.save(file.name,file)

    return JsonResponse(file_name,safe=False)


class FileView(APIView):
  parser_classes = (MultiPartParser, FormParser)
  def get(self,request):
    Title=request.query_params.get('title',None)
    print(Title)
    if(Title is not None):
        imgobj = UploadFile.objects.filter(title__in=(Title,"test") )
        
    else:
        imgobj = UploadFile.objects.all()
    
    serializer = BookSerializer(imgobj, many=True, context= 
        {'request': request})

    return JsonResponse(serializer.data ,safe=False)

    # return Response({
    #         'status' : True,
    #         'message' : 'Image List',
    #         'images' : serializer.data})

  def post(self, request, *args, **kwargs):
    file_serializer = BookSerializer(data=request.data)
    if file_serializer.is_valid():
      file_serializer.save()
      return Response(file_serializer.data, status=status.HTTP_201_CREATED)
    else:
      return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentsViewSet(APIView):
    
    
    serializer_class = StudentsSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get(self,request,Id=0):
        print(Id)
        if(Id is not None and Id is not 0):
            student=Students.objects.filter(id=Id)
        else:    
            student = Students.objects.all()
            
        # student = Students.objects.all()

        student_serializer=StudentsSerializer(student,many=True)
                
        return JsonResponse(student_serializer.data,safe=False)

    def post(self, request):
        student_data =JSONParser().parse(request)

        new_student = Students.objects.create(
            name=student_data["name"], age=student_data['age'], grade=student_data["grade"])

        new_student.save()

        for module in student_data["modules"]:
            print(module)
            module_obj = Modules.objects.get(module_name=module["module_name"])
            new_student.modules.add(module_obj)

        serializer = StudentsSerializer(new_student)

        return Response(serializer.data)
        # student_serializer = StudentsSerializer(data=student_data)
        # if student_serializer.is_valid():
        #     student_serializer.save()
        #     return JsonResponse("Added Successfully!!" , safe=False)
        # return JsonResponse("Failed to Add.",safe=False)
    


class ModulesViewSet(APIView):
    serializer_class = ModulesSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get(self,request):
        module = Modules.objects.all()
        module_serializer=ModulesSerializer(module,many=True)
        return Response(module_serializer.data)

@csrf_exempt
def confirm(request, pk = None):
    
    if request.method == 'GET':
        print(type(pk))
        if pk == str(5):
            Booking_data=JSONParser().parse(request)
            roomquantity= Booking_data['roomquantity']
            check_in=Booking_data['check_in']
            check_out=Booking_data['check_out']
            new_obj=MyReservation.objects.all()
            new_dict=MyReservationSerializer(new_obj,many=True)
            print(type(new_dict))

        if pk == str(6):
                
            employees = MyTourInfo.objects.all()
            employees_serializer = MyTourInfoSerializer(employees, many=True)
            return JsonResponse(employees_serializer.data, safe=False)
        if pk == str(7):
            booking = MyTour.objects.all()
            Booking_serializer = MyTourSerializer(booking, many=True)
            return JsonResponse(Booking_serializer.data, safe=False)
        if pk == str(8):
            Booking_data=JSONParser().parse(request)
            guest=Booking_data['guest']
            booking = MyReservation.objects.filter(guest=Booking_data['guest'])
            Booking_serializer = MyReservationSerializer(booking, many=True)
            return JsonResponse(Booking_serializer.data, safe=False)
            # pass
        if pk == str(9):
            Booking_data=JSONParser().parse(request)
            guest=Booking_data['guest']
            booking = MyTour.objects.all()
            Booking_serializer = MyTourSerializer(booking, many=True)
            return JsonResponse(Booking_serializer.data, safe=False)
            pass
        if pk == str(10):
            # return
            # print(json.loads(request.body))
            # print(type(request.body ))
            # Booking_data=request.GET
            Title=request.GET.get('price')
            print('The tiltle of the guest',Title)
            print (request.GET)
            print(type(request))
            # Booking_data=JSONParser().parse(request.GET)
            # ser=MyReservationSerializer(data=Booking_data)

        #   print(temp_obj['Bookdata'])
        #   Booking_data=temp_obj['Bookdata']
            # print(ser)
            # print(Booking_data)
          
        #   Booking_data=JSONParser.__dir__(request.body)
        #   print(Booking_data[0])
            hotel_id=request.GET.get('hotel_id')
            roomquantity= request.GET.get('roomquantity')
            room=request.GET.get('room')
            guest=request.GET.get('guest')
            check_in=request.GET.get('check_in')
            check_out=request.GET.get('check_out')
            price=request.GET.get('price')
            cardata=request.GET.get('cardata')

            total_quantity_on_a_date=0

            new_obj= MyReservation.objects.filter(room=room,hotel_id=hotel_id, check_in__gte=check_in, check_out__lte=check_out)

            for obj in new_obj:
                  total_quantity_on_a_date+=obj.roomquantity


            print(total_quantity_on_a_date)
            total_quantity_on_a_date+=int(roomquantity)

            gret_obj=MyReservation.objects.filter(room=room,hotel_id=hotel_id, check_in__lt=check_in) | MyReservation.objects.filter(room=room,hotel_id=hotel_id, check_out__gt=check_out) | MyReservation.objects.filter(room=room,hotel_id=hotel_id, check_in__gte=check_in, check_out__lte=check_out)
            for obj in gret_obj:
                print(f'total quantity {obj.check_in} {obj.check_out} {obj.roomquantity} ')
                if (obj.check_in<=parse_date(check_in) and obj.check_out>=parse_date(check_in)) or (obj.check_in<=parse_date(check_out) and obj.check_out>=parse_date(check_out)): 
                   print('inside fthe fun')
                   total_quantity_on_a_date+=obj.roomquantity   
            Hotel_Obj=MyHotelInfo.objects.get(room_id=request.GET.get('room'),hotel_id=request.GET.get('hotel_id'))
            
            print('Between the room total quantity :',total_quantity_on_a_date)
            print('Hotel room highest quantity :',Hotel_Obj.roomquantity)
            # print(Hotel_Obj.remaining)
            if(total_quantity_on_a_date<=Hotel_Obj.roomquantity):
                  return JsonResponse({"msg":"Success"},safe=status.HTTP_202_ACCEPTED)
            else:
               return JsonResponse({"msg":"Room quantity no available"},safe=status.HTTP_404_NOT_FOUND)

        else:  
            booking = MyReservation.objects.all()
            Booking_serializer = MyReservationSerializer(booking, many=True)
            return JsonResponse(Booking_serializer.data, safe=False)

    elif request.method=='DELETE':
        if pk==str(9):
            Booking_data=JSONParser().parse(request)
            booking=MyTour.objects.get(
                tour_id=Booking_data['tour_id'],
                ticket= Booking_data['ticket'],
                guest=Booking_data['guest'],
                price=Booking_data['price'],
                cardata=Booking_data['cardata']                
            )
            booking.delete()
            return JsonResponse("Deleted Succeffully!!", safe=False)

            # pass
        if pk==str(8):
            Booking_data=JSONParser().parse(request)
            booking=MyReservation.objects.get(
                hotel_id=Booking_data['hotel_id'],
                roomquantity= Booking_data['roomquantity'],
                room=Booking_data['room'],
                guest=Booking_data['guest'],
                check_in=Booking_data['check_in'],
                check_out=Booking_data['check_out'],
                price=Booking_data['price'],
                cardata=Booking_data['cardata']

            )
            booking.delete()
            return JsonResponse("Deleted Succeffully!!", safe=False)

            # pass
        
        else:
            booking=MyReservation.objects.all()
            booking.delete()
            return JsonResponse("Deleted Succeffully!!", safe=False)


    if request.method == 'POST':
        #     tour_id=models.IntegerField()
        # guest= models.CharField(max_length=50)
        # ticket=models.IntegerField()
        # price=models.IntegerField(default=0)
        # cardata=models.IntegerField(default=0)
        
        if pk ==str(6):
            Booking_data=JSONParser().parse(request)
            tour_id=Booking_data['tour_id']
            ticket= Booking_data['ticket']
            guest=Booking_data['guest']
            price=Booking_data['price']
            cardata=Booking_data['cardata']
            total_ticket=0
            total_ticket+=int(ticket)
            reservation = MyTour(
             ticket=ticket,
             guest = guest,
             tour_id=tour_id,
            #  roomquantity=roomquantity,
             price=price,
             cardata=cardata

             )
            tour_obj=MyTourInfo.objects.get(tour_id=Booking_data['tour_id'])
            new_obj=MyTour.objects.filter(tour_id=Booking_data['tour_id'])
            for obj in new_obj:
                total_ticket+=obj.ticket

            if (total_ticket<=tour_obj.tourquantity):
                reservation.save()
                return JsonResponse({"msg":"Success"})
            else:
                return JsonResponse('Ticket not available',safe=False)
            
            

            
        elif pk:
            invalid_dates= False
            Booking_data=JSONParser().parse(request)
            print(Booking_data) 
            hotel_id=Booking_data['hotel_id']
            roomquantity= Booking_data['roomquantity']
            room=Booking_data['room']
            guest=Booking_data['guest']
            check_in=Booking_data['check_in']
            check_out=Booking_data['check_out']
            price=Booking_data['price']
            cardata=Booking_data['cardata']


            total_quantity_on_a_date=0
            new_obj= MyReservation.objects.filter(room=room,hotel_id=hotel_id, check_in__gte=check_in, check_out__lte=check_out)
            print(new_obj)
            for obj in new_obj:
                total_quantity_on_a_date+=obj.roomquantity
            print(total_quantity_on_a_date)
            total_quantity_on_a_date+=int(roomquantity)
            print("On this day total quantity")
            print(total_quantity_on_a_date)
            gret_obj=MyReservation.objects.filter(room=room,hotel_id=hotel_id, check_in__lt=check_in) | MyReservation.objects.filter(room=room,hotel_id=hotel_id, check_out__gt=check_out) | MyReservation.objects.filter(room=room,hotel_id=hotel_id, check_in__gt=check_in, check_out__lt=check_out)
            for obj in gret_obj:
                print(f'total quantity {obj.check_in} {obj.check_out}  ')
                if (obj.check_in<=parse_date(check_in) and obj.check_out>=parse_date(check_in)) or (obj.check_in<=parse_date(check_out) and obj.check_out>=parse_date(check_out)): 
                    print('isnside fthe fun')
                    total_quantity_on_a_date+=obj.roomquantity
            
            print("Between this day total quantity")
            print(total_quantity_on_a_date)

            case_2 = MyReservation.objects.filter(room=room,hotel_id=hotel_id, check_in__lte=check_out, check_out__gte=check_out).exists()
            case_1 = MyReservation.objects.filter(room=room,hotel_id=hotel_id, check_in__lte=check_in, check_out__gte=check_in).exists()
            case_3 = MyReservation.objects.filter(room=room,hotel_id=hotel_id, check_in__gte=check_in, check_out__lte=check_out).exists()
            # print(case_1+case_2+case_3)

            reservation = MyReservation(
             check_in = check_in, 
             check_out = check_out,
             room = room,
             guest = guest,
             hotel_id=hotel_id,
             roomquantity=roomquantity,
             price=price,
             cardata=cardata

             )
            
            Hotel_Obj=MyHotelInfo.objects.get(room_id=Booking_data['room'],hotel_id=Booking_data['hotel_id'])
            print(Hotel_Obj.roomquantity)
            # print(Hotel_Obj.remaining)
            if(total_quantity_on_a_date<=Hotel_Obj.roomquantity):
                Hotel_Obj.remaining+=1
                Hotel_Obj.save()
                reservation.save()
                return JsonResponse({"msg":"Success"})
            else:
                if case_1 or case_2 or case_3 :
                    return JsonResponse( {"errors": "This room is not available on your selected dates"})

                return JsonResponse('Room quantity no available',safe=False)

            



@csrf_exempt
def MyHotelApi(request,id=0):
    if request.method=='GET':
        Hotels=MyHotelInfo.objects.all()
        Hotel_serializer=MyHotelInfoSerializer(Hotels,many=True)
        return JsonResponse(Hotel_serializer.data,safe=False)
    elif   request.method=='POST':
        if id==str(6): 
            print("inside")    
            Hotel_data=JSONParser().parse(request)
            Hotel_serializer=MyTourInfoSerializer(data=Hotel_data)
            if Hotel_serializer.is_valid():
                Hotel_serializer.save()
                return JsonResponse('Added Successfull',safe=False)
            return JsonResponse('failed to add',safe=False)
        else:    
            Hotel_data=JSONParser().parse(request)
            Hotel_serializer=MyHotelInfoSerializer(data=Hotel_data)
            if Hotel_serializer.is_valid():
                Hotel_serializer.save()
                return JsonResponse('Added Successfull',safe=False)
            return JsonResponse('failed to add',safe=False)

    elif request.method=='PATCH':
        Hotel_data=JSONParser().parse(request)
        Hotel_Obj=MyHotelInfo.objects.get(room_id=Hotel_data['room_id'],hotel_id=Hotel_data['hotel_id'])
        print(Hotel_Obj.roomquantity)
        print(Hotel_Obj.remaining)
        if(Hotel_Obj.remaining<=30):
            Hotel_Obj.roomquantity=3
            Hotel_Obj.save()
            # Hotel_serializer=MyHotelInfoSerializer(Hotel_Obj,data=Hotel_Obj)
            # if profile_serializer.is_valid():
            #     profile_serializer.save()
            return JsonResponse('Update Sucess',safe=False)
    return JsonResponse('Fail',safe=False) 