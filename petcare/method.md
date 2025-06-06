USER
- **addUser(name, email, password, gender, role)**  Thêm người dùng mới và thêm `userid` vào bảng role tương ứng
- **deleteUser(userid)**  Xóa người dùng theo `userid`
- **getUserById(userid)**  Lấy thông tin người dùng theo `userid`
- **getAllUsers()**  Lấy danh sách tất cả người dùng
- **updateUser(userid, name, email, password, gender, role)**  Cập nhật thông tin người dùng theo `userid`

MANAGER
### Manager
- **getManagerById(id)**  Lấy thông tin Manager theo `id`
- **getAllManagers()**  Lấy danh sách tất cả Manager

### Ticket
- **createTicket(userid, subject, description, attachment)**  Tạo ticket mới do user gửi, trạng thái mặc định là "pending"
- **assignTicket(ticketid, managerid)**  Gán ticket cho Manager, cập nhật thời gian gán và trạng thái "solving" 
- **updateTicketResponse(ticketid, response, status)**  Manager cập nhật phản hồi (`response`) và trạng thái ticket 
- **getTicketById(ticketid)**  Lấy thông tin ticket theo `ticketid`
- **getAllTickets()**  Lấy danh sách tất cả ticke
- **getTicketsByUserId(userid)**  Lấy danh sách ticket theo `userid`
- **getTicketsByManagerId(managerid)**  Lấy danh sách ticket được gán theo `managerid`
- **deleteTicket(ticketid)**  Xóa ticket theo `ticketid`
- **updateTicket(ticketid, subject, description, attachment)**  Người dùng cập nhật ticket chưa được gán manager dai loai la managerid ko co

PETOWNER
- **updatePetOwner(userid, phone, city, address)**  Cập nhật thông tin `phone`, `city`, `address` của PetOwner theo `userid` 
- **getPetOwnerById(id)**  Lấy thông tin PetOwner theo `id`
- **getAllPetOwners()**  Lấy danh sách tất cả PetOwner

### Pet 
- **addPet(String name, String breed, String description, byte[] picture, int age, Date dob, int userid)**: Thêm một thú cưng mới vào cơ sở dữ liệu.
- **updatePet**: Cập nhật thông tin thú cưng theo `petid`.
- **deletePet(int petid)**: Xóa thú cưng khỏi cơ sở dữ liệu dựa trên `petid`.
- **getPetsByUserId(int userid)**: Lấy danh sách thú cưng thuộc về một người dùng cụ thể.

### Diet 
- **addDiet(String name, String amount, String description, int petid)**: Thêm thông tin chế độ ăn mới cho thú cưng.
- **getDietsByPetId(int petid)**: Lấy danh sách chế độ ăn của một thú cưng.
- **deleteDiet(int dietid)**: Xóa chế độ ăn khỏi cơ sở dữ liệu theo `dietid`.

### Activity 
- **addActivity(String name, String description, int petid)**: Thêm hoạt động mới cho thú cưng.
- **getActivitiesByPetId(int petid)**: Lấy danh sách hoạt động của thú cưng theo `petid`.
- **deleteActivity(int activityid)**: Xóa một hoạt động theo `activityid`.

### PetSchedule
- **addPetSchedule(Date startdate, String repeatOption, int hour, int minute, Integer dietid, Integer activityid)**: Thêm một lịch trình thú cưng mới.
- **getPetSchedulesByDietId(int dietid)**: Lấy danh sách lịch liên quan đến một chế độ ăn cụ thể.
- **getPetSchedulesByActivityId(int activityid)**: Lấy danh sách lịch liên quan đến một hoạt động cụ thể.
- **deletePetSchedule(int petscheduleid)**: Xóa lịch thú cưng theo ID.
- **updatePetSchedule(int petscheduleid, Date startdate, String repeatOption, int hour, int minute, Integer dietid, Integer activityid)**: Cập nhật lịch thú cưng.

