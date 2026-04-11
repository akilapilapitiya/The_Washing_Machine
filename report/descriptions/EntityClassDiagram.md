# Entity Class Diagram

## 1. Purpose
This document captures the entity-class style view of the project and aligns it with the current backend implementation.

It is intended for:
- quick conceptual understanding
- class-style diagram drafting in draw.io
- mapping conceptual classes to actual database entities

## 2. Diagram Style Conventions
Use these conventions for the class-style diagram:
- Class name at top in bold
- Attributes in the middle section
- Operations (methods) in the bottom section only if you are creating a conceptual UML view
- No colors required
- Multiplicity shown on connectors (for example 1, 0..1, 0..*, 1..*)

## 3. Core Conceptual Classes
- Customer
- Employee
- Owner (role-based specialization of Employee)
- Vehicle
- Service
- Booking
- Payment
- Feedback
- Leave
- Schedule

## 4. Mapping to Current Backend Tables

| Conceptual class | Current backend table(s) |
|---|---|
| Customer | customer |
| Employee | employee |
| Owner | role + employee (employee.roleid -> role.roleid where rolename='owner') |
| Vehicle | vehicle |
| Service | service |
| Booking | booking |
| Payment | payment |
| Feedback | feedback |
| Leave | employeeleave |
| Schedule | schedule |

## 5. Relationship Summary for Conceptual Diagram
- Customer 1..* Vehicle
- Vehicle 1..* Booking
- Booking 0..1 Payment
- Booking 0..1 Feedback
- Booking *..* Service via ServicesBooked
- Booking *..* Employee via EmployeeAssigned
- Booking *..* Employee via EmployeePreference
- Employee 0..* Leave
- Schedule links to exactly one of Booking or Leave (XOR)

## 6. Important Alignment Notes
- Do not model an abstract User table in the database ER view.
- Owner is not a separate table; it is a role.
- Feedback is a separate entity, not a booking text field.
- Assigned employees are not a single booking column; they are a junction-table relationship.

## 7. Recommended Use
- Use this document for class-level conceptual communication.
- Use NormalizedDataModel.md for database-accurate ER drawing and constraints.
