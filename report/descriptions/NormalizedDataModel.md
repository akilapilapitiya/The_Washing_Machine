# Normalized Data Model

## 1. Scope and Purpose
This document defines the backend relational data model used by The Washing Machine system. It is written so an ER designer can build a full ER diagram without prior project knowledge.

Coverage includes:
- Entities (tables)
- Attributes with data types
- Primary keys, foreign keys, unique constraints
- Nullability and defaults
- Check constraints and enum-like domains
- Relationship cardinalities and optionality
- Dependency order and implementation notes


## 2. Legend
- PK: Primary Key
- FK: Foreign Key
- NN: NOT NULL
- UQ: UNIQUE
- CHK: CHECK constraint
- DEF: Default value

Cardinality notation used in this document:
- 1 to many: 1:N
- 1 to 1: 1:1
- Optional participation: 0..1 or 0..N

## 3. Entity Definitions

### 3.1 role
Purpose: Employee authorization role lookup.

| Attribute | Type | Rules |
|---|---|---|
| roleid | SERIAL | PK |
| rolename | VARCHAR(50) | NN, UQ, CHK LENGTH(TRIM(rolename)) > 0 |
| role_description | TEXT | nullable |
| is_admin | BOOLEAN | DEF FALSE |
| created_at | TIMESTAMP | DEF NOW() |
| updated_at | TIMESTAMP | DEF NOW() |

Seeded roles:
- owner (is_admin = TRUE)
- cashier
- employee

---

### 3.2 customer
Purpose: Customer identity and profile.

| Attribute | Type | Rules |
|---|---|---|
| cusid | SERIAL | PK |
| title | VARCHAR(10) | CHK IN ('Mr.', 'Mrs.', 'Ms.', 'Ven.', 'Rev.') |
| first_name | VARCHAR(100) | NN, CHK LENGTH(TRIM(first_name)) > 0 |
| last_name | VARCHAR(100) | NN, CHK LENGTH(TRIM(last_name)) > 0 |
| cusemail | VARCHAR(100) | NN, UQ, email regex CHK |
| custel | VARCHAR(10) | NN, CHK regex ^[0-9]{10}$ |
| nic | VARCHAR(20) | UQ, nullable |
| dob | DATE | nullable |
| latitude | NUMERIC(10,8) | nullable |
| longitude | NUMERIC(11,8) | nullable |
| profile_picture_url | TEXT | nullable |
| password_hash | VARCHAR(255) | NN |
| is_active | BOOLEAN | DEF TRUE |
| created_at | TIMESTAMP | DEF NOW() |
| updated_at | TIMESTAMP | DEF NOW() |

Indexes:
- idx_customer_email (cusemail)

---

### 3.3 employee
Purpose: Staff profile and authentication.

| Attribute | Type | Rules |
|---|---|---|
| empid | SERIAL | PK |
| first_name | VARCHAR(100) | NN, CHK LENGTH(TRIM(first_name)) > 0 |
| last_name | VARCHAR(100) | NN, CHK LENGTH(TRIM(last_name)) > 0 |
| name_with_initials | VARCHAR(100) | NN, CHK LENGTH(TRIM(name_with_initials)) > 0 |
| email | VARCHAR(100) | NN, UQ, email regex CHK |
| emptel | VARCHAR(10) | NN, CHK regex ^[0-9]{10}$ |
| emptype | VARCHAR(100) | NN, CHK LENGTH(TRIM(emptype)) > 0 |
| roleid | INT | FK to role.roleid, nullable |
| empnic | VARCHAR(12) | NN, UQ, CHK regex ^[0-9]{9}[Vv]$ or ^[0-9]{12}$ |
| address_number | VARCHAR(20) | nullable |
| address_line1 | VARCHAR(100) | nullable |
| address_line2 | VARCHAR(100) | nullable |
| dob | DATE | nullable |
| speciality | VARCHAR(100) | nullable |
| profile_picture_url | TEXT | nullable |
| password_hash | VARCHAR(255) | NN |
| telegram_chat_id | VARCHAR(50) | UQ, nullable |
| telegram_connected_at | TIMESTAMP | nullable |
| created_at | TIMESTAMP | DEF NOW() |
| updated_at | TIMESTAMP | DEF NOW() |

Indexes:
- idx_employee_email
- idx_employee_nic
- idx_employee_type

