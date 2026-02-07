export const javaCoreLessons = [
  {
    id: 1,
    title: "Java OOP Fundamentals",
    desc: "Classes, Objects, Constructors - nen tang OOP trong Java",
    content: `
## Class la gi?

Mot **class** la mot ban thiet ke (blueprint) de tao ra cac **objects**. No dinh nghia **fields** (du lieu) va **methods** (hanh vi).

\`\`\`mermaid
classDiagram
    class Student {
        -String name
        -int age
        -String email
        +Student()
        +Student(String, int, String)
        +getName() String
        +setName(String) void
        +study() void
        +toString() String
    }
\`\`\`

## Anatomy cua mot Class

\`\`\`java
// Package declaration
package com.example.model;

// Import statements
import java.util.Objects;

// Class declaration
public class Student {

    // === FIELDS (Instance Variables) ===
    private String name;
    private int age;
    private String email;

    // === STATIC FIELD (Class Variable) ===
    private static int totalStudents = 0;

    // === CONSTRUCTORS ===

    // Default constructor (no-arg)
    public Student() {
        this.name = "Unknown";
        this.age = 0;
        this.email = "";
        totalStudents++;
    }

    // Parameterized constructor
    public Student(String name, int age, String email) {
        this.name = name;
        this.age = age;
        this.email = email;
        totalStudents++;
    }

    // Copy constructor
    public Student(Student other) {
        this.name = other.name;
        this.age = other.age;
        this.email = other.email;
        totalStudents++;
    }

    // === METHODS ===

    public void study() {
        System.out.println(name + " is studying...");
    }

    // Method overloading - cung ten, khac tham so
    public void study(String subject) {
        System.out.println(name + " is studying " + subject);
    }

    public void study(String subject, int hours) {
        System.out.println(name + " is studying " + subject + " for " + hours + " hours");
    }

    // === STATIC METHOD ===
    public static int getTotalStudents() {
        return totalStudents;
    }

    @Override
    public String toString() {
        return "Student{name='" + name + "', age=" + age + ", email='" + email + "'}";
    }
}
\`\`\`

## Constructors chi tiet

### Constructor Chaining voi \`this()\`

\`\`\`java
public class Product {
    private String name;
    private double price;
    private String category;
    private boolean active;

    // Full constructor
    public Product(String name, double price, String category, boolean active) {
        this.name = name;
        this.price = price;
        this.category = category;
        this.active = active;
    }

    // Chain to full constructor
    public Product(String name, double price, String category) {
        this(name, price, category, true);  // default active = true
    }

    // Chain tiep
    public Product(String name, double price) {
        this(name, price, "General");  // default category
    }

    // Default
    public Product() {
        this("Unknown", 0.0);  // chain tiep
    }
}
\`\`\`

> ⚠️ Lưu ý: \`this()\` PHAI la dong dau tien trong constructor. Khong the goi ca \`this()\` va \`super()\` cung luc.

### Static Factory Method (thay the constructor)

\`\`\`java
public class Connection {
    private String host;
    private int port;
    private String protocol;

    // Private constructor - khong cho new truc tiep
    private Connection(String host, int port, String protocol) {
        this.host = host;
        this.port = port;
        this.protocol = protocol;
    }

    // Static factory methods - ten mo ta ro rang
    public static Connection createHttp(String host) {
        return new Connection(host, 80, "HTTP");
    }

    public static Connection createHttps(String host) {
        return new Connection(host, 443, "HTTPS");
    }

    public static Connection createCustom(String host, int port) {
        return new Connection(host, port, "TCP");
    }
}

// Su dung - doc hieu ngay lap tuc
Connection conn = Connection.createHttps("api.example.com");
\`\`\`

## this Keyword

| Su dung | Vi du | Muc dich |
|---------|-------|----------|
| Tham chieu field | \`this.name = name\` | Phan biet field va parameter |
| Goi constructor khac | \`this(name, 0)\` | Constructor chaining |
| Truyen object hien tai | \`list.add(this)\` | Pass current object |
| Return chinh no | \`return this\` | Method chaining (fluent API) |

\`\`\`java
// Fluent API voi return this
public class QueryBuilder {
    private String table;
    private String condition;
    private int limit;

    public QueryBuilder from(String table) {
        this.table = table;
        return this;  // return chinh no de chain
    }

    public QueryBuilder where(String condition) {
        this.condition = condition;
        return this;
    }

    public QueryBuilder limit(int limit) {
        this.limit = limit;
        return this;
    }

    public String build() {
        return "SELECT * FROM " + table
            + " WHERE " + condition
            + " LIMIT " + limit;
    }
}

// Su dung - method chaining
String sql = new QueryBuilder()
    .from("users")
    .where("age > 18")
    .limit(10)
    .build();
\`\`\`

## Method Overloading

Method overloading = cung ten method, KHAC tham so (so luong, kieu, thu tu).

\`\`\`java
public class MathUtils {
    // Overload theo SO LUONG tham so
    public static int add(int a, int b) {
        return a + b;
    }

    public static int add(int a, int b, int c) {
        return a + b + c;
    }

    // Overload theo KIEU tham so
    public static double add(double a, double b) {
        return a + b;
    }

    // Overload theo THU TU tham so
    public static String format(String name, int age) {
        return name + " (" + age + ")";
    }

    public static String format(int age, String name) {
        return age + ": " + name;
    }
}
\`\`\`

> ⚠️ Lưu ý: KHONG the overload chi bang return type. \`int add(int a, int b)\` va \`double add(int a, int b)\` se COMPILE ERROR.

## Memory Model: Stack vs Heap

\`\`\`mermaid
graph LR
    subgraph "Stack (per Thread)"
        F1["main()<br/>student → ref#1<br/>age → 20"]
        F2["processStudent()<br/>s → ref#1"]
    end

    subgraph "Heap (Shared)"
        O1["Student Object #1<br/>name: 'Alice'<br/>age: 20<br/>email: 'alice@mail.com'"]
        S1["String 'Alice'"]
        S2["String 'alice@mail.com'"]
        O1 --> S1
        O1 --> S2
    end

    F1 -->|ref#1| O1
    F2 -->|ref#1| O1
\`\`\`

\`\`\`java
public class MemoryDemo {
    public static void main(String[] args) {
        // primitive 'age' luu TREN STACK
        int age = 20;

        // 'student' la reference tren STACK, object tren HEAP
        Student student = new Student("Alice", 20, "alice@mail.com");

        // 's' la COPY cua reference, tro toi CUNG object tren heap
        processStudent(student);

        // student.getName() van la "Bob" vi cung object
        System.out.println(student.getName()); // "Bob"
    }

    static void processStudent(Student s) {
        s.setName("Bob");  // thay doi object tren heap

        s = new Student("Charlie", 25, "c@mail.com"); // s tro toi object MOI
        // student trong main() VAN tro toi object cu (da doi ten "Bob")
    }
}
\`\`\`

### Bang so sanh Stack vs Heap

| | Stack | Heap |
|---|---|---|
| **Luu gi** | Primitives, references, method frames | Objects, arrays |
| **Pham vi** | Rieng moi thread | Chia se giua cac threads |
| **Toc do** | Rat nhanh (LIFO) | Cham hon (can GC) |
| **Kich thuoc** | Nho (~1MB default) | Lon (configurable -Xmx) |
| **Quan ly** | Tu dong (method ket thuc = pop frame) | Garbage Collector |
| **Loi** | StackOverflowError | OutOfMemoryError |

> ⚠️ Lưu ý: Java LUON truyen tham so theo **pass-by-value**. Voi objects, no truyen **copy cua reference** (gia tri cua con tro), KHONG phai truyen chinh object. Vi vay ban co the thay doi noi dung object, nhung KHONG the lam reference goc tro toi object khac.
    `
  },
  {
    id: 2,
    title: "Encapsulation & Access Modifiers",
    desc: "Private, protected, public, getters/setters, immutable objects, Builder pattern",
    content: `
## Encapsulation la gi?

Encapsulation = **Dong goi du lieu** + **An thong tin** (Information Hiding). Chi expose nhung gi can thiet qua public API.

\`\`\`mermaid
graph TD
    subgraph "BankAccount (Encapsulated)"
        direction TB
        PRIVATE["🔒 Private<br/>- balance: double<br/>- accountNumber: String<br/>- pin: String"]
        PUBLIC["🔓 Public API<br/>+ deposit(amount)<br/>+ withdraw(amount)<br/>+ getBalance()"]
    end
    CLIENT[Client Code] -->|"Chi truy cap qua public API"| PUBLIC
    CLIENT -.->|"KHONG truy cap truc tiep"| PRIVATE
    style PRIVATE fill:#ef4444,color:#fff
    style PUBLIC fill:#22c55e,color:#fff
\`\`\`

## 4 Access Modifiers

| Modifier | Cung class | Cung package | Subclass (khac package) | Khac package |
|----------|:----------:|:------------:|:-----------------------:|:------------:|
| **private** | Co | Khong | Khong | Khong |
| **(default)** | Co | Co | Khong | Khong |
| **protected** | Co | Co | Co | Khong |
| **public** | Co | Co | Co | Co |

\`\`\`java
package com.example.model;

public class Employee {
    private String ssn;            // Chi trong class nay
    String department;             // Default - cung package
    protected double salary;       // Cung package + subclass
    public String name;            // Moi noi (NHUNG khong nen!)
}
\`\`\`

### Quy tac su dung

\`\`\`text
1. Fields: LUON LUON private (hoac protected neu can ke thua)
2. Methods:
   - public: API cho ben ngoai
   - private: Helper methods noi bo
   - protected: Methods cho subclass override
   - default: Methods chi dung trong package
3. Classes:
   - public: 1 public class per file (ten file = ten class)
   - default: Chi dung trong package (package-private)
\`\`\`

## Getters va Setters

\`\`\`java
public class User {
    private String name;
    private String email;
    private int age;

    // Getter - tra ve gia tri
    public String getName() {
        return name;
    }

    // Setter - dat gia tri voi VALIDATION
    public void setName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be null or empty");
        }
        this.name = name.trim();
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Invalid email format");
        }
        this.email = email.toLowerCase().trim();
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        if (age < 0 || age > 150) {
            throw new IllegalArgumentException("Age must be between 0 and 150");
        }
        this.age = age;
    }
}
\`\`\`

> ⚠️ Lưu ý: KHONG BAO GIO tao getter/setter may moc (khong co logic). Neu field khong can validation hay transform, hay can nhac no co that su can setter khong. Immutable tot hon mutable.

## Immutable Objects

Mot object **immutable** = KHONG THE thay doi sau khi tao. Thread-safe, an toan, de debug.

### Cach tao Immutable Class

\`\`\`java
// Java truyen thong
public final class Money {    // 1. final class - khong cho extend
    private final String currency;  // 2. final fields
    private final BigDecimal amount;

    // 3. Chi co constructor, KHONG co setter
    public Money(String currency, BigDecimal amount) {
        this.currency = currency;
        this.amount = amount;
    }

    // 4. Chi co getters
    public String getCurrency() {
        return currency;
    }

    public BigDecimal getAmount() {
        return amount;  // BigDecimal la immutable, safe
    }

    // 5. Methods tao object MOI thay vi modify
    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException("Cannot add different currencies");
        }
        return new Money(this.currency, this.amount.add(other.amount));
    }

    public Money multiply(int quantity) {
        return new Money(this.currency, this.amount.multiply(BigDecimal.valueOf(quantity)));
    }
}
\`\`\`

### Java Record (Java 16+) - Immutable nhanh gon

\`\`\`java
// Tuong duong voi class Money phia tren!
public record Money(String currency, BigDecimal amount) {

    // Compact constructor cho validation
    public Money {
        if (currency == null || currency.isBlank()) {
            throw new IllegalArgumentException("Currency required");
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Amount must be >= 0");
        }
    }

    // Custom methods
    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException("Currency mismatch");
        }
        return new Money(this.currency, this.amount.add(other.amount));
    }
}

// Su dung
Money price = new Money("USD", BigDecimal.valueOf(29.99));
Money total = price.multiply(3);
System.out.println(price.currency());  // "USD" - record dung ten field, khong co get prefix
\`\`\`

### Defensive Copying cho mutable fields

\`\`\`java
public final class Event {
    private final String name;
    private final Date startDate;       // Date la MUTABLE!
    private final List<String> tags;    // List la MUTABLE!

    public Event(String name, Date startDate, List<String> tags) {
        this.name = name;
        this.startDate = new Date(startDate.getTime());  // Defensive copy IN
        this.tags = new ArrayList<>(tags);                // Defensive copy IN
    }

    public Date getStartDate() {
        return new Date(startDate.getTime());  // Defensive copy OUT
    }

    public List<String> getTags() {
        return Collections.unmodifiableList(tags);  // Unmodifiable view OUT
    }
}
\`\`\`

## Builder Pattern

Khi constructor co nhieu tham so, Builder giup code doc hieu hon.

\`\`\`java
public class HttpRequest {
    private final String url;
    private final String method;
    private final Map<String, String> headers;
    private final String body;
    private final int timeout;
    private final boolean followRedirects;

    // Private constructor - chi Builder moi goi duoc
    private HttpRequest(Builder builder) {
        this.url = builder.url;
        this.method = builder.method;
        this.headers = Collections.unmodifiableMap(builder.headers);
        this.body = builder.body;
        this.timeout = builder.timeout;
        this.followRedirects = builder.followRedirects;
    }

    // Static inner Builder class
    public static class Builder {
        // Required
        private final String url;

        // Optional voi defaults
        private String method = "GET";
        private Map<String, String> headers = new HashMap<>();
        private String body = null;
        private int timeout = 30_000;
        private boolean followRedirects = true;

        public Builder(String url) {
            this.url = Objects.requireNonNull(url, "URL is required");
        }

        public Builder method(String method) {
            this.method = method;
            return this;
        }

        public Builder header(String key, String value) {
            this.headers.put(key, value);
            return this;
        }

        public Builder body(String body) {
            this.body = body;
            return this;
        }

        public Builder timeout(int timeout) {
            if (timeout <= 0) throw new IllegalArgumentException("Timeout must be positive");
            this.timeout = timeout;
            return this;
        }

        public Builder followRedirects(boolean follow) {
            this.followRedirects = follow;
            return this;
        }

        public HttpRequest build() {
            // Validation truoc khi tao
            if (("POST".equals(method) || "PUT".equals(method)) && body == null) {
                throw new IllegalStateException("Body required for " + method);
            }
            return new HttpRequest(this);
        }
    }

    // Getters...
    public String getUrl() { return url; }
    public String getMethod() { return method; }
}

// Su dung - doc rat ro rang
HttpRequest request = new HttpRequest.Builder("https://api.example.com/users")
    .method("POST")
    .header("Content-Type", "application/json")
    .header("Authorization", "Bearer token123")
    .body("{\\"name\\": \\"Alice\\"}")
    .timeout(5000)
    .build();
\`\`\`

## Information Hiding - Tai sao quan trong

\`\`\`java
// BAD - Expose internal structure
public class ShoppingCart {
    public List<Item> items = new ArrayList<>();  // Bat ky ai cung thay doi duoc!
}

// Client code co the pha
cart.items.clear();
cart.items = null;
cart.items.add(new Item("hack", -1000));  // Gia am!

// GOOD - Encapsulated
public class ShoppingCart {
    private final List<Item> items = new ArrayList<>();

    public void addItem(Item item) {
        Objects.requireNonNull(item, "Item cannot be null");
        if (item.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be positive");
        }
        items.add(item);
    }

    public void removeItem(String itemId) {
        items.removeIf(item -> item.getId().equals(itemId));
    }

    public List<Item> getItems() {
        return Collections.unmodifiableList(items);  // Read-only view
    }

    public BigDecimal getTotal() {
        return items.stream()
            .map(Item::getPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public int getItemCount() {
        return items.size();
    }
}
\`\`\`

> ⚠️ Lưu ý: Encapsulation khong chi la "dat private roi tao getter/setter". No la **thiet ke API sao cho client KHONG CAN BIET internal structure**. Getter/setter may moc (khong co logic) chi la illusion of encapsulation.
    `
  },
  {
    id: 3,
    title: "Inheritance & Polymorphism",
    desc: "extends, super(), method overriding, dynamic dispatch, abstract classes vs interfaces",
    content: `
## Inheritance la gi?

Inheritance cho phep mot class (subclass/child) **ke thua** fields va methods tu class khac (superclass/parent).

\`\`\`mermaid
classDiagram
    class Animal {
        #String name
        #int age
        +Animal(String, int)
        +eat() void
        +sleep() void
        +makeSound() String
    }
    class Dog {
        -String breed
        +Dog(String, int, String)
        +fetch() void
        +makeSound() String
    }
    class Cat {
        -boolean isIndoor
        +Cat(String, int, boolean)
        +purr() void
        +makeSound() String
    }
    class GuideDog {
        -String owner
        +GuideDog(String, int, String, String)
        +guide() void
    }
    Animal <|-- Dog
    Animal <|-- Cat
    Dog <|-- GuideDog
\`\`\`

## extends va super()

\`\`\`java
public class Animal {
    protected String name;
    protected int age;

    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public void eat() {
        System.out.println(name + " is eating");
    }

    public void sleep() {
        System.out.println(name + " is sleeping");
    }

    public String makeSound() {
        return "...";
    }
}

public class Dog extends Animal {
    private String breed;

    public Dog(String name, int age, String breed) {
        super(name, age);  // GOI constructor cua parent - PHAI la dong dau tien
        this.breed = breed;
    }

    public void fetch() {
        System.out.println(name + " is fetching the ball!");
    }

    @Override  // Danh dau override - compiler se check
    public String makeSound() {
        return "Woof! Woof!";
    }

    @Override
    public void eat() {
        super.eat();  // Goi method cua parent truoc
        System.out.println(name + " wags tail while eating");
    }
}
\`\`\`

> ⚠️ Lưu ý: \`super()\` PHAI la dong dau tien trong constructor. Neu khong goi \`super()\`, Java tu dong goi \`super()\` (no-arg). Neu parent KHONG co no-arg constructor, COMPILE ERROR.

## Method Overriding Rules

| Rule | Chi tiet |
|------|----------|
| **Method signature** | PHAI giong hoan toan (ten + params) |
| **Return type** | Giong hoac la subtype (covariant return) |
| **Access modifier** | KHONG duoc restrictive hon parent (public > protected > default > private) |
| **Exception** | KHONG duoc throw broader checked exception |
| **static method** | KHONG override duoc (chi hiding) |
| **final method** | KHONG override duoc |
| **private method** | KHONG override duoc (khong ke thua) |

\`\`\`java
public class Shape {
    public Shape create() { return new Shape(); }
    public void draw() { /* ... */ }
    protected void resize(int factor) throws IOException { /* ... */ }
}

public class Circle extends Shape {
    // Covariant return type - OK
    @Override
    public Circle create() { return new Circle(); }

    // Wider access - OK (protected -> public)
    @Override
    public void draw() { /* ... */ }

    // Narrower exception - OK (IOException -> FileNotFoundException)
    @Override
    public void resize(int factor) throws FileNotFoundException { /* ... */ }
}
\`\`\`

## Runtime Polymorphism (Dynamic Dispatch)

\`\`\`java
public class PolymorphismDemo {
    public static void main(String[] args) {
        // Reference type: Animal, Actual type: Dog
        Animal animal1 = new Dog("Rex", 3, "Labrador");
        Animal animal2 = new Cat("Whiskers", 2, true);

        // Dynamic dispatch - goi method cua ACTUAL type tai runtime
        System.out.println(animal1.makeSound()); // "Woof! Woof!" - Dog's method
        System.out.println(animal2.makeSound()); // "Meow!" - Cat's method

        // Polymorphism voi collections
        List<Animal> animals = List.of(
            new Dog("Rex", 3, "Lab"),
            new Cat("Tom", 2, false),
            new Dog("Buddy", 5, "Golden")
        );

        for (Animal a : animals) {
            // Moi animal goi dung method cua class THAT cua no
            System.out.println(a.getName() + " says: " + a.makeSound());
        }

        // instanceof check va casting
        if (animal1 instanceof Dog dog) {  // Pattern matching (Java 16+)
            dog.fetch();  // Truy cap method rieng cua Dog
        }
    }
}
\`\`\`

### How Dynamic Dispatch Works (vtable)

\`\`\`mermaid
graph TD
    subgraph "Compile Time"
        REF["Animal animal = new Dog()"]
        CT["Compiler chi biet type: Animal<br/>animal.makeSound() → Animal.makeSound?"]
    end

    subgraph "Runtime (JVM)"
        OBJ["Object thuc te: Dog"]
        VT["Dog's Method Table (vtable)<br/>makeSound() → Dog.makeSound<br/>eat() → Dog.eat<br/>sleep() → Animal.sleep"]
        CALL["JVM lookup vtable → goi Dog.makeSound()"]
    end

    REF --> CT
    CT -->|"Runtime lookup"| OBJ
    OBJ --> VT
    VT --> CALL
\`\`\`

## Abstract Classes

\`\`\`java
public abstract class Shape {
    protected String color;
    protected double x, y;  // position

    public Shape(String color, double x, double y) {
        this.color = color;
        this.x = x;
        this.y = y;
    }

    // Abstract methods - subclass BAT BUOC implement
    public abstract double area();
    public abstract double perimeter();
    public abstract void draw();

    // Concrete method - subclass ke thua
    public void move(double dx, double dy) {
        this.x += dx;
        this.y += dy;
    }

    // Template Method pattern
    public String describe() {
        return color + " shape at (" + x + "," + y + ") "
             + "area=" + area() + " perimeter=" + perimeter();
    }
}

public class Circle extends Shape {
    private double radius;

    public Circle(String color, double x, double y, double radius) {
        super(color, x, y);
        this.radius = radius;
    }

    @Override
    public double area() {
        return Math.PI * radius * radius;
    }

    @Override
    public double perimeter() {
        return 2 * Math.PI * radius;
    }

    @Override
    public void draw() {
        System.out.println("Drawing circle with radius " + radius);
    }
}
\`\`\`

## Abstract Class vs Interface

| | Abstract Class | Interface |
|---|---|---|
| **Keyword** | \`abstract class\` | \`interface\` |
| **Ke thua** | Single (\`extends\`) | Multiple (\`implements\`) |
| **Constructor** | Co | Khong |
| **Fields** | Bat ky (private, protected...) | Chi \`public static final\` |
| **Methods** | Abstract + Concrete | Abstract + default + static |
| **State** | Co the giu state (fields) | Khong co state (chi constants) |
| **Use case** | IS-A relationship, shared code | CAN-DO capability, contract |

## Diamond Problem va Default Methods

\`\`\`java
interface Flyable {
    default void move() {
        System.out.println("Flying...");
    }
}

interface Swimmable {
    default void move() {
        System.out.println("Swimming...");
    }
}

// Diamond problem - 2 interfaces co cung default method
class Duck implements Flyable, Swimmable {
    @Override
    public void move() {
        // PHAI override de resolve conflict
        Flyable.super.move();   // Goi cu the cua Flyable
        Swimmable.super.move(); // Goi cu the cua Swimmable
        System.out.println("Or waddling on land!");
    }
}
\`\`\`

## Composition over Inheritance

\`\`\`java
// BAD - Deep inheritance hierarchy
class Animal { }
class FlyingAnimal extends Animal { void fly() { } }
class SwimmingFlyingAnimal extends FlyingAnimal { void swim() { } }
// Con Duck vua bay vua boi vua di bo?? Hierarchy KHONG linh hoat!

// GOOD - Composition
interface Flyable {
    void fly();
}

interface Swimmable {
    void swim();
}

interface Walkable {
    void walk();
}

class Duck implements Flyable, Swimmable, Walkable {
    private final FlyBehavior flyBehavior = new SimpleFly();
    private final SwimBehavior swimBehavior = new SimpleSwim();

    @Override
    public void fly() { flyBehavior.fly(); }

    @Override
    public void swim() { swimBehavior.swim(); }

    @Override
    public void walk() { System.out.println("Walking..."); }
}
\`\`\`

> ⚠️ Lưu ý: **"Favor composition over inheritance"** (Effective Java - Joshua Bloch). Chi dung inheritance khi co quan he IS-A that su. Neu chi can tai su dung code, dung composition (HAS-A). Inheritance tao coupling CHAT giua parent va child.
    `
  },
  {
    id: 4,
    title: "Interfaces & Abstract Classes Deep Dive",
    desc: "Functional interfaces, sealed classes, marker interfaces, default methods",
    content: `
## Functional Interfaces

Functional interface = interface chi co **DUY NHAT 1 abstract method**. Co the dung voi **lambda expressions**.

\`\`\`java
@FunctionalInterface  // Compiler check - dam bao chi co 1 abstract method
public interface Transformer<T, R> {
    R transform(T input);          // Duy nhat 1 abstract method

    // Default methods KHONG tinh
    default Transformer<T, R> andThen(Transformer<R, R> after) {
        return input -> after.transform(this.transform(input));
    }

    // Static methods KHONG tinh
    static <T> Transformer<T, T> identity() {
        return input -> input;
    }
}

// Su dung voi Lambda
Transformer<String, Integer> lengthOf = s -> s.length();
Transformer<String, Integer> lengthOf2 = String::length;  // Method reference

int len = lengthOf.transform("Hello");  // 5
\`\`\`

### Built-in Functional Interfaces (java.util.function)

| Interface | Method | Mo ta | Vi du |
|-----------|--------|-------|-------|
| \`Function<T,R>\` | \`R apply(T)\` | Transform T → R | \`s -> s.length()\` |
| \`Predicate<T>\` | \`boolean test(T)\` | Test condition | \`n -> n > 0\` |
| \`Consumer<T>\` | \`void accept(T)\` | Consume, no return | \`s -> System.out.println(s)\` |
| \`Supplier<T>\` | \`T get()\` | Supply value | \`() -> new ArrayList<>()\` |
| \`UnaryOperator<T>\` | \`T apply(T)\` | T → T (same type) | \`s -> s.toUpperCase()\` |
| \`BinaryOperator<T>\` | \`T apply(T,T)\` | (T,T) → T | \`(a,b) -> a + b\` |
| \`BiFunction<T,U,R>\` | \`R apply(T,U)\` | (T,U) → R | \`(s,n) -> s.repeat(n)\` |

\`\`\`java
// Compose functional interfaces
Function<String, String> trim = String::trim;
Function<String, String> lower = String::toLowerCase;
Function<String, String> normalize = trim.andThen(lower);

Predicate<String> notEmpty = s -> !s.isEmpty();
Predicate<String> hasAt = s -> s.contains("@");
Predicate<String> isValidEmail = notEmpty.and(hasAt);

// Real-world usage
public class UserService {
    public List<User> findUsers(Predicate<User> filter) {
        return allUsers.stream()
            .filter(filter)
            .collect(Collectors.toList());
    }
}

// Caller truyen logic
List<User> adults = userService.findUsers(u -> u.getAge() >= 18);
List<User> admins = userService.findUsers(u -> u.getRole() == Role.ADMIN);
\`\`\`

## Default Methods trong Interface

\`\`\`java
public interface Collection<E> {
    // Abstract - bat buoc implement
    boolean add(E element);
    int size();
    Iterator<E> iterator();

    // Default - co san implementation, co the override
    default boolean isEmpty() {
        return size() == 0;  // Dung method abstract khac
    }

    // Java 8+ - cho phep add method vao interface ma KHONG break existing implementations
    default void forEach(Consumer<? super E> action) {
        for (E element : this) {
            action.accept(element);
        }
    }

    // Default method co the goi abstract methods
    default boolean addAll(Collection<? extends E> c) {
        boolean modified = false;
        for (E element : c) {
            if (add(element)) {
                modified = true;
            }
        }
        return modified;
    }
}
\`\`\`

### Static Methods trong Interface

\`\`\`java
public interface Validator<T> {
    boolean validate(T value);
    String getErrorMessage();

    // Static factory methods
    static Validator<String> notEmpty() {
        return new Validator<>() {
            public boolean validate(String value) {
                return value != null && !value.trim().isEmpty();
            }
            public String getErrorMessage() {
                return "Value must not be empty";
            }
        };
    }

    static Validator<Integer> range(int min, int max) {
        return new Validator<>() {
            public boolean validate(Integer value) {
                return value != null && value >= min && value <= max;
            }
            public String getErrorMessage() {
                return "Value must be between " + min + " and " + max;
            }
        };
    }

    // Compose validators
    static <T> Validator<T> allOf(List<Validator<T>> validators) {
        return new Validator<>() {
            public boolean validate(T value) {
                return validators.stream().allMatch(v -> v.validate(value));
            }
            public String getErrorMessage() {
                return validators.stream()
                    .filter(v -> !v.validate(null))
                    .map(Validator::getErrorMessage)
                    .collect(Collectors.joining("; "));
            }
        };
    }
}
\`\`\`

## Sealed Classes (Java 17+)

Sealed classes **gioi han** nhung class nao duoc phep extend/implement.

\`\`\`java
// Chi 3 class duoc phep implement
public sealed interface Shape permits Circle, Rectangle, Triangle {
    double area();
    double perimeter();
}

// "final" - khong ai duoc extend tiep
public final class Circle implements Shape {
    private final double radius;

    public Circle(double radius) { this.radius = radius; }

    @Override
    public double area() { return Math.PI * radius * radius; }

    @Override
    public double perimeter() { return 2 * Math.PI * radius; }
}

// "final" - end of hierarchy
public final class Rectangle implements Shape {
    private final double width, height;

    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }

    @Override
    public double area() { return width * height; }

    @Override
    public double perimeter() { return 2 * (width + height); }
}

// "non-sealed" - cho phep extend tiep
public non-sealed class Triangle implements Shape {
    private final double a, b, c;

    public Triangle(double a, double b, double c) {
        this.a = a; this.b = b; this.c = c;
    }

    @Override
    public double area() {
        double s = (a + b + c) / 2;
        return Math.sqrt(s * (s-a) * (s-b) * (s-c));
    }

    @Override
    public double perimeter() { return a + b + c; }
}
\`\`\`

### Sealed Classes voi Pattern Matching (Java 21+)

\`\`\`java
// Compiler BIET tat ca cac subtype → exhaustive switch
public static String describe(Shape shape) {
    return switch (shape) {
        case Circle c -> "Circle with radius " + c.getRadius();
        case Rectangle r -> "Rectangle " + r.getWidth() + "x" + r.getHeight();
        case Triangle t -> "Triangle with perimeter " + t.perimeter();
        // Khong can default vi sealed - compiler biet day du!
    };
}
\`\`\`

## Marker Interfaces

Marker interface = interface **KHONG co method nao**. Chi de "danh dau" mot class.

\`\`\`java
// Java built-in marker interfaces
public interface Serializable { }    // Danh dau: co the serialize
public interface Cloneable { }       // Danh dau: co the clone
public interface RandomAccess { }    // Danh dau: ho tro truy cap ngau nhien

// Custom marker interface
public interface Auditable { }       // Danh dau: entity can audit log

public class Order implements Auditable {
    // ...
}

// Su dung
if (entity instanceof Auditable) {
    auditService.log(entity);
}
\`\`\`

> ⚠️ Lưu ý: Tu Java 5+, **annotations** thay the marker interfaces trong hau het truong hop. Dung \`@Auditable\` thay vi \`implements Auditable\`. Annotations linh hoat hon vi co the dat tren methods, fields, parameters.

## Khi nao dung Abstract Class vs Interface?

| Tieu chi | Abstract Class | Interface |
|----------|---------------|-----------|
| **Quan he** | IS-A (Dog IS-A Animal) | CAN-DO (Dog CAN Swim) |
| **State** | Can chia se state (fields) | Khong can state |
| **Constructor** | Can constructor logic | Khong can |
| **Access control** | Can private/protected members | Chi public |
| **Evolution** | Them method co the break subclass | Default methods khong break |
| **Multiple** | Chi extend 1 | Implement nhieu |
| **Version** | Java 1.0+ | Java 8+ (voi default methods) |

### Decision Flowchart

\`\`\`mermaid
graph TD
    START[Can chia se code giua cac class?]
    START -->|Co| Q1[Can luu state/field?]
    START -->|Khong| INTERFACE[Dung Interface]

    Q1 -->|Co| Q2[Co quan he IS-A ro rang?]
    Q1 -->|Khong| INTERFACE

    Q2 -->|Co| ABSTRACT[Dung Abstract Class]
    Q2 -->|Khong| Q3[Can ke thua nhieu?]

    Q3 -->|Co| INTERFACE
    Q3 -->|Khong| ABSTRACT

    style ABSTRACT fill:#3b82f6,color:#fff
    style INTERFACE fill:#22c55e,color:#fff
\`\`\`

### Real-world Example

\`\`\`java
// Abstract class - vi co shared state va IS-A relationship
public abstract class AbstractRepository<T, ID> {
    protected final DataSource dataSource;
    protected final String tableName;

    protected AbstractRepository(DataSource dataSource, String tableName) {
        this.dataSource = dataSource;
        this.tableName = tableName;
    }

    // Template methods
    public T findById(ID id) {
        String sql = "SELECT * FROM " + tableName + " WHERE id = ?";
        // ... execute va map
        return mapRow(resultSet);
    }

    protected abstract T mapRow(ResultSet rs) throws SQLException;
    protected abstract String getInsertSQL();
}

// Interface - vi la capability, co the co nhieu
public interface Cacheable {
    default Duration getCacheTTL() { return Duration.ofMinutes(5); }
    default String getCacheKey() { return getClass().getSimpleName(); }
}

public interface Searchable<T> {
    List<T> search(String query);
    default List<T> search(String query, int limit) {
        return search(query).stream().limit(limit).collect(Collectors.toList());
    }
}

// Ket hop ca hai
public class UserRepository extends AbstractRepository<User, Long>
    implements Cacheable, Searchable<User> {

    public UserRepository(DataSource ds) {
        super(ds, "users");
    }

    @Override
    protected User mapRow(ResultSet rs) throws SQLException {
        return new User(rs.getLong("id"), rs.getString("name"));
    }

    @Override
    protected String getInsertSQL() {
        return "INSERT INTO users (name, email) VALUES (?, ?)";
    }

    @Override
    public List<User> search(String query) {
        // Full-text search implementation
        return List.of();
    }

    @Override
    public Duration getCacheTTL() {
        return Duration.ofMinutes(10);  // Override default
    }
}
\`\`\`

> ⚠️ Lưu ý: Trong thuc te, hay bat dau voi **interface**. Chi chuyen sang abstract class khi can chia se state hoac constructor logic. "Program to an interface, not an implementation" - Gang of Four.
    `
  },
  {
    id: 5,
    title: "SOLID Principles",
    desc: "5 nguyen tac thiet ke OOP - SRP, OCP, LSP, ISP, DIP voi code examples",
    content: `
## SOLID la gi?

5 nguyen tac thiet ke giup code **de bao tri, de mo rong, de test**.

| Nguyen tac | Viet tat | Y nghia |
|------------|----------|---------|
| **S**ingle Responsibility | SRP | Moi class chi co 1 ly do de thay doi |
| **O**pen/Closed | OCP | Mo cho mo rong, dong cho thay doi |
| **L**iskov Substitution | LSP | Subclass phai thay the duoc superclass |
| **I**nterface Segregation | ISP | Interface nho, chuyen biet |
| **D**ependency Inversion | DIP | Phu thuoc vao abstraction, khong phu thuoc implementation |

## S - Single Responsibility Principle

> "Mot class chi nen co MOT ly do de thay doi"

\`\`\`java
// BAD - Class lam qua nhieu viec
public class UserService {
    public void createUser(User user) {
        // 1. Validate user
        if (user.getEmail() == null) throw new ValidationException("Email required");
        if (!user.getEmail().matches(".*@.*")) throw new ValidationException("Invalid email");

        // 2. Save to database
        Connection conn = DriverManager.getConnection(DB_URL);
        PreparedStatement stmt = conn.prepareStatement("INSERT INTO users ...");
        stmt.executeUpdate();

        // 3. Send welcome email
        Session session = Session.getInstance(mailProperties);
        MimeMessage message = new MimeMessage(session);
        message.setSubject("Welcome!");
        Transport.send(message);

        // 4. Log audit
        FileWriter fw = new FileWriter("audit.log", true);
        fw.write("User created: " + user.getEmail());
        fw.close();
    }
}

// GOOD - Tach trach nhiem
public class UserValidator {
    public void validate(User user) {
        if (user.getEmail() == null) throw new ValidationException("Email required");
        if (!user.getEmail().matches(".*@.*")) throw new ValidationException("Invalid email");
    }
}

public class UserRepository {
    private final DataSource dataSource;

    public UserRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void save(User user) {
        // Chi lam viec voi database
    }
}

public class EmailService {
    public void sendWelcomeEmail(User user) {
        // Chi lam viec voi email
    }
}

public class AuditLogger {
    public void log(String action, String details) {
        // Chi lam viec voi audit log
    }
}

// UserService chi DIEU PHOI
public class UserService {
    private final UserValidator validator;
    private final UserRepository repository;
    private final EmailService emailService;
    private final AuditLogger auditLogger;

    public UserService(UserValidator validator, UserRepository repository,
                       EmailService emailService, AuditLogger auditLogger) {
        this.validator = validator;
        this.repository = repository;
        this.emailService = emailService;
        this.auditLogger = auditLogger;
    }

    public void createUser(User user) {
        validator.validate(user);
        repository.save(user);
        emailService.sendWelcomeEmail(user);
        auditLogger.log("USER_CREATED", user.getEmail());
    }
}
\`\`\`

## O - Open/Closed Principle

> "Mo cho mo rong (extension), dong cho thay doi (modification)"

\`\`\`java
// BAD - Them loai discount moi phai SUA code cu
public class DiscountCalculator {
    public double calculate(Order order, String discountType) {
        switch (discountType) {
            case "PERCENTAGE":
                return order.getTotal() * 0.1;
            case "FIXED":
                return 50.0;
            case "BUY_ONE_GET_ONE":
                return order.getTotal() / 2;
            // Them loai moi? Phai sua method nay!
            default:
                return 0;
        }
    }
}

// GOOD - Strategy Pattern, mo cho extension
public interface DiscountStrategy {
    double calculate(Order order);
    boolean isApplicable(Order order);
}

public class PercentageDiscount implements DiscountStrategy {
    private final double percent;

    public PercentageDiscount(double percent) {
        this.percent = percent;
    }

    @Override
    public double calculate(Order order) {
        return order.getTotal() * percent / 100;
    }

    @Override
    public boolean isApplicable(Order order) {
        return true;
    }
}

public class FixedDiscount implements DiscountStrategy {
    private final double amount;

    public FixedDiscount(double amount) {
        this.amount = amount;
    }

    @Override
    public double calculate(Order order) {
        return Math.min(amount, order.getTotal());
    }

    @Override
    public boolean isApplicable(Order order) {
        return order.getTotal() >= amount;
    }
}

// Them loai discount MOI khong can sua code cu
public class FirstOrderDiscount implements DiscountStrategy {
    @Override
    public double calculate(Order order) {
        return order.getTotal() * 0.2;  // 20% cho don dau
    }

    @Override
    public boolean isApplicable(Order order) {
        return order.getCustomer().getOrderCount() == 0;
    }
}

// Calculator dong cho modification
public class DiscountCalculator {
    private final List<DiscountStrategy> strategies;

    public DiscountCalculator(List<DiscountStrategy> strategies) {
        this.strategies = strategies;
    }

    public double calculateBestDiscount(Order order) {
        return strategies.stream()
            .filter(s -> s.isApplicable(order))
            .mapToDouble(s -> s.calculate(order))
            .max()
            .orElse(0.0);
    }
}
\`\`\`

## L - Liskov Substitution Principle

> "Subclass phai thay the duoc superclass ma KHONG lam sai behavior"

\`\`\`java
// BAD - Vi pham LSP (vi du kinh dien)
public class Rectangle {
    protected int width;
    protected int height;

    public void setWidth(int width) { this.width = width; }
    public void setHeight(int height) { this.height = height; }
    public int getArea() { return width * height; }
}

public class Square extends Rectangle {
    @Override
    public void setWidth(int width) {
        this.width = width;
        this.height = width;  // Vi pham LSP! Thay doi ca height
    }

    @Override
    public void setHeight(int height) {
        this.width = height;  // Vi pham LSP! Thay doi ca width
        this.height = height;
    }
}

// Test that bai
void testArea(Rectangle r) {
    r.setWidth(5);
    r.setHeight(4);
    assert r.getArea() == 20;  // FAIL voi Square! (16 thay vi 20)
}

// GOOD - Dung composition thay vi inheritance sai
public interface Shape {
    int getArea();
}

public class Rectangle implements Shape {
    private final int width;
    private final int height;

    public Rectangle(int width, int height) {
        this.width = width;
        this.height = height;
    }

    @Override
    public int getArea() { return width * height; }
}

public class Square implements Shape {
    private final int side;

    public Square(int side) {
        this.side = side;
    }

    @Override
    public int getArea() { return side * side; }
}
\`\`\`

### LSP Rules

\`\`\`text
1. Preconditions: Subclass KHONG DUOC tat hon (yeu cau it nhat bang parent)
2. Postconditions: Subclass KHONG DUOC yeu hon (dam bao it nhat bang parent)
3. Invariants: Subclass PHAI giu nguyen invariants cua parent
4. History constraint: Subclass KHONG DUOC thay doi state ma parent khong cho phep
\`\`\`

## I - Interface Segregation Principle

> "Client KHONG NEN bi ep implement interface ma no khong dung"

\`\`\`java
// BAD - Fat interface
public interface Worker {
    void work();
    void eat();
    void sleep();
    void attendMeeting();
    void writeReport();
}

// Robot phai implement eat() va sleep()??
public class Robot implements Worker {
    public void work() { /* OK */ }
    public void eat() { /* ??? Khong y nghia */ }
    public void sleep() { /* ??? Khong y nghia */ }
    public void attendMeeting() { /* ??? */ }
    public void writeReport() { /* ??? */ }
}

// GOOD - Tach interface nho, chuyen biet
public interface Workable {
    void work();
}

public interface Feedable {
    void eat();
    void sleep();
}

public interface Reportable {
    void writeReport();
    void attendMeeting();
}

// Human implement tat ca
public class HumanWorker implements Workable, Feedable, Reportable {
    public void work() { /* ... */ }
    public void eat() { /* ... */ }
    public void sleep() { /* ... */ }
    public void writeReport() { /* ... */ }
    public void attendMeeting() { /* ... */ }
}

// Robot chi implement nhung gi can
public class RobotWorker implements Workable {
    public void work() { /* ... */ }
}
\`\`\`

## D - Dependency Inversion Principle

> "Depend on abstractions, not concretions"

\`\`\`mermaid
graph TD
    subgraph "BAD - High-level depends on Low-level"
        OS1[OrderService] -->|"depends on"| MR1[MySQLRepository]
        OS1 -->|"depends on"| SE1[SmtpEmailSender]
    end
\`\`\`

\`\`\`mermaid
graph TD
    subgraph "GOOD - Both depend on Abstractions"
        OS2[OrderService] -->|"depends on"| REPO[Repository Interface]
        OS2 -->|"depends on"| EMAIL[EmailSender Interface]
        MR2[MySQLRepository] -.->|"implements"| REPO
        PR2[PostgresRepository] -.->|"implements"| REPO
        SE2[SmtpEmailSender] -.->|"implements"| EMAIL
        SES2[SESEmailSender] -.->|"implements"| EMAIL
    end
\`\`\`

\`\`\`java
// BAD - Depend truc tiep vao implementation
public class OrderService {
    private MySQLOrderRepository repository = new MySQLOrderRepository();
    private SmtpEmailService emailService = new SmtpEmailService();

    public void placeOrder(Order order) {
        repository.save(order);          // Doi sang Postgres? SUA code
        emailService.send(order.getEmail(), "Order confirmed");
    }
}

// GOOD - Depend vao abstraction
public interface OrderRepository {
    void save(Order order);
    Optional<Order> findById(Long id);
}

public interface NotificationService {
    void notify(String recipient, String message);
}

public class OrderService {
    private final OrderRepository repository;          // Interface
    private final NotificationService notification;    // Interface

    // Inject dependencies qua constructor
    public OrderService(OrderRepository repository, NotificationService notification) {
        this.repository = repository;
        this.notification = notification;
    }

    public void placeOrder(Order order) {
        repository.save(order);
        notification.notify(order.getEmail(), "Order confirmed");
    }
}

// Implementation co the thay doi tu do
public class PostgresOrderRepository implements OrderRepository {
    @Override public void save(Order order) { /* Postgres logic */ }
    @Override public Optional<Order> findById(Long id) { /* ... */ return Optional.empty(); }
}

public class SESNotificationService implements NotificationService {
    @Override public void notify(String recipient, String message) { /* AWS SES */ }
}

// Wiring (trong Spring thi dung @Autowired)
OrderRepository repo = new PostgresOrderRepository();
NotificationService notif = new SESNotificationService();
OrderService service = new OrderService(repo, notif);

// Testing - dung mock
OrderRepository mockRepo = mock(OrderRepository.class);
NotificationService mockNotif = mock(NotificationService.class);
OrderService testService = new OrderService(mockRepo, mockNotif);
\`\`\`

> ⚠️ Lưu ý: SOLID khong phai ap dung may moc. Over-engineering con te hon khong co SOLID. Hay ap dung **khi can thiet** - khi code bat dau phuc tap, khi can test, khi can mo rong. "Simple is better than complex, but complex is better than complicated."
    `
  },
  {
    id: 6,
    title: "Design Patterns - Creational",
    desc: "Singleton, Factory, Builder, Prototype, Object Pool - patterns tao doi tuong",
    content: `
## Tai sao can Design Patterns?

Design Patterns la **giai phap da duoc chung minh** cho cac van de thiet ke thuong gap. Khong phai phat minh lai banh xe.

\`\`\`mermaid
graph TD
    subgraph "Creational Patterns"
        S[Singleton] --- F[Factory Method]
        F --- AF[Abstract Factory]
        AF --- B[Builder]
        B --- P[Prototype]
        P --- OP[Object Pool]
    end
    style S fill:#3b82f6,color:#fff
    style F fill:#22c55e,color:#fff
    style AF fill:#f59e0b,color:#fff
    style B fill:#ef4444,color:#fff
    style P fill:#8b5cf6,color:#fff
    style OP fill:#ec4899,color:#fff
\`\`\`

## Singleton Pattern

Dam bao mot class chi co **DUY NHAT 1 instance** trong toan bo ung dung.

### Cach 1: Eager Initialization

\`\`\`java
public class DatabaseConfig {
    // Tao ngay khi class duoc load
    private static final DatabaseConfig INSTANCE = new DatabaseConfig();

    private String url = "jdbc:mysql://localhost:3306/mydb";
    private int maxConnections = 10;

    private DatabaseConfig() { }  // Private constructor

    public static DatabaseConfig getInstance() {
        return INSTANCE;
    }
}
\`\`\`

### Cach 2: Lazy Initialization (Thread-safe voi Double-Checked Locking)

\`\`\`java
public class ConnectionPool {
    // volatile dam bao visibility giua threads
    private static volatile ConnectionPool instance;

    private final List<Connection> pool;

    private ConnectionPool() {
        pool = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            pool.add(createConnection());
        }
    }

    public static ConnectionPool getInstance() {
        if (instance == null) {                    // Check 1 (no lock)
            synchronized (ConnectionPool.class) {
                if (instance == null) {            // Check 2 (with lock)
                    instance = new ConnectionPool();
                }
            }
        }
        return instance;
    }

    private Connection createConnection() {
        // ...
        return null;
    }
}
\`\`\`

### Cach 3: Enum Singleton (Recommended by Joshua Bloch)

\`\`\`java
public enum AppConfig {
    INSTANCE;

    private String appName;
    private String version;
    private Map<String, String> properties;

    AppConfig() {
        // Load config
        this.properties = new HashMap<>();
        this.appName = "MyApp";
        this.version = "1.0.0";
    }

    public String getProperty(String key) {
        return properties.get(key);
    }

    public void setProperty(String key, String value) {
        properties.put(key, value);
    }
}

// Su dung
String name = AppConfig.INSTANCE.getProperty("app.name");
\`\`\`

### Cach 4: Holder Pattern (Lazy + Thread-safe + No synchronization)

\`\`\`java
public class Registry {
    private Registry() { }

    // Inner class chi duoc load khi getInstance() duoc goi
    private static class Holder {
        private static final Registry INSTANCE = new Registry();
    }

    public static Registry getInstance() {
        return Holder.INSTANCE;
    }
}
\`\`\`

| Cach | Thread-safe | Lazy | Performance | Serialization-safe |
|------|:-----------:|:----:|:-----------:|:------------------:|
| Eager | Co | Khong | Tot | Khong |
| Double-checked | Co | Co | Tot (sau init) | Khong |
| Enum | Co | Khong | Tot | Co |
| Holder | Co | Co | Tot | Khong |

## Factory Method Pattern

\`\`\`mermaid
classDiagram
    class Notification {
        <<interface>>
        +send(String message) void
    }
    class EmailNotification {
        +send(String message) void
    }
    class SMSNotification {
        +send(String message) void
    }
    class PushNotification {
        +send(String message) void
    }
    class NotificationFactory {
        +create(String type)$ Notification
    }

    Notification <|.. EmailNotification
    Notification <|.. SMSNotification
    Notification <|.. PushNotification
    NotificationFactory --> Notification
\`\`\`

\`\`\`java
public interface Notification {
    void send(String message);
}

public class EmailNotification implements Notification {
    @Override
    public void send(String message) {
        System.out.println("Sending EMAIL: " + message);
    }
}

public class SMSNotification implements Notification {
    @Override
    public void send(String message) {
        System.out.println("Sending SMS: " + message);
    }
}

public class PushNotification implements Notification {
    @Override
    public void send(String message) {
        System.out.println("Sending PUSH: " + message);
    }
}

// Simple Factory
public class NotificationFactory {
    public static Notification create(String type) {
        return switch (type.toUpperCase()) {
            case "EMAIL" -> new EmailNotification();
            case "SMS" -> new SMSNotification();
            case "PUSH" -> new PushNotification();
            default -> throw new IllegalArgumentException("Unknown type: " + type);
        };
    }

    // Factory voi Registry (OCP-compliant)
    private static final Map<String, Supplier<Notification>> registry = new HashMap<>();

    static {
        registry.put("EMAIL", EmailNotification::new);
        registry.put("SMS", SMSNotification::new);
        registry.put("PUSH", PushNotification::new);
    }

    public static void register(String type, Supplier<Notification> supplier) {
        registry.put(type.toUpperCase(), supplier);
    }

    public static Notification createFromRegistry(String type) {
        Supplier<Notification> supplier = registry.get(type.toUpperCase());
        if (supplier == null) throw new IllegalArgumentException("Unknown type: " + type);
        return supplier.get();
    }
}
\`\`\`

## Abstract Factory Pattern

\`\`\`java
// Abstract products
public interface Button {
    void render();
    void onClick(Runnable action);
}

public interface TextField {
    void render();
    String getValue();
}

public interface Dialog {
    void show();
}

// Abstract factory
public interface UIFactory {
    Button createButton(String text);
    TextField createTextField(String placeholder);
    Dialog createDialog(String title, String message);
}

// Concrete factory: Material Design
public class MaterialUIFactory implements UIFactory {
    @Override
    public Button createButton(String text) {
        return new MaterialButton(text);  // Elevated, ripple effect
    }

    @Override
    public TextField createTextField(String placeholder) {
        return new MaterialTextField(placeholder);  // Outlined, floating label
    }

    @Override
    public Dialog createDialog(String title, String message) {
        return new MaterialDialog(title, message);
    }
}

// Concrete factory: iOS Style
public class IOSUIFactory implements UIFactory {
    @Override
    public Button createButton(String text) {
        return new IOSButton(text);  // Rounded, blue tint
    }

    @Override
    public TextField createTextField(String placeholder) {
        return new IOSTextField(placeholder);  // Rounded rectangle
    }

    @Override
    public Dialog createDialog(String title, String message) {
        return new IOSDialog(title, message);  // Alert sheet
    }
}

// Client code - KHONG biet dang dung UI nao
public class Application {
    private final UIFactory uiFactory;

    public Application(UIFactory uiFactory) {
        this.uiFactory = uiFactory;
    }

    public void buildUI() {
        Button submitBtn = uiFactory.createButton("Submit");
        TextField nameField = uiFactory.createTextField("Enter name");
        Dialog confirmDialog = uiFactory.createDialog("Confirm", "Are you sure?");

        submitBtn.onClick(() -> confirmDialog.show());
        submitBtn.render();
        nameField.render();
    }
}
\`\`\`

## Builder Pattern (Step Builder)

\`\`\`java
// Step Builder - enforce thu tu tao object
public class Pizza {
    private final String size;
    private final String crust;
    private final List<String> toppings;
    private final boolean extraCheese;

    private Pizza(FinalBuilder builder) {
        this.size = builder.size;
        this.crust = builder.crust;
        this.toppings = List.copyOf(builder.toppings);
        this.extraCheese = builder.extraCheese;
    }

    // Step 1: Chon size (BAT BUOC)
    public interface SizeStep {
        CrustStep size(String size);
    }

    // Step 2: Chon crust (BAT BUOC)
    public interface CrustStep {
        ToppingStep crust(String crust);
    }

    // Step 3: Them toppings (Optional)
    public interface ToppingStep {
        ToppingStep addTopping(String topping);
        FinalBuilder extraCheese(boolean extra);
        Pizza build();
    }

    // Final step
    public static class FinalBuilder implements SizeStep, CrustStep, ToppingStep {
        private String size;
        private String crust;
        private List<String> toppings = new ArrayList<>();
        private boolean extraCheese = false;

        private FinalBuilder() { }

        public static SizeStep builder() {
            return new FinalBuilder();
        }

        @Override
        public CrustStep size(String size) { this.size = size; return this; }

        @Override
        public ToppingStep crust(String crust) { this.crust = crust; return this; }

        @Override
        public ToppingStep addTopping(String topping) {
            this.toppings.add(topping);
            return this;
        }

        @Override
        public FinalBuilder extraCheese(boolean extra) {
            this.extraCheese = extra;
            return this;
        }

        @Override
        public Pizza build() { return new Pizza(this); }
    }
}

// Su dung - compiler enforce thu tu!
Pizza pizza = Pizza.FinalBuilder.builder()
    .size("Large")           // Phai chon size truoc
    .crust("Thin")           // Roi chon crust
    .addTopping("Pepperoni") // Tuy chon
    .addTopping("Mushrooms")
    .extraCheese(true)
    .build();
\`\`\`

## Prototype Pattern

\`\`\`java
public interface Prototype<T> {
    T deepCopy();
}

public class GameCharacter implements Prototype<GameCharacter> {
    private String name;
    private int level;
    private Map<String, Integer> stats;
    private List<String> inventory;

    public GameCharacter(String name, int level) {
        this.name = name;
        this.level = level;
        this.stats = new HashMap<>();
        this.inventory = new ArrayList<>();
    }

    // Deep copy
    @Override
    public GameCharacter deepCopy() {
        GameCharacter copy = new GameCharacter(this.name, this.level);
        copy.stats = new HashMap<>(this.stats);
        copy.inventory = new ArrayList<>(this.inventory);
        return copy;
    }
}

// Prototype Registry
public class CharacterRegistry {
    private static final Map<String, GameCharacter> prototypes = new HashMap<>();

    static {
        GameCharacter warrior = new GameCharacter("Warrior", 1);
        warrior.getStats().put("STR", 15);
        warrior.getStats().put("DEF", 12);
        prototypes.put("warrior", warrior);

        GameCharacter mage = new GameCharacter("Mage", 1);
        mage.getStats().put("INT", 18);
        mage.getStats().put("MP", 100);
        prototypes.put("mage", mage);
    }

    public static GameCharacter create(String type) {
        GameCharacter prototype = prototypes.get(type);
        if (prototype == null) throw new IllegalArgumentException("Unknown type: " + type);
        return prototype.deepCopy();
    }
}

// Su dung
GameCharacter myWarrior = CharacterRegistry.create("warrior");
myWarrior.setName("Aragorn");  // Modify copy, khong anh huong prototype
\`\`\`

## Object Pool Pattern

\`\`\`java
public class ObjectPool<T> {
    private final Queue<T> pool;
    private final Supplier<T> creator;
    private final Consumer<T> resetter;
    private final int maxSize;

    public ObjectPool(Supplier<T> creator, Consumer<T> resetter, int initialSize, int maxSize) {
        this.creator = creator;
        this.resetter = resetter;
        this.maxSize = maxSize;
        this.pool = new ConcurrentLinkedQueue<>();

        for (int i = 0; i < initialSize; i++) {
            pool.offer(creator.get());
        }
    }

    public T acquire() {
        T obj = pool.poll();
        return (obj != null) ? obj : creator.get();
    }

    public void release(T obj) {
        if (pool.size() < maxSize) {
            resetter.accept(obj);  // Reset state
            pool.offer(obj);       // Tra lai pool
        }
        // Neu pool day, bo qua (GC se thu gom)
    }
}

// Su dung cho StringBuilder (avoid repeated allocation)
ObjectPool<StringBuilder> sbPool = new ObjectPool<>(
    () -> new StringBuilder(256),          // Creator
    sb -> sb.setLength(0),                 // Resetter
    10,                                     // Initial size
    50                                      // Max size
);

StringBuilder sb = sbPool.acquire();
try {
    sb.append("Hello ").append("World");
    String result = sb.toString();
} finally {
    sbPool.release(sb);  // LUON tra lai pool
}
\`\`\`

> ⚠️ Lưu ý: Object Pool huu ich khi object **dat de tao** (database connections, thread, heavy buffers). Voi object nhe, JVM GC da du nhanh - khong can pool. Don't optimize prematurely.
    `
  },
  {
    id: 7,
    title: "Design Patterns - Structural & Behavioral",
    desc: "Adapter, Decorator, Proxy, Observer, Strategy, Template Method, Command, Chain of Responsibility",
    content: `
## Structural Patterns

### Adapter Pattern

Chuyen doi interface cua mot class thanh interface ma client mong doi.

\`\`\`java
// Interface client mong doi
public interface MediaPlayer {
    void play(String filename);
}

// Class cu (legacy) co interface khac
public class VLCPlayer {
    public void playVLC(String filename) {
        System.out.println("Playing VLC: " + filename);
    }
}

public class FFmpegPlayer {
    public void playFFmpeg(String filename) {
        System.out.println("Playing FFmpeg: " + filename);
    }
}

// Adapter - chuyen doi interface
public class MediaAdapter implements MediaPlayer {
    private final VLCPlayer vlcPlayer;
    private final FFmpegPlayer ffmpegPlayer;

    public MediaAdapter() {
        this.vlcPlayer = new VLCPlayer();
        this.ffmpegPlayer = new FFmpegPlayer();
    }

    @Override
    public void play(String filename) {
        if (filename.endsWith(".vlc")) {
            vlcPlayer.playVLC(filename);
        } else if (filename.endsWith(".mp4")) {
            ffmpegPlayer.playFFmpeg(filename);
        } else {
            throw new UnsupportedOperationException("Format not supported: " + filename);
        }
    }
}

// Real-world: java.util.Arrays.asList() - adapter Array → List
// Real-world: java.io.InputStreamReader - adapter InputStream → Reader
\`\`\`

### Decorator Pattern

Them chuc nang moi cho object **DONG** (tai runtime) ma khong thay doi class goc.

\`\`\`java
// Base interface
public interface DataSource {
    void writeData(String data);
    String readData();
}

// Core implementation
public class FileDataSource implements DataSource {
    private final String filename;

    public FileDataSource(String filename) {
        this.filename = filename;
    }

    @Override
    public void writeData(String data) {
        // Ghi file binh thuong
        System.out.println("Writing to " + filename + ": " + data);
    }

    @Override
    public String readData() {
        return "raw data from " + filename;
    }
}

// Base Decorator
public abstract class DataSourceDecorator implements DataSource {
    protected final DataSource wrappee;

    public DataSourceDecorator(DataSource wrappee) {
        this.wrappee = wrappee;
    }

    @Override
    public void writeData(String data) { wrappee.writeData(data); }

    @Override
    public String readData() { return wrappee.readData(); }
}

// Concrete Decorators
public class EncryptionDecorator extends DataSourceDecorator {
    public EncryptionDecorator(DataSource wrappee) {
        super(wrappee);
    }

    @Override
    public void writeData(String data) {
        String encrypted = encrypt(data);
        super.writeData(encrypted);
    }

    @Override
    public String readData() {
        return decrypt(super.readData());
    }

    private String encrypt(String data) { return "ENCRYPTED[" + data + "]"; }
    private String decrypt(String data) { return data.replace("ENCRYPTED[", "").replace("]", ""); }
}

public class CompressionDecorator extends DataSourceDecorator {
    public CompressionDecorator(DataSource wrappee) {
        super(wrappee);
    }

    @Override
    public void writeData(String data) {
        String compressed = compress(data);
        super.writeData(compressed);
    }

    @Override
    public String readData() {
        return decompress(super.readData());
    }

    private String compress(String data) { return "COMPRESSED[" + data + "]"; }
    private String decompress(String data) { return data.replace("COMPRESSED[", "").replace("]", ""); }
}

// Su dung - WRAP tung lop
DataSource source = new FileDataSource("data.txt");
source = new CompressionDecorator(source);  // Them compression
source = new EncryptionDecorator(source);   // Them encryption

source.writeData("Hello World");
// → encrypt → compress → write to file

// Real-world Java: java.io Decorator chain
InputStream is = new BufferedInputStream(
    new GZIPInputStream(
        new FileInputStream("data.gz")
    )
);
\`\`\`

### Proxy Pattern

\`\`\`java
public interface ImageService {
    byte[] loadImage(String url);
    void processImage(String url);
}

// Real implementation
public class ImageServiceImpl implements ImageService {
    @Override
    public byte[] loadImage(String url) {
        System.out.println("Loading image from: " + url);
        return new byte[0]; // actual loading
    }

    @Override
    public void processImage(String url) {
        System.out.println("Processing: " + url);
    }
}

// Caching Proxy
public class CachingImageProxy implements ImageService {
    private final ImageService delegate;
    private final Map<String, byte[]> cache = new ConcurrentHashMap<>();

    public CachingImageProxy(ImageService delegate) {
        this.delegate = delegate;
    }

    @Override
    public byte[] loadImage(String url) {
        return cache.computeIfAbsent(url, delegate::loadImage);
    }

    @Override
    public void processImage(String url) {
        delegate.processImage(url);
    }
}

// Logging Proxy
public class LoggingImageProxy implements ImageService {
    private final ImageService delegate;
    private static final Logger log = Logger.getLogger(LoggingImageProxy.class.getName());

    public LoggingImageProxy(ImageService delegate) {
        this.delegate = delegate;
    }

    @Override
    public byte[] loadImage(String url) {
        long start = System.currentTimeMillis();
        byte[] result = delegate.loadImage(url);
        log.info("loadImage(" + url + ") took " + (System.currentTimeMillis() - start) + "ms");
        return result;
    }

    @Override
    public void processImage(String url) {
        long start = System.currentTimeMillis();
        delegate.processImage(url);
        log.info("processImage(" + url + ") took " + (System.currentTimeMillis() - start) + "ms");
    }
}

// Stack proxies
ImageService service = new LoggingImageProxy(
    new CachingImageProxy(
        new ImageServiceImpl()
    )
);

// Real-world: Collections.unmodifiableList() - Protection Proxy
// Real-world: Spring AOP @Transactional - Dynamic Proxy
\`\`\`

### Facade Pattern

\`\`\`java
// Complex subsystem
class VideoDecoder { void decode(String file) { } }
class AudioDecoder { void decode(String file) { } }
class SubtitleLoader { void load(String file) { } }
class VideoRenderer { void render() { } }
class AudioMixer { void mix() { } }

// Facade - Giup don interface phuc tap
public class MediaPlayerFacade {
    private final VideoDecoder videoDecoder = new VideoDecoder();
    private final AudioDecoder audioDecoder = new AudioDecoder();
    private final SubtitleLoader subtitleLoader = new SubtitleLoader();
    private final VideoRenderer videoRenderer = new VideoRenderer();
    private final AudioMixer audioMixer = new AudioMixer();

    // Method don gian cho client
    public void playMovie(String videoFile, String audioFile, String subtitleFile) {
        videoDecoder.decode(videoFile);
        audioDecoder.decode(audioFile);
        subtitleLoader.load(subtitleFile);
        audioMixer.mix();
        videoRenderer.render();
    }
}
\`\`\`

## Behavioral Patterns

### Observer Pattern

\`\`\`java
// Generic event system
public interface EventListener<T> {
    void onEvent(T event);
}

public class EventBus {
    private final Map<Class<?>, List<EventListener<?>>> listeners = new ConcurrentHashMap<>();

    public <T> void subscribe(Class<T> eventType, EventListener<T> listener) {
        listeners.computeIfAbsent(eventType, k -> new CopyOnWriteArrayList<>()).add(listener);
    }

    @SuppressWarnings("unchecked")
    public <T> void publish(T event) {
        List<EventListener<?>> eventListeners = listeners.get(event.getClass());
        if (eventListeners != null) {
            for (EventListener<?> listener : eventListeners) {
                ((EventListener<T>) listener).onEvent(event);
            }
        }
    }
}

// Events
public record OrderCreatedEvent(String orderId, BigDecimal total) { }
public record OrderPaidEvent(String orderId, String paymentMethod) { }

// Listeners
public class InventoryListener implements EventListener<OrderCreatedEvent> {
    @Override
    public void onEvent(OrderCreatedEvent event) {
        System.out.println("Reserving inventory for order: " + event.orderId());
    }
}

public class EmailListener implements EventListener<OrderPaidEvent> {
    @Override
    public void onEvent(OrderPaidEvent event) {
        System.out.println("Sending confirmation email for: " + event.orderId());
    }
}

// Wiring
EventBus bus = new EventBus();
bus.subscribe(OrderCreatedEvent.class, new InventoryListener());
bus.subscribe(OrderPaidEvent.class, new EmailListener());

bus.publish(new OrderCreatedEvent("ORD-001", BigDecimal.valueOf(99.99)));
\`\`\`

### Strategy Pattern

\`\`\`java
@FunctionalInterface
public interface SortStrategy<T> {
    void sort(List<T> list, Comparator<T> comparator);
}

public class Sorter<T> {
    private SortStrategy<T> strategy;

    public Sorter(SortStrategy<T> strategy) {
        this.strategy = strategy;
    }

    public void setStrategy(SortStrategy<T> strategy) {
        this.strategy = strategy;
    }

    public void sort(List<T> list, Comparator<T> comparator) {
        strategy.sort(list, comparator);
    }
}

// Strategies
SortStrategy<Integer> bubbleSort = (list, comp) -> {
    for (int i = 0; i < list.size(); i++)
        for (int j = 0; j < list.size() - 1; j++)
            if (comp.compare(list.get(j), list.get(j+1)) > 0)
                Collections.swap(list, j, j+1);
};

SortStrategy<Integer> jdkSort = (list, comp) -> list.sort(comp);

// Dynamic strategy selection
Sorter<Integer> sorter = new Sorter<>(jdkSort);
if (list.size() < 10) {
    sorter.setStrategy(bubbleSort);  // Nho thi dung bubble
}
sorter.sort(list, Comparator.naturalOrder());
\`\`\`

### Template Method Pattern

\`\`\`java
public abstract class DataProcessor {

    // Template method - dinh nghia SKELETON cua algorithm
    public final void process() {
        openSource();
        List<String> rawData = readData();
        List<String> processed = transformData(rawData);
        writeOutput(processed);
        closeSource();
        notifyCompletion();
    }

    // Steps de subclass implement
    protected abstract void openSource();
    protected abstract List<String> readData();
    protected abstract List<String> transformData(List<String> data);
    protected abstract void writeOutput(List<String> data);
    protected abstract void closeSource();

    // Hook method - optional override
    protected void notifyCompletion() {
        System.out.println("Processing complete.");
    }
}

public class CSVProcessor extends DataProcessor {
    @Override protected void openSource() { System.out.println("Opening CSV file..."); }
    @Override protected List<String> readData() { return List.of("a,1", "b,2"); }
    @Override protected List<String> transformData(List<String> data) {
        return data.stream().map(s -> s.replace(",", " | ")).collect(Collectors.toList());
    }
    @Override protected void writeOutput(List<String> data) { data.forEach(System.out::println); }
    @Override protected void closeSource() { System.out.println("Closing CSV file."); }
}
\`\`\`

### Command Pattern

\`\`\`java
public interface Command {
    void execute();
    void undo();
}

public class TextEditor {
    private StringBuilder content = new StringBuilder();
    private final Deque<Command> history = new ArrayDeque<>();

    public void executeCommand(Command cmd) {
        cmd.execute();
        history.push(cmd);
    }

    public void undo() {
        if (!history.isEmpty()) {
            history.pop().undo();
        }
    }

    // Commands
    public class InsertCommand implements Command {
        private final int position;
        private final String text;

        public InsertCommand(int position, String text) {
            this.position = position;
            this.text = text;
        }

        @Override
        public void execute() { content.insert(position, text); }
        @Override
        public void undo() { content.delete(position, position + text.length()); }
    }

    public class DeleteCommand implements Command {
        private final int start, end;
        private String deleted;

        public DeleteCommand(int start, int end) {
            this.start = start;
            this.end = end;
        }

        @Override
        public void execute() {
            deleted = content.substring(start, end);
            content.delete(start, end);
        }

        @Override
        public void undo() { content.insert(start, deleted); }
    }
}
\`\`\`

### Chain of Responsibility

\`\`\`java
public abstract class RequestHandler {
    private RequestHandler next;

    public RequestHandler setNext(RequestHandler next) {
        this.next = next;
        return next;
    }

    public void handle(HttpRequest request) {
        if (canHandle(request)) {
            process(request);
        } else if (next != null) {
            next.handle(request);
        } else {
            throw new RuntimeException("No handler for request: " + request);
        }
    }

    protected abstract boolean canHandle(HttpRequest request);
    protected abstract void process(HttpRequest request);
}

// Middleware chain
class AuthHandler extends RequestHandler {
    protected boolean canHandle(HttpRequest request) {
        return request.getHeader("Authorization") == null;
    }
    protected void process(HttpRequest request) {
        throw new SecurityException("Unauthorized");
    }
}

class RateLimitHandler extends RequestHandler {
    private final Map<String, AtomicInteger> counters = new ConcurrentHashMap<>();

    protected boolean canHandle(HttpRequest request) {
        String ip = request.getRemoteAddr();
        return counters.computeIfAbsent(ip, k -> new AtomicInteger(0)).incrementAndGet() > 100;
    }
    protected void process(HttpRequest request) {
        throw new RuntimeException("Rate limit exceeded");
    }
}
\`\`\`

### State Pattern

\`\`\`java
public interface OrderState {
    void next(OrderContext context);
    void previous(OrderContext context);
    String getStatus();
}

public class OrderContext {
    private OrderState state;

    public OrderContext() {
        this.state = new PendingState();
    }

    public void setState(OrderState state) { this.state = state; }
    public void next() { state.next(this); }
    public void previous() { state.previous(this); }
    public String getStatus() { return state.getStatus(); }
}

public class PendingState implements OrderState {
    @Override public void next(OrderContext ctx) { ctx.setState(new ProcessingState()); }
    @Override public void previous(OrderContext ctx) { System.out.println("Already at initial state"); }
    @Override public String getStatus() { return "PENDING"; }
}

public class ProcessingState implements OrderState {
    @Override public void next(OrderContext ctx) { ctx.setState(new ShippedState()); }
    @Override public void previous(OrderContext ctx) { ctx.setState(new PendingState()); }
    @Override public String getStatus() { return "PROCESSING"; }
}

public class ShippedState implements OrderState {
    @Override public void next(OrderContext ctx) { ctx.setState(new DeliveredState()); }
    @Override public void previous(OrderContext ctx) { ctx.setState(new ProcessingState()); }
    @Override public String getStatus() { return "SHIPPED"; }
}

public class DeliveredState implements OrderState {
    @Override public void next(OrderContext ctx) { System.out.println("Order already delivered"); }
    @Override public void previous(OrderContext ctx) { System.out.println("Cannot go back from delivered"); }
    @Override public String getStatus() { return "DELIVERED"; }
}

// Su dung
OrderContext order = new OrderContext();
System.out.println(order.getStatus());  // PENDING
order.next();
System.out.println(order.getStatus());  // PROCESSING
order.next();
System.out.println(order.getStatus());  // SHIPPED
\`\`\`

> ⚠️ Lưu ý: Hay chon pattern PHU HOP voi van de, khong ep pattern vao code. "If all you have is a hammer, everything looks like a nail." Overuse patterns lam code phuc tap hon can thiet.
    `
  },
  {
    id: 8,
    title: "Collection Framework Overview",
    desc: "Collection hierarchy, Iterable, Iterator, Comparable vs Comparator, Collections utility",
    content: `
## Java Collection Framework

Java Collection Framework la tap hop cac **interfaces** va **implementations** de luu tru va thao tac nhom objects.

\`\`\`mermaid
graph TD
    IT[Iterable] --> COL[Collection]
    COL --> LIST[List]
    COL --> SET[Set]
    COL --> QUEUE[Queue]
    QUEUE --> DEQUE[Deque]
    SET --> SS[SortedSet]
    SS --> NS[NavigableSet]

    LIST -.-> AL[ArrayList]
    LIST -.-> LL[LinkedList]
    LIST -.-> VEC[Vector]
    SET -.-> HS[HashSet]
    SET -.-> LHS[LinkedHashSet]
    NS -.-> TS[TreeSet]
    QUEUE -.-> PQ[PriorityQueue]
    DEQUE -.-> AD[ArrayDeque]
    LL -.-> DEQUE

    MAP[Map] --> SM[SortedMap]
    SM --> NM[NavigableMap]
    MAP -.-> HM[HashMap]
    MAP -.-> LHM[LinkedHashMap]
    NM -.-> TM[TreeMap]
    MAP -.-> HT[Hashtable]

    style IT fill:#8b5cf6,color:#fff
    style COL fill:#3b82f6,color:#fff
    style LIST fill:#22c55e,color:#fff
    style SET fill:#f59e0b,color:#fff
    style QUEUE fill:#ef4444,color:#fff
    style MAP fill:#ec4899,color:#fff
\`\`\`

> ⚠️ Lưu ý: **Map** KHONG extend Collection interface. No la mot hierarchy rieng. Nhung no van thuoc Collection Framework.

## Core Interfaces

| Interface | Mo ta | Ordered | Duplicates | Null |
|-----------|-------|:-------:|:----------:|:----:|
| **List** | Danh sach co thu tu, co index | Co | Co | Co |
| **Set** | Tap hop khong trung lap | Tuy impl | Khong | Tuy impl |
| **Queue** | Hang doi FIFO | Co (FIFO) | Co | Tuy impl |
| **Deque** | Double-ended queue | Co | Co | Tuy impl |
| **Map** | Cap key-value | Tuy impl | Key: Khong, Value: Co | Tuy impl |

## Iterable & Iterator Pattern

\`\`\`java
// Iterable - interface ma Collection extend
public interface Iterable<T> {
    Iterator<T> iterator();

    // Default methods (Java 8+)
    default void forEach(Consumer<? super T> action) {
        for (T t : this) {
            action.accept(t);
        }
    }

    default Spliterator<T> spliterator() {
        return Spliterators.spliteratorUnknownSize(iterator(), 0);
    }
}

// Iterator - duyet qua elements
public interface Iterator<T> {
    boolean hasNext();
    T next();
    default void remove() {
        throw new UnsupportedOperationException("remove");
    }
}
\`\`\`

### Custom Iterable

\`\`\`java
public class NumberRange implements Iterable<Integer> {
    private final int start;
    private final int end;

    public NumberRange(int start, int end) {
        this.start = start;
        this.end = end;
    }

    @Override
    public Iterator<Integer> iterator() {
        return new Iterator<>() {
            private int current = start;

            @Override
            public boolean hasNext() { return current <= end; }

            @Override
            public Integer next() {
                if (!hasNext()) throw new NoSuchElementException();
                return current++;
            }
        };
    }
}

// Su dung voi for-each
NumberRange range = new NumberRange(1, 5);
for (int n : range) {
    System.out.println(n);  // 1, 2, 3, 4, 5
}
\`\`\`

### for-each Loop Internals

\`\`\`java
// Viet the nay
for (String item : list) {
    System.out.println(item);
}

// Compiler chuyen thanh
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String item = it.next();
    System.out.println(item);
}

// Voi array, compiler chuyen thanh
for (int i = 0; i < array.length; i++) {
    String item = array[i];
    System.out.println(item);
}
\`\`\`

## Comparable vs Comparator

### Comparable - Tu nhien ordering (Natural Order)

\`\`\`java
public class Student implements Comparable<Student> {
    private String name;
    private double gpa;
    private int age;

    // Natural ordering: theo GPA giam dan
    @Override
    public int compareTo(Student other) {
        return Double.compare(other.gpa, this.gpa);  // Giam dan
    }
}

// Su dung
List<Student> students = new ArrayList<>(List.of(
    new Student("Alice", 3.8, 20),
    new Student("Bob", 3.5, 22),
    new Student("Charlie", 3.9, 21)
));

Collections.sort(students);  // Dung natural order (Comparable)
// Charlie(3.9), Alice(3.8), Bob(3.5)
\`\`\`

### Comparator - Custom ordering

\`\`\`java
// Cach 1: Anonymous class
Comparator<Student> byName = new Comparator<>() {
    @Override
    public int compare(Student a, Student b) {
        return a.getName().compareTo(b.getName());
    }
};

// Cach 2: Lambda
Comparator<Student> byAge = (a, b) -> Integer.compare(a.getAge(), b.getAge());

// Cach 3: Method reference + comparing (RECOMMENDED)
Comparator<Student> byGpa = Comparator.comparing(Student::getGpa);
Comparator<Student> byNameThenAge = Comparator
    .comparing(Student::getName)
    .thenComparing(Student::getAge);

// Cach 4: Reverse order
Comparator<Student> byGpaDesc = Comparator.comparing(Student::getGpa).reversed();

// Cach 5: Null-safe
Comparator<Student> byNameNullSafe = Comparator
    .comparing(Student::getName, Comparator.nullsLast(Comparator.naturalOrder()));

// Su dung
students.sort(byNameThenAge);
// Hoac
Collections.sort(students, byGpaDesc);
\`\`\`

### Khi nao dung Comparable vs Comparator?

| | Comparable | Comparator |
|---|---|---|
| **Interface** | \`java.lang.Comparable\` | \`java.util.Comparator\` |
| **Method** | \`compareTo(T o)\` | \`compare(T o1, T o2)\` |
| **So luong** | 1 cach sap xep duy nhat | Nhieu cach sap xep |
| **Sua class** | Can modify class | Khong can modify class |
| **Use case** | Natural ordering mac dinh | Custom/alternative ordering |
| **Vi du** | String alphabet, Number ordering | Sort by khac nhau tuy context |

## Collections Utility Class

\`\`\`java
import java.util.Collections;

List<Integer> numbers = new ArrayList<>(List.of(3, 1, 4, 1, 5, 9, 2, 6));

// Sort
Collections.sort(numbers);                    // [1, 1, 2, 3, 4, 5, 6, 9]
Collections.sort(numbers, Comparator.reverseOrder()); // [9, 6, 5, 4, 3, 2, 1, 1]

// Search (LIST PHAI DUOC SORT TRUOC!)
Collections.sort(numbers);
int idx = Collections.binarySearch(numbers, 5);  // Tim vi tri cua 5

// Min/Max
int min = Collections.min(numbers);
int max = Collections.max(numbers);

// Frequency
int count = Collections.frequency(numbers, 1);  // 2 (so 1 xuat hien 2 lan)

// Shuffle (xao tron ngau nhien)
Collections.shuffle(numbers);

// Reverse
Collections.reverse(numbers);

// Swap
Collections.swap(numbers, 0, numbers.size() - 1);

// Fill
Collections.fill(numbers, 0);  // Tat ca thanh 0

// Unmodifiable wrappers (IMMUTABLE VIEW)
List<String> immutable = Collections.unmodifiableList(mutableList);
Map<String, Integer> immutableMap = Collections.unmodifiableMap(mutableMap);
Set<String> immutableSet = Collections.unmodifiableSet(mutableSet);

// Synchronized wrappers (THREAD-SAFE)
List<String> syncList = Collections.synchronizedList(new ArrayList<>());
Map<String, Integer> syncMap = Collections.synchronizedMap(new HashMap<>());

// Singleton collections
List<String> single = Collections.singletonList("only");
Map<String, Integer> singleMap = Collections.singletonMap("key", 1);
Set<String> emptySet = Collections.emptySet();

// nCopies
List<String> repeated = Collections.nCopies(5, "hello");  // ["hello" x 5]
\`\`\`

## Java 9+ Factory Methods (Immutable Collections)

\`\`\`java
// Java 9+ - Tao immutable collections nhanh gon
List<String> list = List.of("a", "b", "c");
Set<String> set = Set.of("x", "y", "z");
Map<String, Integer> map = Map.of("one", 1, "two", 2, "three", 3);

// Map.ofEntries cho nhieu entries hon 10
Map<String, Integer> bigMap = Map.ofEntries(
    Map.entry("one", 1),
    Map.entry("two", 2),
    Map.entry("three", 3)
);

// Copyable
List<String> copy = List.copyOf(mutableList);  // Immutable copy
\`\`\`

> ⚠️ Lưu ý: \`List.of()\`, \`Set.of()\`, \`Map.of()\` tao **immutable** collections. Goi \`add()\`, \`remove()\`, \`put()\` se throw \`UnsupportedOperationException\`. Khong cho phep \`null\` elements.

## Tong ket chon Collection nao?

\`\`\`text
Can luu theo thu tu va co index?
  → Co: List (ArrayList cho random access, LinkedList cho insert/delete nhieu)

Can dam bao khong trung lap?
  → Co: Set (HashSet nhanh nhat, TreeSet neu can sorted, LinkedHashSet giu thu tu insert)

Can key-value?
  → Co: Map (HashMap nhanh nhat, TreeMap neu can sorted keys, LinkedHashMap giu thu tu)

Can FIFO queue?
  → Co: Queue (ArrayDeque cho general purpose, PriorityQueue neu can priority)

Can thread-safe?
  → Co: ConcurrentHashMap, CopyOnWriteArrayList, BlockingQueue (Bai 14)
\`\`\`
    `
  },
  {
    id: 9,
    title: "List Implementations Deep Dive",
    desc: "ArrayList, LinkedList, Vector, CopyOnWriteArrayList - internals va performance",
    content: `
## ArrayList Internals

ArrayList su dung **dynamic array** (mang dong) ben trong. Khi mang day, no tu dong **grow**.

\`\`\`mermaid
graph LR
    subgraph "ArrayList (size=5, capacity=8)"
        A0["[0] 'A'"]
        A1["[1] 'B'"]
        A2["[2] 'C'"]
        A3["[3] 'D'"]
        A4["[4] 'E'"]
        A5["[5] null"]
        A6["[6] null"]
        A7["[7] null"]
    end
    style A5 fill:#666,color:#999
    style A6 fill:#666,color:#999
    style A7 fill:#666,color:#999
\`\`\`

### Grow Strategy (1.5x)

\`\`\`java
// Ben trong ArrayList (simplified)
public class ArrayList<E> {
    private Object[] elementData;   // Mang ben trong
    private int size;               // So element thuc te

    // Default initial capacity
    private static final int DEFAULT_CAPACITY = 10;

    public ArrayList() {
        this.elementData = new Object[DEFAULT_CAPACITY];
    }

    public ArrayList(int initialCapacity) {
        this.elementData = new Object[initialCapacity];
    }

    public boolean add(E element) {
        ensureCapacity(size + 1);
        elementData[size++] = element;
        return true;
    }

    private void ensureCapacity(int minCapacity) {
        if (minCapacity > elementData.length) {
            grow(minCapacity);
        }
    }

    private void grow(int minCapacity) {
        int oldCapacity = elementData.length;
        // Grow 1.5x (50% increase)
        int newCapacity = oldCapacity + (oldCapacity >> 1);
        if (newCapacity < minCapacity) {
            newCapacity = minCapacity;
        }
        // Copy toan bo sang mang moi - O(n)
        elementData = Arrays.copyOf(elementData, newCapacity);
    }

    // Random access - O(1)
    public E get(int index) {
        rangeCheck(index);
        return (E) elementData[index];
    }

    // Remove - O(n) vi phai shift elements
    public E remove(int index) {
        E oldValue = get(index);
        int numMoved = size - index - 1;
        if (numMoved > 0) {
            System.arraycopy(elementData, index + 1, elementData, index, numMoved);
        }
        elementData[--size] = null;  // Help GC
        return oldValue;
    }
}
\`\`\`

### Grow Process Visualization

\`\`\`text
Initial:  [A][B][C][D][E][F][G][H][I][J]  capacity=10, size=10
                                              ↓ add("K") triggers grow
Step 1:   Allocate new array capacity = 10 + 10/2 = 15
Step 2:   System.arraycopy() - copy 10 elements
Step 3:   [A][B][C][D][E][F][G][H][I][J][K][ ][ ][ ][ ]  capacity=15, size=11
\`\`\`

## LinkedList Internals

LinkedList su dung **doubly-linked nodes**. Moi node chua du lieu va 2 con tro (prev, next).

\`\`\`mermaid
graph LR
    HEAD[head] --> N1
    N1["Node A<br/>prev: null<br/>next: →"] --> N2["Node B<br/>prev: ←<br/>next: →"]
    N2 --> N3["Node C<br/>prev: ←<br/>next: →"]
    N3 --> N4["Node D<br/>prev: ←<br/>next: null"]
    N4 --> TAIL[tail]
    N2 --> N1
    N3 --> N2
    N4 --> N3
\`\`\`

\`\`\`java
// Ben trong LinkedList (simplified)
public class LinkedList<E> {
    private static class Node<E> {
        E item;
        Node<E> next;
        Node<E> prev;

        Node(Node<E> prev, E element, Node<E> next) {
            this.item = element;
            this.next = next;
            this.prev = prev;
        }
    }

    private Node<E> first;  // head
    private Node<E> last;   // tail
    private int size;

    // Add to end - O(1)
    public boolean add(E element) {
        Node<E> l = last;
        Node<E> newNode = new Node<>(l, element, null);
        last = newNode;
        if (l == null) {
            first = newNode;
        } else {
            l.next = newNode;
        }
        size++;
        return true;
    }

    // Get by index - O(n) phai duyet tu dau hoac cuoi
    public E get(int index) {
        // Optimization: duyet tu dau goi nhat
        if (index < (size >> 1)) {
            Node<E> x = first;
            for (int i = 0; i < index; i++) x = x.next;
            return x.item;
        } else {
            Node<E> x = last;
            for (int i = size - 1; i > index; i--) x = x.prev;
            return x.item;
        }
    }

    // Remove node - O(1) neu da co reference toi node
    private E unlink(Node<E> x) {
        E element = x.item;
        Node<E> next = x.next;
        Node<E> prev = x.prev;

        if (prev == null) { first = next; }
        else { prev.next = next; x.prev = null; }

        if (next == null) { last = prev; }
        else { next.prev = prev; x.next = null; }

        x.item = null;
        size--;
        return element;
    }
}
\`\`\`

## Performance Comparison

| Operation | ArrayList | LinkedList | Ghi chu |
|-----------|:---------:|:----------:|---------|
| **get(index)** | O(1) | O(n) | ArrayList thang tuyet doi |
| **add(E) (cuoi)** | O(1)* | O(1) | *Amortized, co the O(n) khi grow |
| **add(0, E) (dau)** | O(n) | O(1) | LinkedList thang |
| **add(mid, E)** | O(n) | O(n) | Ca hai deu O(n), nhung ArrayList nhanh hon do cache |
| **remove(index)** | O(n) | O(n) | ArrayList shift, LinkedList duyet |
| **remove(Object)** | O(n) | O(n) | Ca hai phai search |
| **contains** | O(n) | O(n) | Linear search |
| **Iterator.next()** | O(1) | O(1) | Ca hai nhu nhau |
| **Memory per element** | ~4 bytes (reference) | ~48 bytes (Node object) | LinkedList ton gap 12x memory! |

### Benchmark vi du

\`\`\`java
// Benchmark add to beginning
List<Integer> arrayList = new ArrayList<>();
List<Integer> linkedList = new LinkedList<>();

long start = System.nanoTime();
for (int i = 0; i < 100_000; i++) {
    arrayList.add(0, i);  // O(n) moi lan - shift tat ca
}
long arrayTime = System.nanoTime() - start;  // ~3000ms

start = System.nanoTime();
for (int i = 0; i < 100_000; i++) {
    linkedList.add(0, i);  // O(1)
}
long linkedTime = System.nanoTime() - start;  // ~15ms

// Benchmark random access
start = System.nanoTime();
for (int i = 0; i < 100_000; i++) {
    arrayList.get(i);  // O(1)
}
long arrayAccessTime = System.nanoTime() - start;  // ~1ms

start = System.nanoTime();
for (int i = 0; i < 100_000; i++) {
    linkedList.get(i);  // O(n) - THAM HOA!
}
long linkedAccessTime = System.nanoTime() - start;  // ~5000ms
\`\`\`

## Vector vs ArrayList vs CopyOnWriteArrayList

| | ArrayList | Vector | CopyOnWriteArrayList |
|---|---|---|---|
| **Thread-safe** | Khong | Co (synchronized) | Co (copy-on-write) |
| **Performance** | Nhanh nhat | Cham (lock moi method) | Read nhanh, Write cham |
| **Growth** | 50% (1.5x) | 100% (2x) | Copy toan bo moi write |
| **Iterator** | Fail-fast | Fail-fast | Snapshot (never fail) |
| **Use case** | Single thread | Legacy (KHONG dung) | Read-heavy concurrent |

\`\`\`java
// CopyOnWriteArrayList - moi write tao copy MOI cua array
CopyOnWriteArrayList<String> cowList = new CopyOnWriteArrayList<>();
cowList.add("A");  // Copy array, add "A"
cowList.add("B");  // Copy array again, add "B"

// Iterator dung SNAPSHOT - an toan voi concurrent modification
for (String s : cowList) {
    cowList.add("C");  // KHONG throw ConcurrentModificationException
    // Nhung iterator VAN chi thay A, B (snapshot cu)
}
\`\`\`

## Best Practices

\`\`\`java
// 1. LUON dat initial capacity neu biet truoc size
List<User> users = new ArrayList<>(1000);  // Tranh grow nhieu lan

// 2. Dung ArrayList cho 99% truong hop
// Chi dung LinkedList khi:
// - Add/remove O DAU danh sach rat nhieu
// - Dung nhu Queue/Deque (nhung ArrayDeque tot hon)

// 3. Dung interface type, khong dung implementation type
List<String> list = new ArrayList<>();      // GOOD
ArrayList<String> list = new ArrayList<>();  // BAD

// 4. Dung List.of() cho small immutable lists
List<String> statuses = List.of("ACTIVE", "INACTIVE", "PENDING");

// 5. Tranh LinkedList.get(i) trong loop - O(n^2)!
// BAD
for (int i = 0; i < linkedList.size(); i++) {
    linkedList.get(i);  // O(n) moi lan → tong O(n^2)
}

// GOOD - dung Iterator hoac for-each
for (String item : linkedList) {
    // O(1) moi lan → tong O(n)
}
\`\`\`

> ⚠️ Lưu ý: Trong thuc te, **ArrayList la lua chon mac dinh** cho List. LinkedList RAT HIEM khi tot hon ArrayList do CPU cache locality. Modern CPUs uu tien du lieu lien tuc trong memory (ArrayList) hon du lieu phan tan (LinkedList nodes).
    `
  },
  {
    id: 10,
    title: "Set & Map Implementations",
    desc: "HashSet, HashMap internals, TreeMap, LinkedHashMap, WeakHashMap, EnumMap",
    content: `
## HashSet Internals

HashSet duoc **backed boi HashMap**. Moi element cua HashSet la KEY trong HashMap, value la mot dummy object.

\`\`\`java
// Ben trong HashSet (simplified)
public class HashSet<E> {
    private transient HashMap<E, Object> map;
    private static final Object PRESENT = new Object();  // Dummy value

    public HashSet() {
        map = new HashMap<>();
    }

    public boolean add(E e) {
        return map.put(e, PRESENT) == null;
    }

    public boolean contains(Object o) {
        return map.containsKey(o);
    }

    public boolean remove(Object o) {
        return map.remove(o) == PRESENT;
    }

    public int size() {
        return map.size();
    }
}
\`\`\`

## HashMap Internals (QUAN TRONG!)

HashMap la data structure duoc dung NHIEU NHAT trong Java. Hieu internals cua no la THIET YEU.

### Structure: Array of Buckets

\`\`\`mermaid
graph TD
    subgraph "HashMap (capacity=16, size=5, loadFactor=0.75)"
        B0["Bucket[0]: null"]
        B1["Bucket[1]: Entry(key=1,val=A) → null"]
        B2["Bucket[2]: null"]
        B3["Bucket[3]: Entry(key=19,val=B) → Entry(key=3,val=C) → null"]
        B4["Bucket[4]: null"]
        B5["Bucket[5]: Entry(key=5,val=D) → null"]
        B6["Bucket[6]: null"]
        B7["Bucket[7]: null"]
        BN["..."]
        B15["Bucket[15]: Entry(key=31,val=E) → null"]
    end
\`\`\`

### Hash Function va Index Calculation

\`\`\`java
// Ben trong HashMap
static final int hash(Object key) {
    int h;
    // XOR high bits voi low bits de giam collision
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}

// Bucket index = hash & (capacity - 1)
// Vi capacity LUON la power of 2, day tuong duong voi hash % capacity nhung nhanh hon
int index = hash(key) & (table.length - 1);
\`\`\`

### Put Operation

\`\`\`java
public V put(K key, V value) {
    int hash = hash(key);
    int index = hash & (table.length - 1);

    // 1. Bucket trong → tao node moi
    if (table[index] == null) {
        table[index] = new Node<>(hash, key, value, null);
    }
    // 2. Key da ton tai → update value
    else if (table[index].key.equals(key)) {
        V oldValue = table[index].value;
        table[index].value = value;
        return oldValue;
    }
    // 3. Collision → them vao linked list (hoac tree)
    else {
        Node<K,V> current = table[index];
        while (current.next != null) {
            if (current.next.key.equals(key)) {
                // Key da ton tai trong chain
                V oldValue = current.next.value;
                current.next.value = value;
                return oldValue;
            }
            current = current.next;
        }
        current.next = new Node<>(hash, key, value, null);
    }

    size++;

    // 4. Check load factor → resize neu can
    if (size > table.length * loadFactor) {
        resize();  // Double capacity
    }
    return null;
}
\`\`\`

### Load Factor va Resize

\`\`\`text
Load Factor = size / capacity

Default: loadFactor = 0.75, initialCapacity = 16
Threshold = 16 * 0.75 = 12

Khi size > 12 → resize:
1. Tao mang MOI gap doi: capacity = 32
2. Re-hash TAT CA entries (vi index thay doi khi capacity doi)
3. Di chuyen entries sang mang moi
4. New threshold = 32 * 0.75 = 24

Cost: O(n) - EXPENSIVE! Hay dat initialCapacity dung neu biet truoc size.
\`\`\`

### Treeification (Java 8+)

\`\`\`text
Khi mot bucket co >= 8 nodes (TREEIFY_THRESHOLD):
  Linked List → Red-Black Tree
  O(n) lookup → O(log n) lookup

Khi bucket co <= 6 nodes (UNTREEIFY_THRESHOLD):
  Red-Black Tree → Linked List

Dieu kien: capacity phai >= 64 (MIN_TREEIFY_CAPACITY)
Neu capacity < 64, se resize thay vi treeify.
\`\`\`

\`\`\`mermaid
graph TD
    subgraph "Bucket voi 8+ collisions"
        direction TB
        LL["Linked List O(n)"] -->|"TREEIFY_THRESHOLD=8"| RBT["Red-Black Tree O(log n)"]
        RBT -->|"UNTREEIFY_THRESHOLD=6"| LL
    end
\`\`\`

### equals() va hashCode() Contract

\`\`\`java
public class Employee {
    private String id;
    private String name;
    private String department;

    // PHAI override CA HAI equals() va hashCode()

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Employee employee = (Employee) o;
        return Objects.equals(id, employee.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
\`\`\`

**Contract:**

| Rule | Giai thich |
|------|-----------|
| \`a.equals(b) == true\` → \`a.hashCode() == b.hashCode()\` | Equals objects PHAI co cung hashCode |
| \`a.hashCode() == b.hashCode()\` ↛ \`a.equals(b)\` | Cung hashCode KHONG nhat thiet equals (collision) |
| \`a.equals(b) == false\` → hashCode co the giong hoac khac | Khong bat buoc |
| Consistent | Nhieu lan goi, ket qua phai giong nhau |

> ⚠️ Lưu ý: Neu override \`equals()\` ma KHONG override \`hashCode()\`, HashMap/HashSet se KHONG hoat dong dung! Hai object \`equals()\` nhung khac \`hashCode()\` se nam o 2 bucket khac nhau.

## LinkedHashMap

HashMap + **Doubly-linked list** giu thu tu insert.

\`\`\`java
// Giu thu tu insertion
Map<String, Integer> linkedMap = new LinkedHashMap<>();
linkedMap.put("banana", 2);
linkedMap.put("apple", 5);
linkedMap.put("cherry", 1);

linkedMap.forEach((k, v) -> System.out.println(k));
// banana, apple, cherry (thu tu insert)

// LRU Cache voi access-order LinkedHashMap
Map<String, String> lruCache = new LinkedHashMap<>(16, 0.75f, true) {
    // accessOrder = true: moi khi get(), element duoc move to end
    @Override
    protected boolean removeEldestEntry(Map.Entry<String, String> eldest) {
        return size() > 100;  // Giu toi da 100 entries
    }
};

lruCache.put("a", "1");
lruCache.put("b", "2");
lruCache.put("c", "3");
lruCache.get("a");  // "a" duoc move to end
// Thu tu bay gio: b, c, a
\`\`\`

## TreeMap

TreeMap su dung **Red-Black Tree** (cay do den tu can bang). Keys duoc **sorted**.

\`\`\`java
// Natural ordering
TreeMap<String, Integer> treeMap = new TreeMap<>();
treeMap.put("banana", 2);
treeMap.put("apple", 5);
treeMap.put("cherry", 1);

treeMap.forEach((k, v) -> System.out.println(k + ": " + v));
// apple: 5, banana: 2, cherry: 1 (sorted by key)

// Navigation methods
treeMap.firstKey();           // "apple"
treeMap.lastKey();            // "cherry"
treeMap.lowerKey("banana");   // "apple" (strictly less than)
treeMap.higherKey("banana");  // "cherry" (strictly greater than)
treeMap.floorKey("banana");   // "banana" (less than or equal)
treeMap.ceilingKey("b");      // "banana" (greater than or equal)

// Sub maps (VIEWS - thay doi sub map anh huong treeMap)
SortedMap<String, Integer> subMap = treeMap.subMap("apple", "cherry");  // [apple, cherry)
NavigableMap<String, Integer> headMap = treeMap.headMap("cherry", true); // [.., cherry]
\`\`\`

## Special Map Implementations

### WeakHashMap

\`\`\`java
// Keys la WEAK references - GC co the thu gom key bat ky luc nao
Map<Object, String> weakMap = new WeakHashMap<>();

Object key1 = new Object();
weakMap.put(key1, "value1");
System.out.println(weakMap.size());  // 1

key1 = null;  // Khong con strong reference toi key
System.gc();   // GC co the thu gom key

// weakMap.size() co the la 0 sau GC!
// Use case: cache ma khong muon prevent GC
\`\`\`

### EnumMap

\`\`\`java
enum DayOfWeek { MON, TUE, WED, THU, FRI, SAT, SUN }

// EnumMap - cuc ky nhanh vi dung array noi bo, index = enum ordinal
EnumMap<DayOfWeek, String> schedule = new EnumMap<>(DayOfWeek.class);
schedule.put(DayOfWeek.MON, "Meeting");
schedule.put(DayOfWeek.WED, "Workshop");
schedule.put(DayOfWeek.FRI, "Demo");

// Performance: O(1) cho moi operation, no hash calculation needed
\`\`\`

### IdentityHashMap

\`\`\`java
// Dung == thay vi equals() de so sanh keys
IdentityHashMap<String, Integer> identityMap = new IdentityHashMap<>();

String s1 = new String("hello");
String s2 = new String("hello");

identityMap.put(s1, 1);
identityMap.put(s2, 2);

System.out.println(identityMap.size());  // 2! (vi s1 != s2 theo ==)
// HashMap binh thuong se la 1 (vi s1.equals(s2))
\`\`\`

## Tong ket Map Implementations

| Implementation | Ordering | Get/Put | Null keys | Thread-safe | Use case |
|---------------|----------|:-------:|:---------:|:-----------:|----------|
| **HashMap** | Khong | O(1) | 1 null key | Khong | General purpose |
| **LinkedHashMap** | Insert/Access order | O(1) | 1 null key | Khong | LRU cache, ordered iteration |
| **TreeMap** | Sorted (natural/comparator) | O(log n) | Khong | Khong | Sorted keys, range queries |
| **EnumMap** | Enum declaration order | O(1) | Khong | Khong | Enum keys |
| **WeakHashMap** | Khong | O(1) | 1 null key | Khong | Cache khong can prevent GC |
| **ConcurrentHashMap** | Khong | O(1) | Khong | Co | Concurrent access (Bai 14) |
| **Hashtable** | Khong | O(1) | Khong | Co (slow) | Legacy - KHONG dung |

> ⚠️ Lưu ý: Khi dung object lam HashMap key, **PHAI override ca equals() va hashCode()**. Va key NEN la immutable. Neu key thay doi hashCode sau khi put vao map, se KHONG BAO GIO tim lai duoc entry do!
    `
  },
  {
    id: 11,
    title: "Queue & Deque Implementations",
    desc: "PriorityQueue, ArrayDeque, BlockingQueue, Producer-Consumer pattern",
    content: `
## Queue Interface

Queue = hang doi **FIFO** (First-In, First-Out).

\`\`\`java
public interface Queue<E> extends Collection<E> {
    // Throw exception neu that bai
    boolean add(E e);        // Them vao cuoi
    E remove();              // Lay va xoa dau
    E element();             // Xem dau (khong xoa)

    // Return null/false neu that bai
    boolean offer(E e);      // Them vao cuoi
    E poll();                // Lay va xoa dau
    E peek();                // Xem dau (khong xoa)
}
\`\`\`

| Operation | Throw Exception | Return null/false |
|-----------|:--------------:|:-----------------:|
| **Insert** | \`add(e)\` | \`offer(e)\` |
| **Remove** | \`remove()\` | \`poll()\` |
| **Examine** | \`element()\` | \`peek()\` |

## PriorityQueue

PriorityQueue su dung **binary min-heap** ben trong. Element nho nhat (theo natural order hoac Comparator) LUON o dau.

\`\`\`mermaid
graph TD
    subgraph "Min-Heap (PriorityQueue)"
        N1[1] --> N3[3]
        N1 --> N2[2]
        N3 --> N7[7]
        N3 --> N5[5]
        N2 --> N4[4]
        N2 --> N6[6]
    end
\`\`\`

\`\`\`java
// Min-heap (default)
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
minHeap.offer(5);
minHeap.offer(1);
minHeap.offer(3);
minHeap.offer(2);

minHeap.poll();  // 1 (nho nhat)
minHeap.poll();  // 2
minHeap.poll();  // 3

// Max-heap
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
maxHeap.offer(5);
maxHeap.offer(1);
maxHeap.offer(3);

maxHeap.poll();  // 5 (lon nhat)

// Custom priority
PriorityQueue<Task> taskQueue = new PriorityQueue<>(
    Comparator.comparing(Task::getPriority)      // Theo priority
              .thenComparing(Task::getCreatedAt)  // Roi theo thoi gian
);

taskQueue.offer(new Task("Low task", 3, LocalDateTime.now()));
taskQueue.offer(new Task("High task", 1, LocalDateTime.now()));
taskQueue.offer(new Task("Medium task", 2, LocalDateTime.now()));

taskQueue.poll();  // "High task" (priority=1)
\`\`\`

### PriorityQueue Internals

\`\`\`text
Ben trong: Object[] queue (array-based binary heap)

Parent index: i
Left child:  2*i + 1
Right child: 2*i + 2
Parent of i: (i - 1) / 2

offer(e): O(log n) - add to end, then sift-up (bubble up)
poll():   O(log n) - remove root, move last to root, sift-down
peek():   O(1) - just return queue[0]
remove(Object): O(n) - linear search + O(log n) sift
contains(Object): O(n) - linear search
\`\`\`

> ⚠️ Lưu ý: PriorityQueue **KHONG dam bao sorted order** khi iterate. Chi dam bao \`peek()/poll()\` tra ve element nho nhat. Neu can sorted iteration, dung \`TreeSet\` hoac sort truoc.

## Deque Interface

Deque = **Double-Ended Queue** - them/xoa ca hai dau.

\`\`\`java
public interface Deque<E> extends Queue<E> {
    // First element (head)
    void addFirst(E e);
    boolean offerFirst(E e);
    E removeFirst();
    E pollFirst();
    E getFirst();
    E peekFirst();

    // Last element (tail)
    void addLast(E e);
    boolean offerLast(E e);
    E removeLast();
    E pollLast();
    E getLast();
    E peekLast();

    // Stack operations
    void push(E e);   // = addFirst(e)
    E pop();           // = removeFirst()
}
\`\`\`

## ArrayDeque vs LinkedList as Deque

\`\`\`java
// ArrayDeque - circular array ben trong
Deque<String> arrayDeque = new ArrayDeque<>();

// Dung nhu STACK (LIFO)
arrayDeque.push("A");     // A
arrayDeque.push("B");     // B, A
arrayDeque.push("C");     // C, B, A
arrayDeque.pop();         // C (lay tu dau)
arrayDeque.pop();         // B

// Dung nhu QUEUE (FIFO)
arrayDeque.offer("X");    // them vao cuoi
arrayDeque.offer("Y");
arrayDeque.poll();         // X (lay tu dau)
\`\`\`

### Performance Comparison

| Operation | ArrayDeque | LinkedList |
|-----------|:----------:|:----------:|
| **addFirst/Last** | O(1)* | O(1) |
| **removeFirst/Last** | O(1) | O(1) |
| **peekFirst/Last** | O(1) | O(1) |
| **Memory per element** | ~8 bytes | ~48 bytes |
| **Cache locality** | Tot (contiguous array) | Kem (scattered nodes) |
| **Get by index** | Khong ho tro | O(n) |
| **Grow** | Double capacity, copy | No grow needed |

> ⚠️ Lưu ý: **ArrayDeque nhanh hon LinkedList** cho ca Stack va Queue operations do cache locality. Java docs: "This class is likely to be faster than Stack when used as a stack, and faster than LinkedList when used as a queue."

## BlockingQueue

BlockingQueue = Queue co kha nang **BLOCK** (cho doi) khi queue trong hoac day.

\`\`\`java
public interface BlockingQueue<E> extends Queue<E> {
    void put(E e) throws InterruptedException;     // Block neu day
    E take() throws InterruptedException;           // Block neu trong

    boolean offer(E e, long timeout, TimeUnit unit); // Block voi timeout
    E poll(long timeout, TimeUnit unit);             // Block voi timeout
}
\`\`\`

### ArrayBlockingQueue

\`\`\`java
// Bounded blocking queue - co gioi han capacity
BlockingQueue<Task> queue = new ArrayBlockingQueue<>(100);

// Producer thread
Thread producer = new Thread(() -> {
    try {
        while (true) {
            Task task = generateTask();
            queue.put(task);  // BLOCK neu queue day (100 items)
            System.out.println("Produced: " + task);
        }
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
});

// Consumer thread
Thread consumer = new Thread(() -> {
    try {
        while (true) {
            Task task = queue.take();  // BLOCK neu queue trong
            processTask(task);
            System.out.println("Consumed: " + task);
        }
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
});
\`\`\`

### Producer-Consumer Pattern

\`\`\`java
public class ProducerConsumerDemo {
    private static final int BUFFER_SIZE = 10;
    private static final BlockingQueue<String> buffer = new ArrayBlockingQueue<>(BUFFER_SIZE);

    static class Producer implements Runnable {
        private final String name;

        Producer(String name) { this.name = name; }

        @Override
        public void run() {
            try {
                int count = 0;
                while (!Thread.currentThread().isInterrupted()) {
                    String item = name + "-item-" + count++;
                    buffer.put(item);  // Block khi buffer day
                    System.out.println(name + " produced: " + item
                        + " (buffer size: " + buffer.size() + ")");
                    Thread.sleep(100);  // Simulate production time
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    static class Consumer implements Runnable {
        private final String name;

        Consumer(String name) { this.name = name; }

        @Override
        public void run() {
            try {
                while (!Thread.currentThread().isInterrupted()) {
                    String item = buffer.take();  // Block khi buffer rong
                    System.out.println(name + " consumed: " + item);
                    Thread.sleep(200);  // Simulate processing time
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    public static void main(String[] args) {
        // 2 producers, 3 consumers
        new Thread(new Producer("P1")).start();
        new Thread(new Producer("P2")).start();
        new Thread(new Consumer("C1")).start();
        new Thread(new Consumer("C2")).start();
        new Thread(new Consumer("C3")).start();
    }
}
\`\`\`

### LinkedBlockingQueue

\`\`\`java
// Co the bounded hoac unbounded
BlockingQueue<String> bounded = new LinkedBlockingQueue<>(1000);    // Bounded
BlockingQueue<String> unbounded = new LinkedBlockingQueue<>();      // Unbounded (Integer.MAX_VALUE)

// Dung 2 locks rieng cho put va take → throughput cao hon ArrayBlockingQueue
// ArrayBlockingQueue: 1 lock cho ca put va take
// LinkedBlockingQueue: putLock + takeLock
\`\`\`

### Special BlockingQueues

\`\`\`java
// DelayQueue - elements chi available sau khi delay het
BlockingQueue<DelayedTask> delayQueue = new DelayQueue<>();

class DelayedTask implements Delayed {
    private final String name;
    private final long executeAt;

    DelayedTask(String name, long delayMs) {
        this.name = name;
        this.executeAt = System.currentTimeMillis() + delayMs;
    }

    @Override
    public long getDelay(TimeUnit unit) {
        return unit.convert(executeAt - System.currentTimeMillis(), TimeUnit.MILLISECONDS);
    }

    @Override
    public int compareTo(Delayed o) {
        return Long.compare(this.getDelay(TimeUnit.MILLISECONDS),
                           o.getDelay(TimeUnit.MILLISECONDS));
    }
}

// SynchronousQueue - capacity = 0, handoff truc tiep
BlockingQueue<String> syncQueue = new SynchronousQueue<>();
// put() BLOCK cho den khi co thread goi take()
// Dung trong ThreadPoolExecutor (cached thread pool)
\`\`\`

## Performance Summary

| Implementation | Bounded | Ordering | put/take | Internal |
|---------------|:-------:|----------|:--------:|----------|
| **ArrayBlockingQueue** | Co | FIFO | 1 lock | Circular array |
| **LinkedBlockingQueue** | Optional | FIFO | 2 locks | Linked nodes |
| **PriorityBlockingQueue** | Khong | Priority | 1 lock | Binary heap |
| **DelayQueue** | Khong | Delay time | 1 lock | PriorityQueue |
| **SynchronousQueue** | 0 | Direct handoff | CAS | No storage |
| **LinkedTransferQueue** | Khong | FIFO | CAS | Linked nodes |

> ⚠️ Lưu ý: Chon **ArrayBlockingQueue** khi can bounded queue don gian. Chon **LinkedBlockingQueue** khi can throughput cao hon (2 locks). Chon **PriorityBlockingQueue** khi can priority ordering. **KHONG BAO GIO** dung unbounded queue trong production ma khong co backpressure - co the OutOfMemoryError!
    `
  },
  {
    id: 12,
    title: "Generics Deep Dive",
    desc: "Type parameters, bounded types, PECS, type erasure, wildcards",
    content: `
## Generics la gi?

Generics cho phep viet code **type-safe** ma khong mat tinh tong quat.

\`\`\`java
// Khong co Generics - UNSAFE
List list = new ArrayList();
list.add("hello");
list.add(42);           // Khong co compile error!
String s = (String) list.get(1);  // ClassCastException tai RUNTIME!

// Voi Generics - SAFE
List<String> list = new ArrayList<>();
list.add("hello");
// list.add(42);        // COMPILE ERROR! Type safety
String s = list.get(0);  // Khong can cast
\`\`\`

## Type Parameters

\`\`\`java
// Generic class
public class Pair<F, S> {
    private final F first;
    private final S second;

    public Pair(F first, S second) {
        this.first = first;
        this.second = second;
    }

    public F getFirst() { return first; }
    public S getSecond() { return second; }
}

Pair<String, Integer> pair = new Pair<>("age", 25);
String key = pair.getFirst();     // Khong can cast
Integer value = pair.getSecond(); // Type-safe

// Generic method
public class Utils {
    // <T> truoc return type = khai bao type parameter
    public static <T> T getFirstOrDefault(List<T> list, T defaultValue) {
        return list.isEmpty() ? defaultValue : list.get(0);
    }

    // Generic method voi nhieu type parameters
    public static <K, V> Map<K, V> zipToMap(List<K> keys, List<V> values) {
        Map<K, V> map = new HashMap<>();
        for (int i = 0; i < Math.min(keys.size(), values.size()); i++) {
            map.put(keys.get(i), values.get(i));
        }
        return map;
    }
}

// Type inference - compiler tu suy ra type
String first = Utils.getFirstOrDefault(List.of("a", "b"), "default");
Map<String, Integer> map = Utils.zipToMap(List.of("a", "b"), List.of(1, 2));
\`\`\`

### Naming Conventions

| Letter | Y nghia | Vi du |
|--------|---------|-------|
| **T** | Type | \`List<T>\`, \`Comparable<T>\` |
| **E** | Element | \`Collection<E>\`, \`Iterator<E>\` |
| **K** | Key | \`Map<K, V>\` |
| **V** | Value | \`Map<K, V>\` |
| **R** | Return | \`Function<T, R>\` |
| **S, U** | 2nd, 3rd type | \`BiFunction<T, U, R>\` |

## Bounded Type Parameters

\`\`\`java
// Upper bound: T PHAI la Number hoac subclass cua Number
public static <T extends Number> double sum(List<T> list) {
    return list.stream().mapToDouble(Number::doubleValue).sum();
}

sum(List.of(1, 2, 3));          // OK: Integer extends Number
sum(List.of(1.5, 2.5));         // OK: Double extends Number
// sum(List.of("a", "b"));      // COMPILE ERROR: String khong extends Number

// Multiple bounds: T phai implement nhieu interfaces
public static <T extends Comparable<T> & Serializable> T findMax(List<T> list) {
    return list.stream().max(Comparator.naturalOrder()).orElseThrow();
}

// Bounds voi class va interfaces (class PHAI dau tien)
public static <T extends Animal & Serializable & Comparable<T>> void process(T animal) {
    // T phai: extend Animal, implement Serializable va Comparable
}
\`\`\`

## Wildcard Types

### Unbounded Wildcard: \`?\`

\`\`\`java
// ? = bat ky type nao
public static void printList(List<?> list) {
    for (Object item : list) {
        System.out.println(item);
    }
}

printList(List.of(1, 2, 3));          // OK
printList(List.of("a", "b", "c"));    // OK
printList(List.of(new Dog()));         // OK

// NHUNG: khong the add vao List<?>
List<?> unknown = new ArrayList<String>();
// unknown.add("hello");  // COMPILE ERROR - khong biet type chinh xac
unknown.add(null);         // Chi null la OK
\`\`\`

### Upper Bounded: \`? extends T\`

\`\`\`java
// ? extends Number = Number hoac bat ky subclass nao
public static double sumAll(List<? extends Number> numbers) {
    double sum = 0;
    for (Number n : numbers) {
        sum += n.doubleValue();
    }
    return sum;
}

sumAll(List.of(1, 2, 3));        // List<Integer> - OK
sumAll(List.of(1.5, 2.5));       // List<Double> - OK
sumAll(List.of(1L, 2L));         // List<Long> - OK

// CHI DOC - khong the add
List<? extends Number> list = new ArrayList<Integer>();
Number n = list.get(0);    // OK - doc ra Number
// list.add(42);           // COMPILE ERROR - khong biet type chinh xac
\`\`\`

### Lower Bounded: \`? super T\`

\`\`\`java
// ? super Integer = Integer hoac bat ky superclass nao (Number, Object)
public static void addNumbers(List<? super Integer> list) {
    list.add(1);    // OK - co the add Integer
    list.add(2);
    list.add(3);
}

List<Number> numbers = new ArrayList<>();
List<Object> objects = new ArrayList<>();
addNumbers(numbers);   // OK
addNumbers(objects);    // OK

// CHI VIET - doc ra chi biet la Object
List<? super Integer> list = new ArrayList<Number>();
list.add(42);           // OK - viet Integer vao
Object obj = list.get(0);  // Chi biet la Object
// Integer i = list.get(0); // COMPILE ERROR
\`\`\`

## PECS Principle

**P**roducer **E**xtends, **C**onsumer **S**uper

\`\`\`java
// PRODUCER (doc tu collection) → dung extends
public static <T> void copy(
    List<? extends T> source,    // SOURCE produces T → extends
    List<? super T> dest         // DEST consumes T → super
) {
    for (T item : source) {
        dest.add(item);
    }
}

List<Integer> ints = List.of(1, 2, 3);
List<Number> nums = new ArrayList<>();
copy(ints, nums);  // Copy Integer -> Number: OK!

// Real-world: Collections.copy()
public static <T> void copy(List<? super T> dest, List<? extends T> src) {
    // src PRODUCES elements (extends)
    // dest CONSUMES elements (super)
}

// Real-world: stream().collect()
// Collector<? super T, A, R> - Collector CONSUMES T → super
\`\`\`

### PECS Decision Table

| Neu collection... | Dung | Vi du |
|-------------------|------|-------|
| Chi DOC tu no (Producer) | \`? extends T\` | \`List<? extends Number>\` |
| Chi VIET vao no (Consumer) | \`? super T\` | \`List<? super Integer>\` |
| Ca doc va viet | \`T\` (exact type) | \`List<T>\` |
| Khong care type | \`?\` | \`List<?>\` |

## Type Erasure

Java generics duoc implement bang **type erasure**. Tai runtime, generic type bi XOA.

\`\`\`java
// TRUOC erasure (source code)
public class Box<T> {
    private T value;
    public T get() { return value; }
    public void set(T value) { this.value = value; }
}

// SAU erasure (bytecode) - compiler chuyen thanh
public class Box {
    private Object value;           // T → Object
    public Object get() { return value; }
    public void set(Object value) { this.value = value; }
}

// Voi bounded type
public class NumberBox<T extends Number> {
    private T value;
}
// SAU erasure
public class NumberBox {
    private Number value;          // T → Number (upper bound)
}
\`\`\`

### Hau qua cua Type Erasure

\`\`\`java
// 1. KHONG the tao generic array
// T[] array = new T[10];  // COMPILE ERROR

// Workaround
@SuppressWarnings("unchecked")
T[] array = (T[]) new Object[10];

// 2. KHONG the dung instanceof voi generic type
// if (obj instanceof List<String>)  // COMPILE ERROR
if (obj instanceof List<?>) { }    // OK - unbounded wildcard

// 3. KHONG the overload bang generic type
// void process(List<String> list) { }   // Ca hai co CUNG
// void process(List<Integer> list) { }  // erasure: process(List)

// 4. KHONG the tao instance cua type parameter
// T obj = new T();  // COMPILE ERROR
// Workaround: truyen Class<T> hoac Supplier<T>
public static <T> T create(Supplier<T> factory) {
    return factory.get();
}
String s = create(String::new);
\`\`\`

## Generic Methods va Constructors

\`\`\`java
public class CollectionUtils {

    // Generic method
    public static <T extends Comparable<T>> List<T> sort(Collection<T> items) {
        List<T> sorted = new ArrayList<>(items);
        Collections.sort(sorted);
        return sorted;
    }

    // Generic constructor
    public <T> CollectionUtils(List<T> items) {
        // ...
    }

    // Complex generic method
    public static <T, R> List<R> transform(
            Collection<T> input,
            Function<? super T, ? extends R> mapper,
            Predicate<? super T> filter) {
        return input.stream()
            .filter(filter)
            .map(mapper)
            .collect(Collectors.toList());
    }
}

// Su dung
List<String> names = List.of("Alice", "Bob", "Charlie");
List<Integer> lengths = CollectionUtils.transform(
    names,
    String::length,     // Function<String, Integer>
    s -> s.length() > 3 // Predicate<String>
);
// [5, 7] (Alice=5, Charlie=7, Bob bi filter)
\`\`\`

## Reifiable vs Non-Reifiable Types

| | Reifiable | Non-Reifiable |
|---|---|---|
| **Dinh nghia** | Type info co mat tai runtime | Type info bi erasure tai runtime |
| **Vi du** | \`int\`, \`String\`, \`List<?>\` | \`List<String>\`, \`T\`, \`List<? extends Number>\` |
| **Array** | Co the tao: \`String[]\` | Khong the tao: \`List<String>[]\` |
| **instanceof** | Co the check | Khong the check |

> ⚠️ Lưu ý: Type erasure la trade-off cua Java de giu **backward compatibility** voi pre-generics code. Nhieu ngon ngu moi (Kotlin, C#) dung **reified generics** - type info co mat tai runtime. Trong Java, dung \`Class<T>\` token hoac TypeReference (Jackson) de work around.
    `
  },
  {
    id: 13,
    title: "Stream API & Functional Programming",
    desc: "Lambda, method references, Stream pipeline, Collectors, Optional, parallel streams",
    content: `
## Lambda Expressions

Lambda = anonymous function. Viet ngan gon hon anonymous class.

\`\`\`java
// Anonymous class (cu)
Runnable r1 = new Runnable() {
    @Override
    public void run() {
        System.out.println("Hello");
    }
};

// Lambda (moi)
Runnable r2 = () -> System.out.println("Hello");

// Lambda syntax
// (parameters) -> expression
// (parameters) -> { statements; }

// Vi du
Comparator<String> comp = (a, b) -> a.length() - b.length();
Function<String, Integer> len = s -> s.length();
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
Consumer<String> print = s -> System.out.println(s);
Supplier<List<String>> listFactory = () -> new ArrayList<>();
Predicate<String> notEmpty = s -> !s.isEmpty();
\`\`\`

## Method References

Method reference la cach viet ngan gon cua lambda khi lambda CHI GOI 1 method.

| Type | Lambda | Method Reference |
|------|--------|-----------------|
| **Static** | \`x -> Integer.parseInt(x)\` | \`Integer::parseInt\` |
| **Instance (bound)** | \`x -> str.startsWith(x)\` | \`str::startsWith\` |
| **Instance (unbound)** | \`x -> x.toUpperCase()\` | \`String::toUpperCase\` |
| **Constructor** | \`() -> new ArrayList<>()\` | \`ArrayList::new\` |

\`\`\`java
List<String> words = List.of("hello", "world", "java");

// Static method reference
words.stream().map(Integer::parseInt);  // X - String khong parse duoc
words.stream().map(String::valueOf);    // OK

// Instance method reference (unbound - tren tung element)
words.stream().map(String::toUpperCase);  // ["HELLO", "WORLD", "JAVA"]

// Instance method reference (bound - tren 1 object cu the)
String prefix = "he";
words.stream().filter(prefix::startsWith);  // Khong dung logic
words.stream().filter(s -> s.startsWith(prefix));  // ["hello"]

// Constructor reference
words.stream().map(StringBuilder::new);  // List<StringBuilder>
\`\`\`

## Stream Pipeline

Stream pipeline gom 3 phan:

\`\`\`mermaid
graph LR
    SRC["Source<br/>Collection, Array, Generator"] --> INT["Intermediate Operations<br/>filter, map, sorted, distinct<br/>(LAZY - khong chay ngay)"]
    INT --> TERM["Terminal Operation<br/>collect, forEach, reduce, count<br/>(TRIGGER pipeline)"]
    style SRC fill:#3b82f6,color:#fff
    style INT fill:#f59e0b,color:#fff
    style TERM fill:#22c55e,color:#fff
\`\`\`

\`\`\`java
List<Employee> employees = getEmployees();

// Stream pipeline
List<String> result = employees.stream()          // 1. Source
    .filter(e -> e.getAge() > 25)                 // 2. Intermediate (lazy)
    .filter(e -> e.getSalary() > 50000)           // 2. Intermediate (lazy)
    .sorted(Comparator.comparing(Employee::getName)) // 2. Intermediate (lazy)
    .map(Employee::getName)                        // 2. Intermediate (lazy)
    .distinct()                                    // 2. Intermediate (lazy)
    .limit(10)                                     // 2. Intermediate (lazy)
    .collect(Collectors.toList());                 // 3. Terminal (TRIGGER!)
\`\`\`

### Core Operations

\`\`\`java
List<String> words = List.of("hello", "world", "java", "stream", "hello", "java");

// filter - loc elements
words.stream()
    .filter(w -> w.length() > 4)
    .forEach(System.out::println);  // "hello", "world", "stream", "hello"

// map - transform moi element
words.stream()
    .map(String::toUpperCase)
    .forEach(System.out::println);  // "HELLO", "WORLD", ...

// flatMap - flatten nested structures
List<List<String>> nested = List.of(
    List.of("a", "b"),
    List.of("c", "d"),
    List.of("e")
);
List<String> flat = nested.stream()
    .flatMap(Collection::stream)   // Stream<List<String>> → Stream<String>
    .collect(Collectors.toList()); // ["a", "b", "c", "d", "e"]

// distinct - loai bo trung lap (dung equals())
words.stream().distinct().forEach(System.out::println);
// "hello", "world", "java", "stream"

// sorted
words.stream()
    .sorted()                                    // Natural order
    .sorted(Comparator.reverseOrder())           // Reverse
    .sorted(Comparator.comparing(String::length)) // By length

// peek - debug (KHONG nen dung cho side effects)
words.stream()
    .peek(w -> System.out.println("Before filter: " + w))
    .filter(w -> w.length() > 4)
    .peek(w -> System.out.println("After filter: " + w))
    .collect(Collectors.toList());

// reduce - gop tat ca thanh 1 gia tri
int totalLength = words.stream()
    .map(String::length)
    .reduce(0, Integer::sum);  // 0 + 5 + 5 + 4 + 6 + 5 + 4 = 29
\`\`\`

## Collectors

\`\`\`java
List<Employee> employees = getEmployees();

// toList, toSet, toCollection
List<String> names = employees.stream()
    .map(Employee::getName)
    .collect(Collectors.toList());

Set<String> departments = employees.stream()
    .map(Employee::getDepartment)
    .collect(Collectors.toSet());

TreeSet<String> sorted = employees.stream()
    .map(Employee::getName)
    .collect(Collectors.toCollection(TreeSet::new));

// toMap
Map<Long, Employee> byId = employees.stream()
    .collect(Collectors.toMap(Employee::getId, Function.identity()));

// toMap voi merge function (xu ly duplicate key)
Map<String, Long> salaryByDept = employees.stream()
    .collect(Collectors.toMap(
        Employee::getDepartment,
        Employee::getSalary,
        Long::sum  // Neu trung key, cong salary
    ));

// groupingBy - nhom theo dieu kien
Map<String, List<Employee>> byDepartment = employees.stream()
    .collect(Collectors.groupingBy(Employee::getDepartment));

// groupingBy voi downstream collector
Map<String, Long> countByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDepartment,
        Collectors.counting()
    ));

Map<String, Double> avgSalaryByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDepartment,
        Collectors.averagingDouble(Employee::getSalary)
    ));

Map<String, Optional<Employee>> highestPaidByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDepartment,
        Collectors.maxBy(Comparator.comparing(Employee::getSalary))
    ));

// partitioningBy - chia 2 nhom (true/false)
Map<Boolean, List<Employee>> partitioned = employees.stream()
    .collect(Collectors.partitioningBy(e -> e.getSalary() > 50000));

List<Employee> highPaid = partitioned.get(true);
List<Employee> lowPaid = partitioned.get(false);

// joining
String nameList = employees.stream()
    .map(Employee::getName)
    .collect(Collectors.joining(", ", "[", "]"));
// "[Alice, Bob, Charlie]"

// summarizing
DoubleSummaryStatistics stats = employees.stream()
    .collect(Collectors.summarizingDouble(Employee::getSalary));
System.out.println("Count: " + stats.getCount());
System.out.println("Sum: " + stats.getSum());
System.out.println("Min: " + stats.getMin());
System.out.println("Max: " + stats.getMax());
System.out.println("Avg: " + stats.getAverage());
\`\`\`

## Parallel Streams

\`\`\`java
// Parallel stream - chia du lieu, xu ly tren nhieu threads
List<Integer> numbers = IntStream.rangeClosed(1, 1_000_000)
    .boxed()
    .collect(Collectors.toList());

// Sequential
long seqSum = numbers.stream()
    .mapToLong(Integer::longValue)
    .sum();

// Parallel
long parSum = numbers.parallelStream()
    .mapToLong(Integer::longValue)
    .sum();

// Hoac chuyen tu sequential sang parallel
long parSum2 = numbers.stream()
    .parallel()
    .mapToLong(Integer::longValue)
    .sum();
\`\`\`

### Khi nao dung Parallel Streams?

\`\`\`text
NEN dung khi:
✓ Du lieu LON (>10,000 elements)
✓ Operations CPU-intensive (tinh toan nang)
✓ Source ho tro split tot (ArrayList, array, IntStream.range)
✓ Operations stateless va independent

KHONG NEN dung khi:
✗ Du lieu NHO (overhead > benefit)
✗ Operations co side effects (shared mutable state)
✗ Source split kem (LinkedList, Stream.iterate)
✗ I/O operations (database, file, network)
✗ Order matters va can giu thu tu
\`\`\`

## Optional

\`\`\`java
// Tao Optional
Optional<String> empty = Optional.empty();
Optional<String> present = Optional.of("hello");       // KHONG cho null
Optional<String> nullable = Optional.ofNullable(null);  // Cho phep null

// Su dung Optional
String result = Optional.ofNullable(getUserName())
    .filter(name -> !name.isBlank())
    .map(String::trim)
    .map(String::toUpperCase)
    .orElse("ANONYMOUS");

// orElseGet - lazy evaluation
String name = Optional.ofNullable(user.getName())
    .orElseGet(() -> fetchDefaultName());  // Chi goi neu empty

// orElseThrow
String email = Optional.ofNullable(user.getEmail())
    .orElseThrow(() -> new IllegalStateException("Email is required"));

// ifPresent
Optional.ofNullable(user.getPhone())
    .ifPresent(phone -> sendSMS(phone, "Hello!"));

// ifPresentOrElse (Java 9+)
Optional.ofNullable(user.getPhone())
    .ifPresentOrElse(
        phone -> sendSMS(phone, "Hello!"),
        () -> System.out.println("No phone number")
    );

// flatMap - khi method tra ve Optional
Optional<String> city = Optional.ofNullable(user)
    .flatMap(User::getAddress)        // Address la Optional
    .flatMap(Address::getCity)        // City la Optional
    .map(String::toUpperCase);

// stream() (Java 9+)
List<String> names = users.stream()
    .map(User::getMiddleName)           // Stream<Optional<String>>
    .flatMap(Optional::stream)          // Stream<String> - chi present values
    .collect(Collectors.toList());
\`\`\`

### Optional Anti-patterns

\`\`\`java
// BAD: Optional lam parameter
public void process(Optional<String> name) { }  // KHONG lam nhu nay

// GOOD: Dung overloading hoac @Nullable
public void process(String name) { }
public void process() { process("default"); }

// BAD: Optional.get() khong check
String value = optional.get();  // NoSuchElementException neu empty!

// GOOD: Dung orElse, orElseGet, orElseThrow
String value = optional.orElse("default");

// BAD: Optional cho fields
class User {
    private Optional<String> name;  // KHONG lam nhu nay
}

// GOOD: Optional chi cho return types
public Optional<User> findById(Long id) { }
\`\`\`

> ⚠️ Lưu ý: Optional duoc thiet ke cho **return types** de bieu dat gia tri co the khong ton tai. KHONG dung Optional cho: fields, method parameters, collections. Dung null checks hoac annotations (@Nullable) cho nhung truong hop do.
    `
  },
  {
    id: 14,
    title: "Concurrent Collections",
    desc: "ConcurrentHashMap, CopyOnWriteArrayList, Atomic classes, CAS algorithm, lock-free",
    content: `
## Tai sao can Concurrent Collections?

Regular collections (HashMap, ArrayList) **KHONG thread-safe**. Truy cap tu nhieu threads gay ra data corruption.

\`\`\`java
// BAD - HashMap trong multi-threaded environment
Map<String, Integer> unsafeMap = new HashMap<>();

// 2 threads cung put → co the mat data, infinite loop, crash
Thread t1 = new Thread(() -> {
    for (int i = 0; i < 10000; i++) unsafeMap.put("key" + i, i);
});
Thread t2 = new Thread(() -> {
    for (int i = 10000; i < 20000; i++) unsafeMap.put("key" + i, i);
});

// Solution 1: Collections.synchronizedMap (CHAM - lock toan bo map)
Map<String, Integer> syncMap = Collections.synchronizedMap(new HashMap<>());

// Solution 2: ConcurrentHashMap (NHANH - fine-grained locking)
Map<String, Integer> concMap = new ConcurrentHashMap<>();
\`\`\`

## ConcurrentHashMap

### Java 8+ Implementation: CAS + synchronized (per-bin)

\`\`\`mermaid
graph TD
    subgraph "ConcurrentHashMap (Java 8+)"
        B0["Bin[0]: CAS for first node"]
        B1["Bin[1]: synchronized(head node)"]
        B2["Bin[2]: null"]
        B3["Bin[3]: TreeBin (>= 8 nodes)"]
        BN["..."]
        B15["Bin[15]: Node → Node → null"]
    end
    T1[Thread 1] -->|"Lock Bin[1]"| B1
    T2[Thread 2] -->|"Lock Bin[3]"| B3
    T3[Thread 3] -->|"CAS Bin[0]"| B0
\`\`\`

\`\`\`java
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();

// Basic operations - thread-safe
map.put("a", 1);
map.get("a");
map.remove("a");

// Atomic compound operations
map.putIfAbsent("key", 1);        // Put chi khi key chua ton tai
map.replace("key", 1, 2);         // Replace chi khi current value = 1
map.computeIfAbsent("key", k -> expensiveCompute(k));
map.computeIfPresent("key", (k, v) -> v + 1);
map.compute("key", (k, v) -> v == null ? 1 : v + 1);
map.merge("key", 1, Integer::sum); // Neu co, cong them; neu chua, put 1

// Atomic counter pattern
ConcurrentHashMap<String, LongAdder> counters = new ConcurrentHashMap<>();
counters.computeIfAbsent("page-views", k -> new LongAdder()).increment();

// Bulk operations (Java 8+)
map.forEach(2, (k, v) -> System.out.println(k + "=" + v)); // parallelism threshold = 2
long sum = map.reduceValues(2, Integer::sum);  // Parallel reduce
String result = map.search(2, (k, v) -> v > 100 ? k : null); // Parallel search
\`\`\`

### ConcurrentHashMap vs synchronized HashMap vs Hashtable

| | ConcurrentHashMap | synchronizedMap | Hashtable |
|---|---|---|---|
| **Lock** | Per-bin (fine-grained) | Toan bo map (coarse) | Toan bo map |
| **null key/value** | Khong | Co | Khong |
| **Iterator** | Weakly consistent | Fail-fast | Fail-fast |
| **Compound ops** | Atomic (compute, merge) | Khong atomic | Khong atomic |
| **Performance** | Tot nhat | Trung binh | Kem nhat |
| **Read** | Lock-free (volatile) | Synchronized | Synchronized |

## CopyOnWriteArrayList

Moi **write** tao **copy MOI** cua array. Read khong can lock.

\`\`\`java
CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();

// Write operations - expensive (copy toan bo array)
list.add("A");                    // Tao array moi [A]
list.add("B");                    // Tao array moi [A, B]
list.set(0, "C");                 // Tao array moi [C, B]

// Read operations - fast, lock-free
String s = list.get(0);           // Doc tu current array, no lock
int size = list.size();

// Iterator la SNAPSHOT - an toan voi concurrent modification
for (String item : list) {
    list.add("new item");         // KHONG throw ConcurrentModificationException
    // Nhung iterator van doc array CU (snapshot luc tao iterator)
}
\`\`\`

\`\`\`text
Use case:
✓ Read-heavy, Write-rarely (event listeners, configuration)
✓ Iterator can an toan voi concurrent modification

KHONG dung khi:
✗ Write nhieu (moi write copy O(n))
✗ List lon (copy expensive)
\`\`\`

## ConcurrentSkipListMap & ConcurrentSkipListSet

Concurrent + Sorted collection. Skip List thay vi Red-Black Tree.

\`\`\`java
// ConcurrentSkipListMap - thread-safe sorted map
ConcurrentSkipListMap<String, Integer> skipMap = new ConcurrentSkipListMap<>();
skipMap.put("banana", 2);
skipMap.put("apple", 5);
skipMap.put("cherry", 1);

// Sorted iteration
skipMap.forEach((k, v) -> System.out.println(k)); // apple, banana, cherry

// Navigation (giong TreeMap)
skipMap.firstKey();              // "apple"
skipMap.lastKey();               // "cherry"
skipMap.headMap("cherry");       // {apple=5, banana=2}
skipMap.tailMap("banana");       // {banana=2, cherry=1}
skipMap.subMap("apple", "cherry"); // {apple=5, banana=2}
\`\`\`

\`\`\`text
Skip List vs Red-Black Tree:
- Skip List: lock-free operations, O(log n) expected
- Red-Black Tree: khong lock-free duoc (rebalancing can lock toan bo)
- Vi vay Java dung Skip List cho concurrent sorted collections
\`\`\`

## Atomic Classes

Atomic classes dung **CAS (Compare-And-Swap)** de thuc hien operations thread-safe ma **KHONG CAN LOCK**.

### Compare-And-Swap (CAS) Algorithm

\`\`\`java
// CAS pseudo-code
boolean compareAndSwap(expectedValue, newValue) {
    if (currentValue == expectedValue) {
        currentValue = newValue;
        return true;   // Thanh cong
    }
    return false;      // That bai - co thread khac da thay doi
}

// CAS loop pattern
do {
    oldValue = get();
    newValue = compute(oldValue);
} while (!compareAndSwap(oldValue, newValue));
// Retry neu that bai (optimistic approach)
\`\`\`

\`\`\`mermaid
graph TD
    START[Read current value] --> CMP{current == expected?}
    CMP -->|Co| SET[Set new value ✓]
    CMP -->|Khong| RETRY[Retry - read again]
    RETRY --> START
    SET --> DONE[Done]
\`\`\`

### AtomicInteger, AtomicLong

\`\`\`java
AtomicInteger counter = new AtomicInteger(0);

// Thread-safe operations (no lock)
counter.incrementAndGet();    // ++counter (atomic)
counter.getAndIncrement();    // counter++ (atomic)
counter.addAndGet(5);         // counter += 5
counter.compareAndSet(6, 10); // if (counter == 6) counter = 10

// Dung cho concurrent counter
AtomicLong requestCount = new AtomicLong(0);
// Nhieu threads goi dong thoi:
requestCount.incrementAndGet();
\`\`\`

### AtomicReference

\`\`\`java
AtomicReference<String> ref = new AtomicReference<>("initial");

// Atomic update
ref.set("new value");
String old = ref.getAndSet("newer value");

// CAS
ref.compareAndSet("newer value", "final value");

// updateAndGet (Java 8+)
ref.updateAndGet(current -> current.toUpperCase());

// Atomic reference cho immutable objects
AtomicReference<ImmutableConfig> config = new AtomicReference<>(defaultConfig);

// Thread-safe config update
config.updateAndGet(current ->
    current.withTimeout(5000)  // Tao config moi, KHONG modify cu
);
\`\`\`

### LongAdder va LongAccumulator (Java 8+)

\`\`\`java
// LongAdder - NHANH HON AtomicLong cho high-contention counters
LongAdder adder = new LongAdder();

// Nhieu threads cong dong thoi - moi thread co cell rieng
adder.increment();  // Thread 1 → cell 1
adder.increment();  // Thread 2 → cell 2
adder.add(5);       // Thread 3 → cell 3

long total = adder.sum();  // Cong tat ca cells
// Nhanh hon AtomicLong vi giam CAS contention

// LongAccumulator - tong quat hon LongAdder
LongAccumulator max = new LongAccumulator(Long::max, Long.MIN_VALUE);
max.accumulate(10);
max.accumulate(5);
max.accumulate(20);
long result = max.get();  // 20
\`\`\`

## Lock-Free Data Structures

\`\`\`java
// Lock-free stack (Treiber Stack)
public class LockFreeStack<E> {
    private final AtomicReference<Node<E>> top = new AtomicReference<>(null);

    private static class Node<E> {
        final E item;
        final Node<E> next;

        Node(E item, Node<E> next) {
            this.item = item;
            this.next = next;
        }
    }

    public void push(E item) {
        Node<E> newHead;
        Node<E> oldHead;
        do {
            oldHead = top.get();
            newHead = new Node<>(item, oldHead);
        } while (!top.compareAndSet(oldHead, newHead));
        // CAS loop - retry neu co thread khac push/pop
    }

    public E pop() {
        Node<E> oldHead;
        Node<E> newHead;
        do {
            oldHead = top.get();
            if (oldHead == null) return null;
            newHead = oldHead.next;
        } while (!top.compareAndSet(oldHead, newHead));
        return oldHead.item;
    }
}
\`\`\`

## Khi nao dung Concurrent Collection nao?

| Collection | Use case | Performance |
|-----------|----------|-------------|
| **ConcurrentHashMap** | General concurrent map | Read: O(1), Write: O(1) |
| **ConcurrentSkipListMap** | Concurrent sorted map | O(log n) |
| **CopyOnWriteArrayList** | Read-heavy list, few writes | Read: O(1), Write: O(n) |
| **CopyOnWriteArraySet** | Read-heavy set, few writes | Read: O(n), Write: O(n) |
| **ConcurrentLinkedQueue** | Lock-free concurrent queue | O(1) |
| **ArrayBlockingQueue** | Bounded blocking queue | O(1) |
| **LinkedBlockingQueue** | Optionally bounded queue | O(1) |
| **PriorityBlockingQueue** | Priority concurrent queue | O(log n) |
| **AtomicInteger/Long** | Concurrent counters | CAS-based |
| **LongAdder** | High-contention counters | Cell-based, faster than Atomic |

> ⚠️ Lưu ý: Concurrent collections **KHONG lam moi thu thread-safe tu dong**. Compound operations (check-then-act) van can synchronization hoac atomic methods. Vi du: \`if (!map.containsKey(k)) map.put(k, v)\` KHONG atomic - dung \`map.putIfAbsent(k, v)\` thay the.
    `
  },
  {
    id: 15,
    title: "Performance & Best Practices",
    desc: "Collection sizing, iteration performance, memory overhead, common pitfalls, production checklist",
    content: `
## Collection Sizing & Initial Capacity

\`\`\`java
// BAD - de default capacity, grow nhieu lan
List<User> users = new ArrayList<>();  // capacity=10
for (int i = 0; i < 10000; i++) {
    users.add(new User());  // Grow: 10→15→22→33→...→10000
    // Moi lan grow = Arrays.copyOf() = O(n)
    // Tong: ~25 lan grow
}

// GOOD - set initial capacity
List<User> users = new ArrayList<>(10000);  // 0 lan grow!

// HashMap: account for load factor
int expectedSize = 1000;
// Capacity = expectedSize / loadFactor + 1
Map<String, User> map = new HashMap<>(expectedSize * 4 / 3 + 1);

// Hoac dung Guava
Map<String, User> map = Maps.newHashMapWithExpectedSize(1000);
\`\`\`

### Memory overhead per collection

| Collection | Memory per element | Memory per empty |
|-----------|:-----------------:|:----------------:|
| **ArrayList** | ~4 bytes (ref) | ~48 bytes |
| **LinkedList** | ~48 bytes (Node) | ~48 bytes |
| **HashSet** | ~48 bytes (HashMap.Node) | ~136 bytes |
| **HashMap** | ~48 bytes (Node) | ~136 bytes |
| **TreeMap** | ~64 bytes (Entry) | ~48 bytes |
| **ConcurrentHashMap** | ~48 bytes (Node) | ~1700 bytes |
| **EnumMap** | ~4 bytes (ref) | ~48 bytes |

> ⚠️ Lưu ý: LinkedList ton memory **gap 12x** ArrayList cho moi element. Trong 99% truong hop, ArrayList la lua chon tot hon.

## Iteration Performance

\`\`\`java
List<String> list = new ArrayList<>(List.of(/* 1M elements */));

// 1. Traditional for loop - NHANH NHAT cho ArrayList
for (int i = 0; i < list.size(); i++) {
    String s = list.get(i);  // O(1) voi ArrayList
}

// 2. Enhanced for-each - GAN BANG for loop
for (String s : list) {
    // Compiler chuyen thanh Iterator
}

// 3. Iterator - Tuong tu for-each
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String s = it.next();
}

// 4. forEach method - HOI CHAM HON do lambda overhead
list.forEach(s -> { /* ... */ });

// 5. Stream - CHAM NHAT cho simple operations
list.stream().forEach(s -> { /* ... */ });

// 6. Parallel stream - CHI nhanh voi large data + CPU-intensive
list.parallelStream().forEach(s -> { /* ... */ });
\`\`\`

### Benchmark Results (1M String elements)

| Method | Time (ms) | Relative |
|--------|:---------:|:--------:|
| **for (i)** | ~3ms | 1x |
| **for-each** | ~4ms | 1.3x |
| **Iterator** | ~4ms | 1.3x |
| **forEach()** | ~5ms | 1.7x |
| **stream().forEach()** | ~8ms | 2.7x |
| **parallelStream()** | ~15ms (overhead) | 5x (NHO thi cham hon!) |

> ⚠️ Lưu ý: Voi **LinkedList**, KHONG BAO GIO dung for(i) loop - do la O(n^2). Luon dung Iterator hoac for-each.

## Immutable Collections

\`\`\`java
// Java 9+ factory methods (Recommended)
List<String> list = List.of("a", "b", "c");
Set<String> set = Set.of("x", "y", "z");
Map<String, Integer> map = Map.of("one", 1, "two", 2);

// Java 10+ - copy to immutable
List<String> immutableCopy = List.copyOf(mutableList);
Set<String> immutableSet = Set.copyOf(mutableSet);
Map<String, Integer> immutableMap = Map.copyOf(mutableMap);

// Collections.unmodifiableXxx - VIEW (khong copy)
List<String> view = Collections.unmodifiableList(mutableList);
// view.add("x");  // UnsupportedOperationException
// NHUNG: thay doi mutableList VAN anh huong view!

// Stream collector to unmodifiable (Java 10+)
List<String> result = stream
    .collect(Collectors.toUnmodifiableList());

Map<String, Integer> resultMap = stream
    .collect(Collectors.toUnmodifiableMap(k -> k, v -> v));
\`\`\`

### Immutable vs Unmodifiable

| | \`List.of()\` | \`Collections.unmodifiableList()\` |
|---|---|---|
| **Behavior** | True immutable copy | Unmodifiable VIEW |
| **Original changes** | Khong anh huong | CO anh huong |
| **null elements** | Khong cho phep | Cho phep |
| **Serializable** | Co | Co |
| **Memory** | Compact | Wrapper + original |

## Common Pitfalls

### 1. ConcurrentModificationException

\`\`\`java
// BAD - modify collection trong for-each
List<String> list = new ArrayList<>(List.of("a", "b", "c", "d"));
for (String s : list) {
    if (s.equals("b")) {
        list.remove(s);  // ConcurrentModificationException!
    }
}

// GOOD - dung Iterator.remove()
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (it.next().equals("b")) {
        it.remove();  // Safe
    }
}

// GOOD - dung removeIf (Java 8+)
list.removeIf(s -> s.equals("b"));

// GOOD - collect va remove
List<String> toRemove = list.stream()
    .filter(s -> s.equals("b"))
    .collect(Collectors.toList());
list.removeAll(toRemove);
\`\`\`

### 2. equals/hashCode Contract

\`\`\`java
// BAD - override equals nhung KHONG override hashCode
public class Key {
    private String value;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Key)) return false;
        return Objects.equals(value, ((Key) o).value);
    }
    // THIEU hashCode()!
}

Map<Key, String> map = new HashMap<>();
map.put(new Key("a"), "value1");
map.get(new Key("a"));  // null! Vi hashCode khac → khac bucket

// GOOD - LUON override ca hai
@Override
public int hashCode() {
    return Objects.hash(value);
}
\`\`\`

### 3. Mutable keys trong HashMap

\`\`\`java
// BAD - mutable key
List<String> key = new ArrayList<>(List.of("a", "b"));
Map<List<String>, String> map = new HashMap<>();
map.put(key, "value");

key.add("c");  // hashCode THAY DOI!
map.get(key);  // null! Vi hashCode khac → tim o bucket khac

// GOOD - dung immutable keys
Map<List<String>, String> map = new HashMap<>();
map.put(List.of("a", "b"), "value");  // List.of() la immutable
\`\`\`

### 4. Arrays.asList() pitfalls

\`\`\`java
// Arrays.asList() tra ve FIXED-SIZE list
List<String> list = Arrays.asList("a", "b", "c");
// list.add("d");     // UnsupportedOperationException
// list.remove("a");  // UnsupportedOperationException
list.set(0, "x");     // OK - co the modify elements

// GOOD - wrap trong ArrayList neu can mutable
List<String> mutable = new ArrayList<>(Arrays.asList("a", "b", "c"));
mutable.add("d");  // OK

// Hoac dung List.of() (Java 9+) cho immutable
List<String> immutable = List.of("a", "b", "c");
\`\`\`

### 5. Autoboxing Performance

\`\`\`java
// BAD - autoboxing trong loop
List<Integer> list = new ArrayList<>();
for (int i = 0; i < 1_000_000; i++) {
    list.add(i);  // int → Integer autoboxing moi lan
}

long sum = 0;
for (Integer n : list) {
    sum += n;  // Integer → int unboxing moi lan
}

// GOOD - dung primitive arrays hoac specialized collections
int[] array = new int[1_000_000];
long sum = 0;
for (int n : array) {
    sum += n;  // No boxing
}

// Hoac dung IntStream
long sum = IntStream.range(0, 1_000_000).sum();
\`\`\`

## Choosing the Right Collection

\`\`\`mermaid
graph TD
    START[Can luu du lieu gi?]
    START -->|"Key-Value pairs"| MAP_Q[Can sorted keys?]
    START -->|"Single values"| UNI_Q[Cho phep duplicates?]

    MAP_Q -->|Co| TREE_MAP[TreeMap]
    MAP_Q -->|Khong| CONC_Q1[Can thread-safe?]
    CONC_Q1 -->|Co| CHM[ConcurrentHashMap]
    CONC_Q1 -->|Khong| ORDER_Q1[Can giu thu tu insert?]
    ORDER_Q1 -->|Co| LHM[LinkedHashMap]
    ORDER_Q1 -->|Khong| HM[HashMap]

    UNI_Q -->|Khong| SET_Q[Can sorted?]
    SET_Q -->|Co| TS[TreeSet]
    SET_Q -->|Khong| HS[HashSet]

    UNI_Q -->|Co| LIST_Q[Can gi nhieu?]
    LIST_Q -->|"Random access"| AL[ArrayList]
    LIST_Q -->|"Insert/Remove dau"| QUEUE_Q[Can FIFO?]
    QUEUE_Q -->|Co| AD[ArrayDeque]
    QUEUE_Q -->|"Can blocking"| BQ[BlockingQueue]
    QUEUE_Q -->|Khong| AL

    style HM fill:#22c55e,color:#fff
    style AL fill:#3b82f6,color:#fff
    style CHM fill:#f59e0b,color:#fff
    style HS fill:#8b5cf6,color:#fff
\`\`\`

## Production Checklist

\`\`\`text
□ Set initial capacity cho ArrayList va HashMap neu biet truoc size
□ Dung interface type (List, Map, Set) thay vi implementation type
□ Dung immutable collections (List.of, Map.of) khi co the
□ Override equals() VA hashCode() cho objects dung lam Map key hoac trong Set
□ Map keys nen la immutable
□ Dung ConcurrentHashMap thay vi synchronizedMap trong multi-threaded code
□ Tranh LinkedList - dung ArrayList hoac ArrayDeque thay the
□ Tranh iteration voi index tren LinkedList (O(n^2))
□ Dung removeIf() thay vi remove trong loop
□ Dung EnumMap khi key la enum
□ Dung Collectors.toUnmodifiableList() khi collect stream results
□ Khong dung raw types (List thay vi List<String>)
□ Dung diamond operator: new ArrayList<>() thay vi new ArrayList<String>()
□ Benchmark truoc khi dung parallel streams
□ Set -Xmx phu hop neu luu tru nhieu data trong collections
\`\`\`

> ⚠️ Lưu ý: **"Premature optimization is the root of all evil"** - Donald Knuth. Hay viet code DUNG truoc, roi OPTIMIZE khi co evidence (profiling, benchmarks). Chon collection dung theo semantics (List, Set, Map) truoc, roi moi nghi toi performance.
    `
  }
];
