# Entity Relationship (ER) Diagram Description

## 1. Overview
The Entity Relationship Diagram (ERD) for "The Washing Machine" project illustrates the logical structure of the system's database. It captures the primary entities, their attributes, and the complex relationships that drive the business logic of the car wash and service management system.

## 2. Entities and Attributes

### 2.1 Core User Entities
- **Customer**
    - `cusId` (Primary Key): Unique identifier for each customer.
    - `cusName`: Full name of the customer.
    - `cusTel`: Contact telephone number.
    - `cusEmail`: Email address (used for login and notifications).
    - `password_hash`: Securely hashed password for authentication.

- **Employee**
    - `empId` (Primary Key): Unique identifier for each staff member.
    - `empName`: Full name of the employee.
    - `empEmail`: Work email address.
    - `password_hash`: Authentication credentials.

- **Role**
    - `roleid` (Primary Key): Unique role identifier.
    - `roleName`: Title of the role (e.g., Cleaner, Manager, Owner).
    - `is_Admin`: Boolean flag indicating administrative privileges.

- **Dependant**
    - `Id` (Primary Key): Unique identifier for the dependant.
    - `name`: Name of the emergency contact or dependant.
    - `tel`: Contact number.

### 2.2 Operational Entities
- **Vehicle**
    - `vehId` (Primary Key): Unique identifier for the vehicle.
    - `vehBrand`: Manufacturer of the vehicle.
    - `vehModel`: Model of the vehicle.
    - `vehPlate`: License plate number.
    - `vehMileage`: Last recorded mileage.

- **Booking**
    - `bookingId` (Primary Key): Unique reference for the service appointment.
    - `bookingDate`: Date the service is scheduled for.
    - `bookingStartTime`: Expected start time.
    - `location`: Service location (On-site or Mobile).
    - `totalPrice`: Total calculated cost for the booking.

- **Service**
    - `serviceId` (Primary Key): Unique identifier for a service type.
    - `serviceName`: Name (e.g., Full Wash, Interior Detail).
    - `serviceDetails`: Description of what the service entails.
    - `serviceTime`: Estimated duration.

- **Service Extras**
    - `id` (Primary Key): Unique identifier for optional add-ons.

- **Payment**
    - `paymentId` (Primary Key): Unique transaction reference.
    - `paymentAmount`: Total amount paid.
    - `paymentType`: Method of payment (Cash, Card, Online).
    - `paymentDate`: Date of the transaction.

### 2.3 Management & Incident Entities
- **Schedule**
    - `schedulerId` (Primary Key): Unique identifier for a time slot allocation.
    - `schedulerStartTime`: Start of the allocated block.
    - `schedulerEndTime`: End of the allocated block.

- **Leave**
    - `leaveId` (Primary Key): Unique identifier for leave requests.
    - `leaveReason`: Reason provided for the absence.
    - `leaveEndDate`: Expected return date.

- **Feedback**
    - `feedbackID` (Primary Key): Unique identifier for customer reviews.
    - `feedBackDescription`: The actual content of the review.

- **Incident**
    - `id` (Primary Key): Unique reference for service incidents.
    - `description`: Details of what occurred.
    - `status`: Current resolution state.

---

## 3. Relationships and Cardinality

| Relationship | Entities Involved | Cardinality | Description |
| :--- | :--- | :--- | :--- |
| **Owns** | Customer : Vehicle | 1 : M | One customer can own multiple registered vehicles. |
| **History** | Vehicle : Booking | 1 : M | Each vehicle can have many service bookings over time. |
| **Contains** | Booking : Service | M : N | A booking can include multiple services, and a service type can appear in many bookings. |
| **Billing** | Booking : Payment | 1 : 1 | Every booking is linked to a single payment record for reconciliation. |
| **Reviews** | Booking : Feedback | 1 : 1 | A customer provides one feedback entry per booking. |
| **Add-ons** | Booking : Service Extras | 1 : M | A booking can have multiple extra service options. |
| **Staff Assignment** | Booking : Employee | M : 1 | Many bookings can be assigned to one employee (for a specific shift). |
| **Preference** | Booking : Employee | M : 1 | Customers can request a specific preferred employee for multiple bookings. |
| **Issues** | Booking : Incident | 1 : M | One booking might result in multiple incident reports if problems arise. |
| **Shift Allocation** | Booking : Schedule | 1 : 1 | Each booking occupies a specific slot in the master schedule. |
| **Absence Management**| Employee : Leave | 1 : M | An employee can request multiple leave periods. |
| **Leave Scheduling** | Leave : Schedule | 1 : 1 | Every approved leave is blocked out in the master schedule. |
| **Authorization** | Employee : Role | M : 1 | Multiple employees can share the same functional role. |
| **Emergency Contact** | Employee : Dependant | 1 : M | An employee can have multiple dependants or emergency contacts. |

---

## 4. Key Design Decisions noted from ERD
1. **Unified Scheduling**: Both Bookings and Employee Leaves are linked to the `Schedule` entity, ensuring that staff availability is automatically accounted for when booking clients.
2. **Preference System**: The diagram explicitly separates the 'assigned' employee from the 'preferred' employee, allowing the business to track customer loyalty vs. operational logistics.
3. **Auditability**: Payments and Incidents are decoupled from the core Booking entity as separate tables, providing a clear audit trail for financial and quality control purposes.