Notes:
- Legacy naming migration exists (old empname split into first_name, last_name, name_with_initials).
- Role migration from emptype to roleid exists; emptype still present.

---

### 3.4 employee_dependent
Purpose: Employee dependent and emergency contact information.

| Attribute | Type | Rules |
|---|---|---|
| depid | SERIAL | PK |
| empid | INT | NN, FK to employee.empid, ON DELETE CASCADE |
| name | VARCHAR(100) | NN, CHK LENGTH(TRIM(name)) > 0 |
| relationship | VARCHAR(50) | NN, CHK LENGTH(TRIM(relationship)) > 0 |
| contact_number | VARCHAR(10) | NN, CHK regex ^[0-9]{10}$ |
| is_emergency_contact | BOOLEAN | DEF TRUE |
| created_at | TIMESTAMP | DEF NOW() |
| updated_at | TIMESTAMP | DEF NOW() |

Constraints:
- UNIQUE(empid, name)

Index:
- idx_dependent_employee

---

### 3.5 vehicle_catalog
Purpose: Reference catalog of allowed brand/model combinations.

| Attribute | Type | Rules |
|---|---|---|
| id | SERIAL | PK |
| brand | VARCHAR(100) | NN, CHK LENGTH(TRIM(brand)) > 0 |
| model | VARCHAR(100) | NN, CHK LENGTH(TRIM(model)) > 0 |
| created_at | TIMESTAMP | DEF CURRENT_TIMESTAMP |

Constraints:
- UNIQUE(brand, model)

Index:
- idx_vehicle_catalog_brand

Note:
- This table is not currently linked by FK from vehicle.

---

### 3.6 vehicle
Purpose: Customer-owned vehicles.

| Attribute | Type | Rules |
|---|---|---|
| id | SERIAL | PK |
| vehplate | VARCHAR(20) | NN, CHK LENGTH(TRIM(vehplate)) > 0 |
| vehmileage | INT | NN, DEF 0, CHK vehmileage >= 0 |
| vehbrand | VARCHAR(50) | NN, CHK LENGTH(TRIM(vehbrand)) > 0 |
| vehmodel | VARCHAR(50) | NN, CHK LENGTH(TRIM(vehmodel)) > 0 |
| fuel_type | VARCHAR(20) | CHK IN ('Petrol','Diesel','Hybrid','Electric','Other'), nullable |
| vehcolor | VARCHAR(30) | nullable |
| next_service_mileage | INT | DEF 0 |
| next_service_date | DATE | nullable |
| manufacture_year | INT | nullable |
| transmission | VARCHAR(20) | CHK IN ('Manual','Automatic'), nullable |
| engine_capacity | INT | nullable |
| cusid | INT | NN, FK to customer.cusid, ON DELETE CASCADE, ON UPDATE CASCADE |
| created_at | TIMESTAMP | DEF NOW() |
| updated_at | TIMESTAMP | DEF NOW() |

Constraints:
- UNIQUE(cusid, vehplate)

Indexes:
- idx_vehicle_customer
- idx_vehicle_plate

---

### 3.7 service
Purpose: Service catalog.

| Attribute | Type | Rules |
|---|---|---|
| serviceid | SERIAL | PK |
| servicename | VARCHAR(100) | NN |
| servicetime | TIME | NN |
| serviceprice | DECIMAL(10,2) | NN, CHK serviceprice >= 0 |
| servicedetails | VARCHAR(255) | nullable |
| short_description | TEXT | nullable |
| long_description | TEXT | nullable |
| image_url | TEXT | nullable |
| gallery_urls | JSONB | DEF '[]' |
| benefits | JSONB | DEF '[]' |
| category | VARCHAR(50) | nullable |
| is_featured | BOOLEAN | DEF FALSE |
| is_variable_price | BOOLEAN | DEF FALSE |
| has_offer | BOOLEAN | DEF FALSE |
| offer_price | DECIMAL(10,2) | nullable |
| offer_description | TEXT | nullable |
| offer_start_date | TIMESTAMP | nullable |
| offer_end_date | TIMESTAMP | nullable |
| servicetype | VARCHAR(20) | DEF 'package' |
| cooldown_duration | INTEGER | DEF 15 |
| created_at | TIMESTAMP | DEF NOW() |
| updated_at | TIMESTAMP | DEF NOW() |

---

### 3.8 booking
Purpose: Core transaction for scheduled customer service.

