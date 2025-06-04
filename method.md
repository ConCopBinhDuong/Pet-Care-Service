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

SERVICE PROVIDER
### Service Provider
- **updateServiceProvider(userid, businessName, logo, phone, description, address, website)** Cập nhật thông tin Service Provider dựa trên `userid`
- **getServiceProviderById(id)** Lấy đối tượng `ServiceProvider` theo `id`
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

