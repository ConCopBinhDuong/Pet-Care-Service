import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Server {
    static final String DB_URL = "jdbc:mysql://localhost:3306/petcare";
    static final String USER = "root"; 
    static final String PASS = "1234"; 
    public static void main(String[] args) {
        try (Connection conn = DriverManager.getConnection(DB_URL, USER, PASS)) {
            System.out.println("Connected to database!");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