| Attribute | Type | Rules |
|---|---|---|
| bookingid | SERIAL | PK |
| bookingstatus | VARCHAR(15) | NN, CHK IN ('pending','inProgress','completed','paid','cancelled','rejected') |
| bookingdate | DATE | NN |
| bookingstarttime | TIME | NN |
| bookingendtime | TIME | NN, CHK bookingendtime > bookingstarttime |
| bookinglocationlatitude | DECIMAL(9,6) | NN, CHK BETWEEN -90 AND 90 |
| bookinglocationlongitude | DECIMAL(9,6) | NN, CHK BETWEEN -180 AND 180 |
| vehid | INT | NN, FK to vehicle.id, ON DELETE CASCADE, ON UPDATE CASCADE |
| totalprice | DECIMAL(10,2) | NN, DEF 0, CHK totalprice >= 0 |
| travel_distance | DECIMAL(10,2) | DEF 0 |
| travel_duration | INT | DEF 0 |
| travel_cost | DECIMAL(10,2) | DEF 0 |
| is_maintenance | BOOLEAN | DEF FALSE |
| created_at | TIMESTAMP | DEF NOW() |
| updated_at | TIMESTAMP | DEF NOW() |

Indexes:
- idx_booking_vehicle
- idx_booking_date
- idx_booking_status

---

### 3.9 servicesbooked
Purpose: Booking to service junction with booking-time snapshots.

| Attribute | Type | Rules |
|---|---|---|
| bookingid | INT | NN, PK part, FK to booking.bookingid, ON DELETE CASCADE, ON UPDATE CASCADE |
| serviceid | INT | NN, PK part, FK to service.serviceid, ON DELETE CASCADE, ON UPDATE CASCADE |
| service_name | VARCHAR(255) | nullable, snapshot value |
| service_price_at_booking | DECIMAL(10,2) | nullable, snapshot value |
| created_at | TIMESTAMP | DEF NOW() |

Primary key:
- (bookingid, serviceid)

Index:
- idx_servicesbooked_service

---

### 3.10 employeeassigned
Purpose: Assignment of employees to bookings.

| Attribute | Type | Rules |
|---|---|---|
| bookingid | INT | NN, PK part, FK to booking.bookingid, ON DELETE CASCADE, ON UPDATE CASCADE |
| empid | INT | NN, PK part, FK to employee.empid, ON DELETE CASCADE, ON UPDATE CASCADE |
| created_at | TIMESTAMP | DEF NOW() |

Primary key:
- (bookingid, empid)

Index:
- idx_empassigned_employee

---

### 3.11 employeepreference
Purpose: Preferred employees per booking.

| Attribute | Type | Rules |
|---|---|---|
| bookingid | INT | NN, PK part, FK to booking.bookingid, ON DELETE CASCADE, ON UPDATE CASCADE |
| empid | INT | NN, PK part, FK to employee.empid, ON DELETE CASCADE, ON UPDATE CASCADE |
| created_at | TIMESTAMP | DEF NOW() |

Primary key:
- (bookingid, empid)

Index:
- idx_emppreference_employee

---

### 3.12 employeeleave
Purpose: Employee leave records.

| Attribute | Type | Rules |
|---|---|---|
| leaveid | SERIAL | PK |
| leavestartdate | DATE | NN |
| leaveenddate | DATE | NN, CHK leaveenddate >= leavestartdate |
| leavereason | VARCHAR(100) | NN, CHK LENGTH(TRIM(leavereason)) > 0 |
| empid | INT | NN, FK to employee.empid, ON DELETE CASCADE, ON UPDATE CASCADE |
| leavestarttime | TIME | nullable |
| leaveendtime | TIME | nullable |
| created_at | TIMESTAMP | DEF NOW() |
| updated_at | TIMESTAMP | DEF NOW() |

Indexes:
- idx_leave_employee
- idx_leave_dates (leavestartdate, leaveenddate)

---

### 3.13 schedule
Purpose: Time-slot mapping for either booking or leave.

