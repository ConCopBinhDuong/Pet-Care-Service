import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class Database {
    private static final String DB_URL = "jdbc:mysql://localhost:3306/petcare";
    private static final String DB_USER = "root";
    private static final String DB_PASS = "1234";

    public static class User {
        public int userid;
        public String name;
        public String email;
        public String password;
        public String gender;
        public String role;

        public User(int userid, String name, String email, String password, String gender, String role) {
            this.userid = userid;
            this.name = name;
            this.email = email;
            this.password = password;
            this.gender = gender;
            this.role = role;
        }

        @Override
        public String toString() {
            return userid + ": " + name + ", " + email + ", " + gender + ", " + role;
        }
    }

    public static class PetOwner {
        public int id;
        public String phone;
        public String city;
        public String address;

        public PetOwner(int id, String phone, String city, String address) {
            this.id = id;
            this.phone = phone;
            this.city = city;
            this.address = address;
        }

        @Override
        public String toString() {
            return id + ", " + phone + ", " + city + ", " + address;
        }
    }

    public static class ServiceProvider {
        public int id;
        public String businessName;
        public byte[] logo;
        public String phone;
        public String description;
        public String address;
        public String website;

        public ServiceProvider(int id, String businessName, byte[] logo, String phone, String description, String address, String website) {
            this.id = id;
            this.businessName = businessName;
            this.logo = logo;
            this.phone = phone;
            this.description = description;
            this.address = address;
            this.website = website;
        }

        @Override
        public String toString() {
            return id + ", " + businessName + ", " + phone + ", " + address + ", " + website;
        }
    }

    public static class Manager {
        public int id;

        public Manager(int id) {
            this.id = id;
        }

        @Override
        public String toString() {
            return "Manager ID: " + id;
        }
    }
////////////////////////////USER///////////////////////////////////////////////////////////////////////////////
    public static boolean addUser(String name, String email, String password, String gender, String role) {
        String insertUserSQL = "INSERT INTO user (name, email, password, gender, role) VALUES (?, ?, ?, ?, ?)";
        String insertRoleSQL = switch (role.toLowerCase()) {
            case "manager" -> "INSERT INTO manager (id) VALUES (?)";
            case "pet owner" -> "INSERT INTO petowner (id) VALUES (?)";
            case "service provider" -> "INSERT INTO serviceprovider (id) VALUES (?)";
            default -> null;
        };

        if (insertRoleSQL == null) return false;

        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS)) {
            conn.setAutoCommit(false);

            try (PreparedStatement userStmt = conn.prepareStatement(insertUserSQL, Statement.RETURN_GENERATED_KEYS)) {
                userStmt.setString(1, name);
                userStmt.setString(2, email);
                userStmt.setString(3, password);
                userStmt.setString(4, gender);
                userStmt.setString(5, role);
                userStmt.executeUpdate();

                ResultSet rs = userStmt.getGeneratedKeys();
                if (rs.next()) {
                    int userid = rs.getInt(1);

                    try (PreparedStatement roleStmt = conn.prepareStatement(insertRoleSQL)) {
                        roleStmt.setInt(1, userid);
                        roleStmt.executeUpdate();
                    }

                    conn.commit();
                    return true;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public static boolean deleteUser(int userid) {
        String deleteSQL = "DELETE FROM user WHERE userid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(deleteSQL)) {
            stmt.setInt(1, userid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public static User getUserById(int userid) {
        String sql = "SELECT * FROM user WHERE userid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userid);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return new User(
                        rs.getInt("userid"),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getString("password"),
                        rs.getString("gender"),
                        rs.getString("role")
                );
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public static List<User> getAllUsers() {
        List<User> users = new ArrayList<>();
        String sql = "SELECT * FROM user";

        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                users.add(new User(
                        rs.getInt("userid"),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getString("password"),
                        rs.getString("gender"),
                        rs.getString("role")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return users;
    }

    public static boolean updateUser(int userid, String name, String email, String password, String gender, String role) {
        String updateSQL = "UPDATE user SET name = ?, email = ?, password = ?, gender = ?, role = ? WHERE userid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(updateSQL)) {
            stmt.setString(1, name);
            stmt.setString(2, email);
            stmt.setString(3, password);
            stmt.setString(4, gender);
            stmt.setString(5, role);
            stmt.setInt(6, userid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }        

///////////////////////////////MANAGER/////////////////////////////////////////////////////////////////////////////
    //Get list manager by id
    public static Manager getManagerById(int id) {
        String sql = "SELECT * FROM manager WHERE id = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return new Manager(rs.getInt("id"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
    //Get list of all managers
    public static List<Manager> getAllManagers() {
        List<Manager> list = new ArrayList<>();
        String sql = "SELECT * FROM manager";

        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                list.add(new Manager(rs.getInt("id")));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }
//---------Functions of Manager------------
    public static class Ticket {
        public int ticketid;
        public String subject;
        public String description;
        public byte[] attachment;
        public byte[] response;
        public String status;
        public int userid;
        public Timestamp createtime;
        public Integer managerid;
        public Timestamp assigntime;

        public Ticket(int ticketid, String subject, String description, byte[] attachment, byte[] response,
                      String status, int userid, Timestamp createtime, Integer managerid, Timestamp assigntime) {
            this.ticketid = ticketid;
            this.subject = subject;
            this.description = description;
            this.attachment = attachment;
            this.response = response;
            this.status = status;
            this.userid = userid;
            this.createtime = createtime;
            this.managerid = managerid;
            this.assigntime = assigntime;
        }

        @Override
        public String toString() {
            return ticketid + ", " + subject + ", status: " + status + ", user: " + userid + ", manager: " + managerid;
        }
    }
    // Create a new ticket(by user)
    public static int createTicket(int userid, String subject, String description, byte[] attachment) {
        String sql = "INSERT INTO ticket (subject, description, attachment, status, userid) VALUES (?, ?, ?, 'pending', ?)";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, subject);
            stmt.setString(2, description);
            stmt.setBytes(3, attachment);
            stmt.setInt(4, userid);
            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }
    // Assign a ticket to a manager(admin/auto)
    public static boolean assignTicket(int ticketid, int managerid) {
        String sql = "UPDATE ticket SET managerid = ?, assigntime = NOW(), status = 'solving' WHERE ticketid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, managerid);
            stmt.setInt(2, ticketid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
    // Update ticket response and status(by manager)
    public static boolean updateTicketResponse(int ticketid, byte[] response, String status) {
        String sql = "UPDATE ticket SET respone = ?, status = ? WHERE ticketid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setBytes(1, response);
            stmt.setString(2, status);
            stmt.setInt(3, ticketid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
    // Get ticket by ID
    public static Ticket getTicketById(int ticketid) {
        String sql = "SELECT * FROM ticket WHERE ticketid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, ticketid);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return new Ticket(
                        rs.getInt("ticketid"),
                        rs.getString("subject"),
                        rs.getString("description"),
                        rs.getBytes("attachment"),
                        rs.getBytes("respone"),
                        rs.getString("status"),
                        rs.getInt("userid"),
                        rs.getTimestamp("createtime"),
                        rs.getObject("managerid") != null ? rs.getInt("managerid") : null,
                        rs.getTimestamp("assigntime")
                );
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
    // Get all tickets
    public static List<Ticket> getAllTickets() {
        List<Ticket> list = new ArrayList<>();
        String sql = "SELECT * FROM ticket";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                list.add(new Ticket(
                        rs.getInt("ticketid"),
                        rs.getString("subject"),
                        rs.getString("description"),
                        rs.getBytes("attachment"),
                        rs.getBytes("respone"),
                        rs.getString("status"),
                        rs.getInt("userid"),
                        rs.getTimestamp("createtime"),
                        rs.getObject("managerid") != null ? rs.getInt("managerid") : null,
                        rs.getTimestamp("assigntime")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }
    // Get tickets by user ID
    public static List<Ticket> getTicketsByUserId(int userid) {
        List<Ticket> list = new ArrayList<>();
        String sql = "SELECT * FROM ticket WHERE userid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userid);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(new Ticket(
                        rs.getInt("ticketid"),
                        rs.getString("subject"),
                        rs.getString("description"),
                        rs.getBytes("attachment"),
                        rs.getBytes("respone"),
                        rs.getString("status"),
                        rs.getInt("userid"),
                        rs.getTimestamp("createtime"),
                        rs.getObject("managerid") != null ? rs.getInt("managerid") : null,
                        rs.getTimestamp("assigntime")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }
    // Get tickets by manager ID
    public static List<Ticket> getTicketsByManagerId(int managerid) {
        List<Ticket> list = new ArrayList<>();
        String sql = "SELECT * FROM ticket WHERE managerid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, managerid);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(new Ticket(
                        rs.getInt("ticketid"),
                        rs.getString("subject"),
                        rs.getString("description"),
                        rs.getBytes("attachment"),
                        rs.getBytes("respone"),
                        rs.getString("status"),
                        rs.getInt("userid"),
                        rs.getTimestamp("createtime"),
                        rs.getObject("managerid") != null ? rs.getInt("managerid") : null,
                        rs.getTimestamp("assigntime")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }
    // Delete a ticket(by user/admin)
    public static boolean deleteTicket(int ticketid) {
        String sql = "DELETE FROM ticket WHERE ticketid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, ticketid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
    // Update a ticket(by user)
    public static boolean updateTicket(int ticketid, String subject, String description, byte[] attachment) {
        String sql = "UPDATE ticket SET subject = ?, description = ?, attachment = ? WHERE ticketid = ? AND managerid IS NULL";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, subject);
            stmt.setString(2, description);
            stmt.setBytes(3, attachment);
            stmt.setInt(4, ticketid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

///////////////////////////////////PET OWNER///////////////////////////////////////////////////////////////////////////
    public static boolean updatePetOwner(int userid, String phone, String city, String address) {
        String sql = "UPDATE petowner SET phone = ?, city = ?, address = ? WHERE id = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, phone);
            stmt.setString(2, city);
            stmt.setString(3, address);
            stmt.setInt(4, userid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public static PetOwner getPetOwnerById(int id) {
        String sql = "SELECT * FROM petowner WHERE id = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return new PetOwner(
                        rs.getInt("id"),
                        rs.getString("phone"),
                        rs.getString("city"),
                        rs.getString("address")
                );
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public static List<PetOwner> getAllPetOwners() {
        List<PetOwner> owners = new ArrayList<>();
        String sql = "SELECT * FROM petowner";

        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                owners.add(new PetOwner(
                        rs.getInt("id"),
                        rs.getString("phone"),
                        rs.getString("city"),
                        rs.getString("address")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return owners;
    }

////PET///    
    public static class Pet {
        public int petid;
        public String name;
        public String breed;
        public String description;
        public byte[] picture;
        public int age;
        public Date dob;
        public int userid;

        public Pet(int petid, String name, String breed, String description, byte[] picture, int age, Date dob, int userid) {
            this.petid = petid;
            this.name = name;
            this.breed = breed;
            this.description = description;
            this.picture = picture;
            this.age = age;
            this.dob = dob;
            this.userid = userid;
        }
    }

    public static class Diet {
        public int dietid;
        public String name;
        public String amount;
        public String description;
        public int petid;

        public Diet(int dietid, String name, String amount, String description, int petid) {
            this.dietid = dietid;
            this.name = name;
            this.amount = amount;
            this.description = description;
            this.petid = petid;
        }
    }

    public static class Activity {
        public int activityid;
        public String name;
        public String description;
        public int petid;

        public Activity(int activityid, String name, String description, int petid) {
            this.activityid = activityid;
            this.name = name;
            this.description = description;
            this.petid = petid;
        }
    }

    // -------- PET FUNCTIONS --------
    public static int addPet(String name, String breed, String description, byte[] picture, int age, Date dob, int userid) {
        String sql = "INSERT INTO pet (name, breed, description, picture, age, dob, userid) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, name);
            stmt.setString(2, breed);
            stmt.setString(3, description);
            stmt.setBytes(4, picture);
            stmt.setInt(5, age);
            stmt.setDate(6, dob);
            stmt.setInt(7, userid);
            stmt.executeUpdate();
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }

    public static boolean updatePet(int petid, String name, String breed, String description, byte[] picture, int age, Date dob, int userid) {
        String sql = "UPDATE pet SET name = ?, breed = ?, description = ?, picture = ?, age = ?, dob = ?, userid = ? WHERE petid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, name);
            stmt.setString(2, breed);
            stmt.setString(3, description);
            stmt.setBytes(4, picture);
            stmt.setInt(5, age);
            stmt.setDate(6, dob);
            stmt.setInt(7, userid);
            stmt.setInt(8, petid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public static boolean deletePet(int petid) {
        String sql = "DELETE FROM pet WHERE petid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, petid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public static List<Pet> getPetsByUserId(int userid) {
        List<Pet> list = new ArrayList<>();
        String sql = "SELECT * FROM pet WHERE userid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userid);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(new Pet(
                        rs.getInt("petid"),
                        rs.getString("name"),
                        rs.getString("breed"),
                        rs.getString("description"),
                        rs.getBytes("picture"),
                        rs.getInt("age"),
                        rs.getDate("dob"),
                        rs.getInt("userid")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    // -------- DIET FUNCTIONS --------
    public static int addDiet(String name, String amount, String description, int petid) {
        String sql = "INSERT INTO diet (name, amount, description, petid) VALUES (?, ?, ?, ?)";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, name);
            stmt.setString(2, amount);
            stmt.setString(3, description);
            stmt.setInt(4, petid);
            stmt.executeUpdate();
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }

    public static List<Diet> getDietsByPetId(int petid) {
        List<Diet> list = new ArrayList<>();
        String sql = "SELECT * FROM diet WHERE petid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, petid);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(new Diet(
                        rs.getInt("dietid"),
                        rs.getString("name"),
                        rs.getString("amount"),
                        rs.getString("description"),
                        petid
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public static boolean deleteDiet(int dietid) {
        String sql = "DELETE FROM diet WHERE dietid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, dietid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    // -------- ACTIVITY FUNCTIONS --------
    public static int addActivity(String name, String description, int petid) {
        String sql = "INSERT INTO activity (name, description, petid) VALUES (?, ?, ?)";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, name);
            stmt.setString(2, description);
            stmt.setInt(3, petid);
            stmt.executeUpdate();
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }

    public static List<Activity> getActivitiesByPetId(int petid) {
        List<Activity> list = new ArrayList<>();
        String sql = "SELECT * FROM activity WHERE petid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, petid);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(new Activity(
                        rs.getInt("activityid"),
                        rs.getString("name"),
                        rs.getString("description"),
                        petid
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public static boolean deleteActivity(int activityid) {
        String sql = "DELETE FROM activity WHERE activityid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, activityid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

//-------------PET SCHEDULE FUNCTIONS----------------
    public static class PetSchedule {
    public int petscheduleid;
    public Date startdate;
    public String repeatOption;
    public int hour;
    public int minute;
    public Integer dietid;
    public Integer activityid;

    public PetSchedule(int petscheduleid, Date startdate, String repeatOption, int hour, int minute, Integer dietid, Integer activityid) {
        this.petscheduleid = petscheduleid;
        this.startdate = startdate;
        this.repeatOption = repeatOption;
        this.hour = hour;
        this.minute = minute;
        this.dietid = dietid;
        this.activityid = activityid;
    }
}

    public static int addPetSchedule(Date startdate, String repeatOption, int hour, int minute, Integer dietid, Integer activityid) {
        String sql = "INSERT INTO petschedule (startdate, repeat_option, hour, minute, dietid, activityid) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
            PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setDate(1, startdate);
            stmt.setString(2, repeatOption);
            stmt.setInt(3, hour);
            stmt.setInt(4, minute);
            if (dietid != null) stmt.setInt(5, dietid); else stmt.setNull(5, Types.INTEGER);
            if (activityid != null) stmt.setInt(6, activityid); else stmt.setNull(6, Types.INTEGER);
            stmt.executeUpdate();
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    return -1;
}

    // Get pet schedules by diet ID
    public static List<PetSchedule> getPetSchedulesByDietId(int dietid) {
        List<PetSchedule> list = new ArrayList<>();
        String sql = "SELECT * FROM petschedule WHERE dietid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
            PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, dietid);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(new PetSchedule(
                    rs.getInt("petscheduleid"),
                    rs.getDate("startdate"),
                    rs.getString("repeat_option"),
                    rs.getInt("hour"),
                    rs.getInt("minute"),
                    dietid,
                    (Integer) rs.getObject("activityid")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    return list;
}

// Get pet schedules by activity ID
    public static List<PetSchedule> getPetSchedulesByActivityId(int activityid) {
        List<PetSchedule> list = new ArrayList<>();
        String sql = "SELECT * FROM petschedule WHERE activityid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
            PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, activityid);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(new PetSchedule(
                    rs.getInt("petscheduleid"),
                    rs.getDate("startdate"),
                    rs.getString("repeat_option"),
                    rs.getInt("hour"),
                    rs.getInt("minute"),
                    (Integer) rs.getObject("dietid"),
                    activityid
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    return list;
}

// Delete pet schedule
    public static boolean deletePetSchedule(int petscheduleid) {
        String sql = "DELETE FROM petschedule WHERE petscheduleid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
            PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, petscheduleid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
    return false;
}

// Update pet schedule
    public static boolean updatePetSchedule(int petscheduleid, Date startdate, String repeatOption, int hour, int minute, Integer dietid, Integer activityid) {
        String sql = "UPDATE petschedule SET startdate = ?, repeat_option = ?, hour = ?, minute = ?, dietid = ?, activityid = ? WHERE petscheduleid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
            PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setDate(1, startdate);
            stmt.setString(2, repeatOption);
            stmt.setInt(3, hour);
            stmt.setInt(4, minute);
            if (dietid != null) stmt.setInt(5, dietid); else stmt.setNull(5, Types.INTEGER);
            if (activityid != null) stmt.setInt(6, activityid); else stmt.setNull(6, Types.INTEGER);
            stmt.setInt(7, petscheduleid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
    return false;
}

//------------------Booking-----------------
    public static class Booking {
        public int bookid;
        public int poid;
        public int svid;
        public Time slot;
        public Timestamp bookTimestamp;
        public Date serveDate;
        public String paymentMethod;
        public String status;

        public Booking(int bookid, int poid, int svid, Time slot, Timestamp bookTimestamp, Date serveDate, String paymentMethod, String status) {
            this.bookid = bookid;
            this.poid = poid;
            this.svid = svid;
            this.slot = slot;
            this.bookTimestamp = bookTimestamp;
            this.serveDate = serveDate;
            this.paymentMethod = paymentMethod;
            this.status = status;
        }
    }

    public static int addBooking(int poid, int svid, Time slot, Date serveDate, String paymentMethod, String status) {
        String sql = "INSERT INTO booking (poid, svid, slot, serveDate, payment_method, status) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, poid);
            stmt.setInt(2, svid);
            stmt.setTime(3, slot);
            stmt.setDate(4, serveDate);
            stmt.setString(5, paymentMethod);
            stmt.setString(6, status);
            stmt.executeUpdate();
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }

    public static boolean addBookingPet(int bookid, int petid) {
        String sql = "INSERT INTO booking_pet (bookid, petid) VALUES (?, ?)";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, bookid);
            stmt.setInt(2, petid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public static List<Booking> getBookingsByPetOwner(int poid) {
        List<Booking> list = new ArrayList<>();
        String sql = "SELECT * FROM booking WHERE poid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, poid);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(new Booking(
                        rs.getInt("bookid"),
                        rs.getInt("poid"),
                        rs.getInt("svid"),
                        rs.getTime("slot"),
                        rs.getTimestamp("book_timestamp"),
                        rs.getDate("servedate"),
                        rs.getString("payment_method"),
                        rs.getString("status")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public static boolean deleteBooking(int bookid) {
        String sql = "DELETE FROM booking WHERE bookid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, bookid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

//----------------------Sevice--------------
    public static class ServiceReport {
        public int bookid;
        public String text;
        public byte[] image;

        public ServiceReport(int bookid, String text, byte[] image) {
            this.bookid = bookid;
            this.text = text;
            this.image = image;
        }
    }

    public static class ServiceReview {
        public int bookid;
        public int start;
        public String comment;

        public ServiceReview(int bookid, int start, String comment) {
            this.bookid = bookid;
            this.start = start;
            this.comment = comment;
        }
    }

    public static class ServiceUpdate {
        public int bookid;
        public int noUpdate;
        public String text;
        public byte[] image;

        public ServiceUpdate(int bookid, int noUpdate, String text, byte[] image) {
            this.bookid = bookid;
            this.noUpdate = noUpdate;
            this.text = text;
            this.image = image;
        }
    }

    public static boolean addServiceReport(int bookid, String text, byte[] image) {
        String sql = "INSERT INTO service_report (bookid, text, image) VALUES (?, ?, ?)";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, bookid);
            stmt.setString(2, text);
            stmt.setBytes(3, image);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public static boolean addServiceReview(int bookid, int start, String comment) {
        String sql = "INSERT INTO service_review (bookid, start, comment) VALUES (?, ?, ?)";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, bookid);
            stmt.setInt(2, start);
            stmt.setString(3, comment);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public static boolean addServiceUpdate(int bookid, int noUpdate, String text, byte[] image) {
        String sql = "INSERT INTO service_update (bookid, no_update, text, image) VALUES (?, ?, ?, ?)";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, bookid);
            stmt.setInt(2, noUpdate);
            stmt.setString(3, text);
            stmt.setBytes(4, image);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public static List<ServiceUpdate> getServiceUpdatesByBookId(int bookid) {
        List<ServiceUpdate> list = new ArrayList<>();
        String sql = "SELECT * FROM service_update WHERE bookid = ? ORDER BY no_update";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, bookid);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(new ServiceUpdate(
                        bookid,
                        rs.getInt("no_update"),
                        rs.getString("text"),
                        rs.getBytes("image")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public static ServiceReport getServiceReport(int bookid) {
        String sql = "SELECT * FROM service_report WHERE bookid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, bookid);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return new ServiceReport(bookid, rs.getString("text"), rs.getBytes("image"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public static ServiceReview getServiceReview(int bookid) {
        String sql = "SELECT * FROM service_review WHERE bookid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, bookid);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return new ServiceReview(bookid, rs.getInt("start"), rs.getString("comment"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
///////////////////////////////////SERVICE PROVIDER////////////////////////////////////////////////////////////////////
    public static boolean updateServiceProvider(int userid, String businessName, byte[] logo, String phone, String description, String address, String website) {
        String sql = "UPDATE serviceprovider SET bussiness_name = ?, logo = ?, phone = ?, description = ?, address = ?, website = ? WHERE id = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, businessName);
            stmt.setBytes(2, logo);
            stmt.setString(3, phone);
            stmt.setString(4, description);
            stmt.setString(5, address);
            stmt.setString(6, website);
            stmt.setInt(7, userid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public static ServiceProvider getServiceProviderById(int id) {
        String sql = "SELECT * FROM serviceprovider WHERE id = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return new ServiceProvider(
                        rs.getInt("id"),
                        rs.getString("bussiness_name"),
                        rs.getBytes("logo"),
                        rs.getString("phone"),
                        rs.getString("description"),
                        rs.getString("address"),
                        rs.getString("website")
                );
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public static List<ServiceProvider> getAllServiceProviders() {
        List<ServiceProvider> list = new ArrayList<>();
        String sql = "SELECT * FROM serviceprovider";

        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                list.add(new ServiceProvider(
                        rs.getInt("id"),
                        rs.getString("bussiness_name"),
                        rs.getBytes("logo"),
                        rs.getString("phone"),
                        rs.getString("description"),
                        rs.getString("address"),
                        rs.getString("website")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }
//------------------functions of Service Provider-----------------
    public static class ServiceType {
        public int typeid;
        public String type;

        public ServiceType(int typeid, String type) {
            this.typeid = typeid;
            this.type = type;
        }

        @Override
        public String toString() {
            return typeid + ": " + type;
        }
    }

    public static class Service {
        public int serviceid;
        public String name;
        public int price;
        public String description;
        public Time duration;
        public byte[] license;
        public int typeid;
        public int providerid;

        public Service(int serviceid, String name, int price, String description, Time duration, byte[] license, int typeid, int providerid) {
            this.serviceid = serviceid;
            this.name = name;
            this.price = price;
            this.description = description;
            this.duration = duration;
            this.license = license;
            this.typeid = typeid;
            this.providerid = providerid;
        }

        @Override
        public String toString() {
            return serviceid + ": " + name + ", $" + price + ", " + description;
        }
    }

    public static class TimeSlot {
        public int serviceid;
        public Time slot;

        public TimeSlot(int serviceid, Time slot) {
            this.serviceid = serviceid;
            this.slot = slot;
        }

        @Override
        public String toString() {
            return serviceid + " @ " + slot;
        }
    }
//-----------Service Type Functions-------------
//Create by admin
    public static int addServiceType(String type) {
        String sql = "INSERT INTO servicetype (type) VALUES (?)";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, type);
            stmt.executeUpdate();
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }
//update by admin
    public static boolean updateServiceType(int typeid, String newType) {
        String sql = "UPDATE servicetype SET type = ? WHERE typeid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, newType);
            stmt.setInt(2, typeid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
//delete by admin
    public static boolean deleteServiceType(int typeid) {
        String sql = "DELETE FROM servicetype WHERE typeid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, typeid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
//list all service types
    public static List<ServiceType> getAllServiceTypes() {
        List<ServiceType> list = new ArrayList<>();
        String sql = "SELECT * FROM servicetype";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                list.add(new ServiceType(rs.getInt("typeid"), rs.getString("type")));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }
//Get service type by ID
    public static ServiceType getServiceTypeById(int typeid) {
        String sql = "SELECT * FROM servicetype WHERE typeid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, typeid);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return new ServiceType(typeid, rs.getString("type"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
//------------Service Functions--------------
//add a new service by service provider
    public static int addService(String name, int price, String description, Time duration, byte[] license, int typeid, int providerid) {
        String sql = "INSERT INTO service (name, price, description, duration, license, typeid, providerid) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, name);
            stmt.setInt(2, price);
            stmt.setString(3, description);
            stmt.setTime(4, duration);
            stmt.setBytes(5, license);
            stmt.setInt(6, typeid);
            stmt.setInt(7, providerid);
            stmt.executeUpdate();
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }
//update a service by service provider
    public static boolean updateService(int serviceid, String name, int price, String description, Time duration, byte[] license, int typeid, int providerid) {
        String sql = "UPDATE service SET name = ?, price = ?, description = ?, duration = ?, license = ?, typeid = ?, providerid = ? WHERE serviceid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, name);
            stmt.setInt(2, price);
            stmt.setString(3, description);
            stmt.setTime(4, duration);
            stmt.setBytes(5, license);
            stmt.setInt(6, typeid);
            stmt.setInt(7, providerid);
            stmt.setInt(8, serviceid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
// delete a service by service provider
    public static boolean deleteService(int serviceid) {
        String sql = "DELETE FROM service WHERE serviceid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, serviceid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
//get a service by ID
    public static Service getServiceById(int serviceid) {
        String sql = "SELECT * FROM service WHERE serviceid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, serviceid);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return new Service(
                        rs.getInt("serviceid"),
                        rs.getString("name"),
                        rs.getInt("price"),
                        rs.getString("description"),
                        rs.getTime("duration"),
                        rs.getBytes("license"),
                        rs.getInt("typeid"),
                        rs.getInt("providerid")
                );
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
//list all services
    public static List<Service> getAllServices() {
        List<Service> list = new ArrayList<>();
        String sql = "SELECT * FROM service";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                list.add(new Service(
                        rs.getInt("serviceid"),
                        rs.getString("name"),
                        rs.getInt("price"),
                        rs.getString("description"),
                        rs.getTime("duration"),
                        rs.getBytes("license"),
                        rs.getInt("typeid"),
                        rs.getInt("providerid")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }
//get services by provider ID
    public static List<Service> getServicesByProviderId(int providerid) {
        List<Service> list = new ArrayList<>();
        String sql = "SELECT * FROM service WHERE providerid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, providerid);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(new Service(
                        rs.getInt("serviceid"),
                        rs.getString("name"),
                        rs.getInt("price"),
                        rs.getString("description"),
                        rs.getTime("duration"),
                        rs.getBytes("license"),
                        rs.getInt("typeid"),
                        rs.getInt("providerid")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }
//get services by type ID
    public static List<Service> getServicesByTypeId(int typeid) {
        List<Service> list = new ArrayList<>();
        String sql = "SELECT * FROM service WHERE typeid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, typeid);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(new Service(
                        rs.getInt("serviceid"),
                        rs.getString("name"),
                        rs.getInt("price"),
                        rs.getString("description"),
                        rs.getTime("duration"),
                        rs.getBytes("license"),
                        rs.getInt("typeid"),
                        rs.getInt("providerid")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }
//---------------Time Slot Functions-----------------
//add a new time slot for a service by service provider
    public static boolean addTimeSlot(int serviceid, Time slot) {
        String sql = "INSERT INTO timeslot (serviceid, slot) VALUES (?, ?)";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, serviceid);
            stmt.setTime(2, slot);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
//delete a time slot for a service by service provider
    public static boolean deleteTimeSlot(int serviceid, Time slot) {
        String sql = "DELETE FROM timeslot WHERE serviceid = ? AND slot = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, serviceid);
            stmt.setTime(2, slot);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
// get all time slots for a service
    public static List<TimeSlot> getTimeSlotsByServiceId(int serviceid) {
        List<TimeSlot> list = new ArrayList<>();
        String sql = "SELECT * FROM timeslot WHERE serviceid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, serviceid);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(new TimeSlot(rs.getInt("serviceid"), rs.getTime("slot")));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }
/////////////////////////////////////Notifications/////////////////////////////////////////
    public static class Notification {
        public int notiid;
        public String text;
        public int userid;

        @Override
        public String toString() {
            return "Notification ID: " + notiid + ", User ID: " + userid + ", Text: " + text;
        }
    }

    public static int addNotification(int userid, String text) {
        String sql = "INSERT INTO notification (userid, text) VALUES (?, ?)";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setInt(1, userid);
            stmt.setString(2, text);
            int affectedRows = stmt.executeUpdate();

            if (affectedRows == 0) {
                return -1; 
            }

            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    return generatedKeys.getInt(1); 
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1; 
    }

    public static List<Notification> getNotificationsByUserId(int userid) {
        List<Notification> notifications = new ArrayList<>();
        String sql = "SELECT * FROM notification WHERE userid = ?";

        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, userid);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Notification n = new Notification();
                    n.notiid = rs.getInt("notiid");
                    n.userid = rs.getInt("userid");
                    n.text = rs.getString("text");
                    notifications.add(n);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return notifications;
    }

    public static List<TimeSlot> getAllTimeSlots() {
        List<TimeSlot> list = new ArrayList<>();
        String sql = "SELECT * FROM timeslot";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                list.add(new TimeSlot(rs.getInt("serviceid"), rs.getTime("slot")));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public static boolean deleteNotificationByNotiId(int notiid) {
        String sql = "DELETE FROM notification WHERE notiid = ?";

        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, notiid);
            int affectedRows = stmt.executeUpdate();
            return affectedRows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public static boolean deleteNotificationsByUserId(int userid) {
        String sql = "DELETE FROM notification WHERE userid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
            PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userid);
            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public static boolean updateNotification(int notiid, String newText) {
        String sql = "UPDATE notification SET text = ? WHERE notiid = ?";

        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, newText);
            stmt.setInt(2, notiid);
            int affectedRows = stmt.executeUpdate();
            return affectedRows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

//////////////////////////////////Schedule/////////////////////////////////////
    public static class Schedule {
    public int scheduleid;
    public Timestamp scheduledTime;
    public String tittle;
    public String detail;
    public int userid;

    public Schedule(int scheduleid, Timestamp scheduledTime, String tittle, String detail, int userid) {
        this.scheduleid = scheduleid;
        this.scheduledTime = scheduledTime;
        this.tittle = tittle;
        this.detail = detail;
        this.userid = userid;
    }

    @Override
    public String toString() {
        return scheduleid + ": " + tittle + " at " + scheduledTime + " by user " + userid;
    }
}


    public static int addSchedule(Timestamp scheduledTime, String tittle, String detail, int userid) {
        String sql = "INSERT INTO schedule (scheduled_time, tittle, detail, userid) VALUES (?, ?, ?, ?)";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
            PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setTimestamp(1, scheduledTime);
            stmt.setString(2, tittle);
            stmt.setString(3, detail);
            stmt.setInt(4, userid);
            stmt.executeUpdate();
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    return -1;
}

    public static boolean updateSchedule(int scheduleid, Timestamp scheduledTime, String tittle, String detail, int userid) {
        String sql = "UPDATE schedule SET scheduled_time = ?, tittle = ?, detail = ?, userid = ? WHERE scheduleid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
            PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setTimestamp(1, scheduledTime);
            stmt.setString(2, tittle);
            stmt.setString(3, detail);
            stmt.setInt(4, userid);
            stmt.setInt(5, scheduleid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
}

    public static boolean deleteSchedule(int scheduleid) {
        String sql = "DELETE FROM schedule WHERE scheduleid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
            PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, scheduleid);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
    return false;
}

    public static List<Schedule> getSchedulesByUserId(int userid) {
        List<Schedule> list = new ArrayList<>();
        String sql = "SELECT * FROM schedule WHERE userid = ?";
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
            PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userid);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(new Schedule(
                    rs.getInt("scheduleid"),
                    rs.getTimestamp("scheduled_time"),
                    rs.getString("tittle"),
                    rs.getString("detail"),
                    rs.getInt("userid")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    return list;
}


    public static void main(String[] args) {
        int testUserId = 12; 

        deleteNotificationsByUserId(12);
    }
}