### BOOKING
- **addBooking(int poid, int svid, Time slot, Date serveDate, String paymentMethod, String status)**: Thêm đặt lịch mới vào cơ sở dữ liệu.
- **addBookingPet(int bookid, int petid)**: Liên kết thú cưng vào đặt lịch.
- **getBookingsByPetOwner(int poid)**: Lấy danh sách tất cả đặt lịch của chủ thú cưng theo `poid`.
- **deleteBooking(int bookid)**: Xóa đặt lịch theo `bookid`.


### SERVICE
- **addServiceReport(int bookid, String text, byte[] image)**: Thêm báo cáo dịch vụ (service report) cho một booking.
- **getServiceReport(int bookid)**: Truy xuất báo cáo dịch vụ theo `bookid`.
- **addServiceReview(int bookid, int star, String comment)**: Thêm đánh giá của khách hàng cho dịch vụ đã đặt.
- **getServiceReview(int bookid)**: Lấy thông tin đánh giá dịch vụ theo booking.
- **addServiceUpdate(int bookid, int noUpdate, String text, byte[] image)**: Thêm một bản cập nhật tiến độ dịch vụ cho một booking.
- **getServiceUpdatesByBookId(int bookid)**: Lấy tất cả các cập nhật dịch vụ theo `bookid`, sắp xếp theo `no_update` tăng dần.


SERVICE PROVIDER
### Service Provider
- **updateServiceProvider(userid, businessName, logo, phone, description, address, website)** Cập nhật thông tin Service Provider dựa trên `userid`
- **updatePet(int petid, String name, String breed, String description, byte[] picture, int age, Date dob, int userid)** Lấy đối tượng `ServiceProvider` theo `id`
- **getAllServiceProviders()** Trả về danh sách tất cả các `ServiceProvider`

### ServiceType
- **addServiceType(type)** thêm loại dịch vụ mới, trả về ID mới hoặc -1 nếu lỗi  
- **updateServiceType(typeid, newType)**  cập nhật tên loại dịch vụ  
- **deleteServiceType(typeid)**  xóa loại dịch vụ theo ID  
- **getAllServiceTypes()** lấy danh sách tất cả loại dịch vụ  
- **getServiceTypeById(typeid)**  lấy loại dịch vụ theo ID

### Service
- **addService(name, price, description, duration, license, typeid, providerid)**  thêm dịch vụ mới, trả về serviceid hoặc -1 nếu lỗi  
- **updateService(serviceid, name, price, description, duration, license, typeid, providerid)**  cập nhật dịch vụ  
- **deleteService(serviceid)**  xóa dịch vụ theo ID  
- **getServiceById(serviceid)**  lấy dịch vụ theo ID  
- **getAllServices()** lấy danh sách tất cả dịch vụ  
- **getServicesByProviderId(providerid)** lấy danh sách dịch vụ của một nhà cung cấp cụ thể  
- **getServicesByTypeId(typeid)**  lấy danh sách dịch vụ theo loại

## TimeSlot
- **addTimeSlot(serviceid, slot)** thêm khung giờ cho dịch vụ  
- **deleteTimeSlot(serviceid, slot)**  xóa khung giờ  
- **getTimeSlotsByServiceId(serviceid)**  lấy danh sách các khung giờ theo dịch vụ

NOTIFICATIONS
- **addNotification(int userid, String text)** thêm thông báo
- **getNotificationsByUserId(int userid)** lấy thông báo 
- **deleteNotificationByNotiId(int notiid)**    xóa thông báo the `notiid`
- **deleteNotificationsByUserId(int userid)**   xóa thông báo theo `user`
- **updateNotification(int notiid, String newText)** cập nhật lại(nếu cần)

SCHEDULE
- **addSchedule(Timestamp scheduledTime, String tittle, String detail, int userid)**: Thêm lịch mới vào cơ sở dữ liệu.
- **updateSchedule(int scheduleid, Timestamp scheduledTime, String tittle, String detail, int userid)**: Cập nhật thông tin lịch đã có dựa vào `scheduleid`.
- **deleteSchedule(int scheduleid)**: Xóa một lịch khỏi cơ sở dữ liệu bằng `scheduleid`.
- **getSchedulesByUserId(int userid)**: Truy xuất danh sách các lịch theo `userid`.