| Attribute | Type | Rules |
|---|---|---|
| scheduleid | VARCHAR(7) | PK, CHK regex ^[A-Z0-9-]{7}$ |
| schedulestartdate | DATE | NN |
| scheduleenddate | DATE | NN, CHK scheduleenddate >= schedulestartdate |
| schedulestarttime | TIME | NN |
| scheduleendtime | TIME | NN, CHK scheduleendtime > schedulestarttime |
| bookingid | INT | nullable, FK to booking.bookingid, ON DELETE CASCADE, ON UPDATE CASCADE |
| leaveid | INT | nullable, FK to employeeleave.leaveid, ON DELETE CASCADE, ON UPDATE CASCADE |
| created_at | TIMESTAMP | DEF NOW() |
| updated_at | TIMESTAMP | DEF NOW() |

Critical check constraint:
- Exactly one reference must exist: bookingid XOR leaveid

Indexes:
- idx_schedule_booking
- idx_schedule_leave
- idx_schedule_dates (schedulestartdate, scheduleenddate)

---

### 3.14 payment
Purpose: Payment transactions tied to bookings.

| Attribute | Type | Rules |
|---|---|---|
| paymentid | SERIAL | PK |
| paymentdate | DATE | NN, DEF CURRENT_DATE |
| paymenttype | VARCHAR(10) | NN, CHK IN ('cash','card','online') |
| paymentamount | DECIMAL(10,2) | NN, CHK paymentamount > 0 |
| bookingid | INT | NN, UQ, FK to booking.bookingid, ON DELETE CASCADE, ON UPDATE CASCADE |
| created_at | TIMESTAMP | DEF NOW() |
| updated_at | TIMESTAMP | DEF NOW() |

Indexes:
- idx_payment_booking
- idx_payment_date

---

### 3.15 feedback
Purpose: Customer feedback for completed bookings.

| Attribute | Type | Rules |
|---|---|---|
| feedbackid | SERIAL | PK |
| feedbackdescription | VARCHAR(500) | NN, CHK LENGTH(TRIM(feedbackdescription)) > 0 |
| rating | INT | NN, CHK BETWEEN 1 AND 5 |
| bookingid | INT | NN, UQ, FK to booking.bookingid, ON DELETE CASCADE, ON UPDATE CASCADE |
| cusid | INT | NN, FK to customer.cusid, ON DELETE CASCADE, ON UPDATE CASCADE |
| created_at | TIMESTAMP | DEF NOW() |
| updated_at | TIMESTAMP | DEF NOW() |

Indexes:
- idx_feedback_booking
- idx_feedback_customer
- idx_feedback_rating

---

### 3.16 booking_extras
Purpose: Extra line items and pricing adjustments per booking.

| Attribute | Type | Rules |
|---|---|---|
| id | SERIAL | PK |
| booking_id | INT | NN, FK to booking.bookingid, ON DELETE CASCADE |
| item_name | VARCHAR(255) | NN |
| description | TEXT | nullable |
| price | DECIMAL(10,2) | nullable |
| added_by | INT | nullable, FK to employee.empid, ON DELETE SET NULL |
| priced_by | INT | nullable, FK to employee.empid, ON DELETE SET NULL |
| priced_at | TIMESTAMP | nullable |
| created_at | TIMESTAMP | DEF NOW() |
| updated_at | TIMESTAMP | DEF NOW() |

Index:
- idx_extras_booking

---

### 3.17 notification
Purpose: Notifications for customers and employees.

| Attribute | Type | Rules |
|---|---|---|
| id | SERIAL | PK |
| recipient_id | INT | NN |
| recipient_role | VARCHAR(20) | NN, application-level domain comment: customer or employee (owner also possible) |
| title | VARCHAR(255) | NN |
| message | TEXT | NN |
| type | VARCHAR(50) | DEF 'info' |
| is_read | BOOLEAN | DEF FALSE |
| booking_id | INT | nullable, no FK constraint declared |
| created_at | TIMESTAMP | DEF NOW() |
| updated_at | TIMESTAMP | DEF NOW() |

Indexes:
- idx_notification_recipient (recipient_id, recipient_role)
- idx_notification_unread partial index (recipient_id) WHERE is_read = FALSE

Important note:
- booking_id is not enforced as FK in current schema.

---

### 3.18 incident
Purpose: Incident tracking across staff, customer, and booking contexts.

