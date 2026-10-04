# Entity Relationship (ER) Diagram
## BuildCorp – Construction Management System (DBMS Project)
**Department of CSE (AIML), SRM Institute of Science and Technology**

---

### 1. Conceptual & Relational Data Model (Mermaid ERD)

```mermaid
erDiagram
    ROLE ||--o{ USER : "has"
    USER ||--o{ PROJECT : "manages"
    CONTRACTOR ||--o{ PROJECT : "executes"
    USER ||--o{ TASK : "assigned_to"
    PROJECT ||--o{ TASK : "contains"
    PROJECT ||--o{ MILESTONE : "defines"
    PROJECT ||--|| BUDGET : "allocates (1:1)"
    PROJECT ||--o{ EXPENSE : "incurs"
    PROJECT ||--o{ RESOURCE : "employs"
    PROJECT ||--o{ MATERIAL : "consumes"
    MATERIAL ||--o{ LOW_STOCK_ALERT : "generates"
    PROJECT ||--o{ SITE_FORM : "logs"
    FORM_TYPE ||--o{ SITE_FORM : "categorizes"

    ROLE {
        int Role_ID PK
        varchar Role_Name UK
        varchar Description
        timestamp Created_At
    }

    USER {
        int User_ID PK
        varchar Username UK
        varchar Email UK
        varchar Password_Hash
        varchar Full_Name
        int Role_ID FK
        enum Status "Active, Inactive, Suspended"
        timestamp Created_At
    }

    CONTRACTOR {
        int Contractor_ID PK
        varchar Contractor_Name
        varchar Phone
        varchar Email
        varchar Address
        timestamp Created_At
    }

    PROJECT {
        int Project_ID PK
        varchar Project_Name
        text Description
        date Start_Date
        date End_Date
        enum Status "Planned, In-Progress, On-Hold, Completed"
        int Manager_ID FK
        int Contractor_ID FK
        timestamp Created_At
    }

    TASK {
        int Task_ID PK
        int Project_ID FK
        int Assigned_To FK
        varchar Task_Name
        date Start_Date
        date Due_Date
        enum Status "Open, In-Progress, Blocked, Done"
        timestamp Created_At
    }

    MILESTONE {
        int Milestone_ID PK
        int Project_ID FK
        varchar Milestone_Name
        varchar Description
        date Due_Date
        enum Status "Pending, Achieved, Delayed"
        timestamp Created_At
    }

    BUDGET {
        int Budget_ID PK
        int Project_ID FK "UNIQUE (1:1)"
        decimal Total_Budget
        decimal Approved_Budget
        date Created_Date
        varchar Remarks
        timestamp Created_At
    }

    EXPENSE {
        int Expense_ID PK
        int Project_ID FK
        enum Category "Labor, Material, Equipment, Misc"
        decimal Amount
        date Expense_Date
        varchar Description
        boolean Is_Override
        timestamp Created_At
    }

    RESOURCE {
        int Resource_ID PK
        int Project_ID FK
        varchar Resource_Name
        enum Type "Equipment, Manpower, Subcontract"
        decimal Quantity
        varchar Unit
        varchar Remarks
        timestamp Created_At
    }

    MATERIAL {
        int Material_ID PK
        int Project_ID FK
        varchar Material_Name
        decimal Quantity
        varchar Unit
        decimal Unit_Cost
        decimal Total_Cost "Quantity x Unit_Cost"
        int Reorder_Level
        timestamp Created_At
    }

    LOW_STOCK_ALERT {
        int Alert_ID PK
        int Material_ID FK
        int Project_ID FK
        varchar Material_Name
        decimal Current_Quantity
        int Reorder_Level
        timestamp Alert_Date
        enum Status "Active, Resolved"
    }

    FORM_TYPE {
        int Type_ID PK
        varchar Type_Name UK
        varchar Report_Group
        timestamp Created_At
    }

    SITE_FORM {
        int Form_ID PK
        varchar Source_Ref "Non-unique Ref"
        int Project_ID FK
        int Type_ID FK
        varchar Form_Name
        varchar Form_Status
        enum Status_Class "Open, Closed"
        varchar Location_Path
        date Created_Date
        date Status_Changed_Date
        int Open_Actions
        int Total_Actions
        enum Association "parent, child, null"
        boolean Is_Overdue
        boolean Has_Images
        boolean Has_Comments
        boolean Has_Documents
        timestamp Created_At
    }
```

---

### 2. Normalization Verification (3NF Compliance)

1. **1NF (First Normal Form):**
   - All tables possess primary keys (`Role_ID`, `User_ID`, `Contractor_ID`, `Project_ID`, etc.).
   - All attributes contain atomic, single-valued entries (e.g., individual amounts, scalar dates).
   - No repeating groups or array values.

2. **2NF (Second Normal Form):**
   - 1NF is fully satisfied.
   - All non-key attributes are fully functionally dependent on the entire primary key (all tables utilize single-column surrogate primary keys, thus eliminating partial dependencies).

3. **3NF (Third Normal Form):**
   - 2NF is fully satisfied.
   - Every non-key attribute depends only directly on the primary key, with zero transitive dependencies (e.g., User role attributes reside in `ROLE`, not duplicated in `USER`; Contractor details reside in `CONTRACTOR`, referenced via `Contractor_ID` foreign key in `PROJECT`).

---

### 3. Business Constraints, Triggers & Invariants

| Trigger / Constraint | Target Table | Timing / Event | Business Logic Enforcement |
| :--- | :--- | :--- | :--- |
| `trg_material_before_insert` | `MATERIAL` | `BEFORE INSERT` | Automatically computes `NEW.Total_Cost = ROUND(NEW.Quantity * NEW.Unit_Cost, 2)`. |
| `trg_material_before_update` | `MATERIAL` | `BEFORE UPDATE` | Automatically re-computes `NEW.Total_Cost = ROUND(NEW.Quantity * NEW.Unit_Cost, 2)` upon quantity or unit cost changes. |
| `trg_material_after_insert` | `MATERIAL` | `AFTER INSERT` | Evaluates if `Quantity <= Reorder_Level`. If true, automatically logs an alert into `LOW_STOCK_ALERT`. |
| `trg_material_after_update` | `MATERIAL` | `AFTER UPDATE` | If stock level drops below or equal to `Reorder_Level`, inserts or updates active alert. If replenished above `Reorder_Level`, automatically marks active alert as `'Resolved'`. |
| `trg_expense_before_insert` | `EXPENSE` | `BEFORE INSERT` | Queries `BUDGET.Approved_Budget` and cumulative expenses `SUM(Amount)`. Rejects transaction with SQLSTATE `'45000'` if budget is exceeded, unless `Is_Override = TRUE`. |