| Attribute | Type | Rules |
|---|---|---|
| id | SERIAL | PK |
| employee_id | INTEGER | nullable, FK to employee.empid, ON DELETE SET NULL, ON UPDATE CASCADE |
| customer_id | INTEGER | nullable, FK to customer.cusid, ON DELETE SET NULL, ON UPDATE CASCADE |
| booking_id | INTEGER | nullable, FK to booking.bookingid, ON DELETE SET NULL, ON UPDATE CASCADE |
| description | TEXT | NN |
| severity | VARCHAR(20) | DEF 'medium', CHK IN ('low','medium','high','critical') |
| status | VARCHAR(20) | DEF 'open', CHK IN ('open','in_progress','resolved','closed') |
| created_at | TIMESTAMP | DEF CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | DEF CURRENT_TIMESTAMP |

Indexes:
- idx_incident_employee
- idx_incident_customer
- idx_incident_booking
- idx_incident_status

---

### 3.19 password_reset_token
Purpose: Password reset flow support.

| Attribute | Type | Rules |
|---|---|---|
| id | SERIAL | PK |
| email | VARCHAR(100) | NN, CHK LENGTH(TRIM(email)) > 0 |
| user_type | VARCHAR(10) | NN, CHK IN ('customer','employee') |
| token_hash | VARCHAR(255) | NN |
| expires_at | TIMESTAMP | NN |
| is_used | BOOLEAN | DEF FALSE |
| failed_attempts | INTEGER | DEF 0, CHK failed_attempts >= 0 |
| created_at | TIMESTAMP | DEF CURRENT_TIMESTAMP |

Indexes:
- idx_password_reset_email
- idx_password_reset_expires
- idx_password_reset_used

---

### 3.20 sys_settings
Purpose: Key-value storage for system-level configuration.

| Attribute | Type | Rules |
|---|---|---|
| key | VARCHAR(50) | PK |
| value | TEXT | NN |
| description | TEXT | nullable |
| created_at | TIMESTAMP | DEF NOW() |
| updated_at | TIMESTAMP | DEF NOW() |

Seed examples:
- travel_pricing_rules
- default_service_frequency_days
- service_reminder_prior_days

---

### 3.21 system_holidays
Purpose: Public/company/custom holidays that affect scheduling.

| Attribute | Type | Rules |
|---|---|---|
| holidayid | SERIAL | PK |
| holidayname | VARCHAR(100) | NN, CHK LENGTH(TRIM(holidayname)) > 0 |
| holidaydate | DATE | NN |
| starttime | TIME | nullable |
| endtime | TIME | nullable |
| holidaytype | VARCHAR(20) | DEF 'public', CHK IN ('public','company','custom') |
| description | TEXT | nullable |
| is_recurring | BOOLEAN | DEF FALSE |
| created_by | INT | NN, FK to employee.empid, ON DELETE SET NULL, ON UPDATE CASCADE |
| created_at | TIMESTAMP | DEF NOW() |
| updated_at | TIMESTAMP | DEF NOW() |

Indexes:
- idx_holiday_date
- idx_holiday_recurring

Important modeling caveat:
- created_by is NN while FK delete action is SET NULL. If creator employee is deleted, SET NULL conflicts with NN. This should be resolved in future migration.

---

### 3.22 advertisement
Purpose: Promotional content.

| Attribute | Type | Rules |
|---|---|---|
| id | SERIAL | PK |
| title | VARCHAR(255) | NN |
| image_url | TEXT | nullable |
| client_name | VARCHAR(255) | nullable |
| client_contact | VARCHAR(50) | nullable |
| expiry_date | TIMESTAMPTZ | nullable |
| status | VARCHAR(50) | DEF 'active' |
| is_active | BOOLEAN | DEF TRUE |
| created_at | TIMESTAMP | DEF CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | DEF CURRENT_TIMESTAMP |

## 4. Relationship and Cardinality Specification

### 4.1 Direct FK Relationships

| Parent | Child | FK | Cardinality | Child optionality | Delete action |
|---|---|---|---|---|---|
| role | employee | employee.roleid -> role.roleid | role 1 : N employee | employee roleid optional | default (NO ACTION) |
| customer | vehicle | vehicle.cusid -> customer.cusid | customer 1 : N vehicle | mandatory in child | CASCADE |
| employee | employee_dependent | employee_dependent.empid -> employee.empid | employee 1 : N dependent | mandatory in child | CASCADE |
| vehicle | booking | booking.vehid -> vehicle.id | vehicle 1 : N booking | mandatory in child | CASCADE |
| employee | employeeleave | employeeleave.empid -> employee.empid | employee 1 : N leave | mandatory in child | CASCADE |
| booking | payment | payment.bookingid -> booking.bookingid | booking 1 : 0..1 payment | mandatory in child, unique FK | CASCADE |
| booking | feedback | feedback.bookingid -> booking.bookingid | booking 1 : 0..1 feedback | mandatory in child, unique FK | CASCADE |
| customer | feedback | feedback.cusid -> customer.cusid | customer 1 : N feedback | mandatory in child | CASCADE |
| booking | booking_extras | booking_extras.booking_id -> booking.bookingid | booking 1 : N extras | mandatory in child | CASCADE |
| employee | booking_extras | booking_extras.added_by -> employee.empid | employee 1 : N extras-added | optional in child | SET NULL |
| employee | booking_extras | booking_extras.priced_by -> employee.empid | employee 1 : N extras-priced | optional in child | SET NULL |
| employee | system_holidays | system_holidays.created_by -> employee.empid | employee 1 : N holidays | mandatory in child | SET NULL (conflicts with NN) |
| employee | incident | incident.employee_id -> employee.empid | employee 1 : N incidents | optional in child | SET NULL |
| customer | incident | incident.customer_id -> customer.cusid | customer 1 : N incidents | optional in child | SET NULL |
| booking | incident | incident.booking_id -> booking.bookingid | booking 1 : N incidents | optional in child | SET NULL |
| booking | schedule | schedule.bookingid -> booking.bookingid | booking 1 : 0..N schedule entries | optional (XOR) | CASCADE |
| employeeleave | schedule | schedule.leaveid -> employeeleave.leaveid | leave 1 : 0..N schedule entries | optional (XOR) | CASCADE |

### 4.2 Many-to-Many via Junction Tables

| Left entity | Junction | Right entity | Effective cardinality |
|---|---|---|---|
| booking | servicesbooked | service | booking M:N service |
| booking | employeeassigned | employee | booking M:N employee |
| booking | employeepreference | employee | booking M:N employee |

Junction PKs are composite:
- servicesbooked (bookingid, serviceid)
- employeeassigned (bookingid, empid)
- employeepreference (bookingid, empid)

### 4.3 Relationship Notes for Diagram Accuracy
- notification.booking_id is only a soft reference in schema (no FK constraint).
- vehicle_catalog has no FK relationship from vehicle despite conceptual dependency on vehbrand and vehmodel values.
- schedule must connect to exactly one of booking or employeeleave.

## 5. Business Rules Encoded in Schema

1. Booking time integrity
- bookingendtime > bookingstarttime

2. Leave and schedule chronological integrity
- leaveenddate >= leavestartdate
- scheduleenddate >= schedulestartdate
- scheduleendtime > schedulestarttime

3. Location domain integrity
- latitude and longitude ranges enforced in booking

4. Value domains
- booking status, payment type, holiday type, severity, incident status, fuel type, transmission, user type all constrained

5. One booking one payment, one booking one feedback
- payment.bookingid UNIQUE
- feedback.bookingid UNIQUE

6. Non-negative counters and monetary basics
- serviceprice >= 0
- totalprice >= 0
- paymentamount > 0
- failed_attempts >= 0

7. Schedule exclusivity rule
- schedule row belongs to booking or leave, never both

## 6. Normalization and Intentional Denormalization

Mostly normalized design (3NF for core transactional entities), with intentional denormalization in specific places:

1. servicesbooked snapshot fields
- service_name
- service_price_at_booking
Reason: historical price/name accuracy even if service master changes.

2. booking travel fields
- travel_distance, travel_duration, travel_cost
Reason: persist computed operational values for reporting and audit.

3. service flexible presentation fields
- gallery_urls (JSONB), benefits (JSONB), offer fields
Reason: avoid extra tables for low-to-medium complexity catalog content.

4. sys_settings key-value design
Reason: flexible system configuration without frequent schema changes.

## 7. Dependency and Creation Order

Observed initialization sequence:
1. customer
2. role
3. employee
4. employee_dependent
5. vehicle_catalog
6. vehicle
7. service
8. booking
9. employeeleave
10. schedule
11. payment
12. feedback
13. servicesbooked
14. employeepreference
15. employeeassigned
16. notification
17. incident
18. password_reset_token
19. sys_settings
20. booking_extras
21. system_holidays
22. advertisement

Dependency logic:
- Base entities first (customer, role, service, settings, advertisement)
- Then dependent entities (employee, vehicle, booking)
- Then junction and optional operational entities