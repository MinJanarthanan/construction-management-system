# BuildCorp – Construction Management System (DBMS Project)
**SRM Institute of Science and Technology**  
*Department of Computer Science and Engineering (AIML)*  
*Course:* Database Management Systems (DBMS) Laboratory Project  

---

## 1. Product Vision & Problem Statement

### 1.1 Background & Pain Points
Traditional construction job sites rely heavily on fragmented manual records, paper-based daily site logbooks, disconnected spreadsheets, and informal communication channels. This leads to critical operational vulnerabilities:
1. **Data Loss & Tampering:** Paper site diaries and inspection logs are easily damaged, lost, or backdated.
2. **Unexpected Material Shortages:** Stock depletion goes unnoticed until on-site work is halted, causing expensive downtime.
3. **Budget Overruns:** Actual expenditures across labor, equipment, and materials are tracked retroactively, preventing timely cost control against approved budgets.
4. **Site-to-Office Disconnect:** Field engineers, subcontractors, accountants, and executive project managers operate with siloed information, causing communication delays and uncoordinated project deliveries.

### 1.2 Product Goal
**BuildCorp** is a centralized, role-based, multi-site construction management web platform. It unifies:
- **Project & Contractor Portfolio:** Tracking project lifecycles, milestones, and contractor affiliations.
- **Task & Milestone Scheduling:** Assigning work items to site personnel with granular progress tracking and milestone statuses.
- **Budgeting & Expense Governance:** Real-time budget monitoring, categorical expense auditing, and automated trigger-based budget overrun prevention.
- **Materials Inventory & Stock Alerts:** Stock level tracking with automated cost calculations and proactive low-stock alert triggers.
- **Site Inspection Forms & Safety Audits:** Scalable ingestion and multi-parameter analysis of 10,000+ real-world site inspection records, tracking open action items, compliance statuses, and location workflows.

---

## 2. Stakeholders & Role-Based Access Control (RBAC)

The system enforces strict multi-tier Role-Based Access Control at both the API (Express middleware) and UI (React route guards and adaptive navigation) layers.

| Role | Core Responsibilities | Accessible Modules & Permissions |
| :--- | :--- | :--- |
| **Admin** | System configuration, user administration, security auditing, and executive oversight. | Full CRUD on all modules: Dashboard, Projects, Tasks, Materials & Stock, Resources & Labor, Finance & Budgets, Contractors, User Governance, Reports & Export. |
| **Project Manager** | Multi-site project coordination, scheduling, budget monitoring, and operational reporting. | Full operational access: Dashboard, Projects, Tasks, Materials & Stock, Resources & Labor, Finance & Budgets, Contractors, Reports & Export (No User Governance). |
| **Site Engineer** | Daily task execution, site inspection oversight, resource allocation, and material usage tracking. | Operational site management: Dashboard, Projects, Tasks, Materials & Stock, Resources & Labor, Finance & Budgets (Read/Expense submit), Contractors (Read), Reports & Export (No User Governance). |
| **Accountant** | Financial auditing, budget allocations, expense approvals, and fiscal compliance. | Financial & auditing focus: Dashboard, Projects (Read), Finance & Budgets (Full CRUD), Contractors (Read), Reports & Export (Read-only on operational data, No operational modifications). |
| **Site Supervisor** | On-site work supervision, daily site form filling, material stock logging, and crew supervision. | Field operations: Dashboard, Projects (Read), Tasks (Update status), Materials & Stock (Stock count updates), Resources & Labor (Field tracking), Reports & Export (No financial data access). |

### 2.1 Demo & Evaluation Utilities
- **Dev-Mode Role Switcher:** A prominent header control allowing evaluators and examiners to instantly switch roles without relogging, demonstrating adaptive UI rendering and API permission enforcement.
- **Session Management:** Secure token storage with JWT authentication, bcrypt password hashing, and clean logout invalidation.
- **API Security:** Endpoints return HTTP 403 Forbidden with standardized error JSON whenever a role violates the authorization matrix.

---

## 3. Functional Requirements Overview

### 3.1 Project, Task & Milestone Management
- Multi-project tracking (including imported historical projects: 1328, 1330, 1329, 1335, 1340, 1338, 1343, 1345).
- Project lifecycle states: `Planned`, `In-Progress`, `On-Hold`, `Completed`.
- Task tracking with assignee mapping, start/due dates, and status kanban (`Open`, `In-Progress`, `Blocked`, `Done`).
- Milestone deadline tracking (`Pending`, `Achieved`, `Delayed`).

### 3.2 Inventory & Resource Management
- Materials catalog with automated unit-cost extension (`Total_Cost = Quantity × Unit_Cost`).
- Automatic threshold surveillance (`Quantity <= Reorder_Level`) triggering alerts in `LOW_STOCK_ALERT`.
- Site resources and heavy machinery/manpower allocation tracking (`Equipment`, `Manpower`, `Subcontract`).

### 3.3 Financial Governance
- 1:1 Project Budget allocation (`Total_Budget`, `Approved_Budget`).
- Categorical expense auditing (`Labor`, `Material`, `Equipment`, `Misc`).
- Database trigger enforcement blocking unapproved budget overruns unless explicit manager override is flagged.

### 3.4 Site Forms & Quality/Safety Audits (Real Dataset Integration)
- Server-side paginated indexing of 10,254 historical site inspection forms.
- Dynamic filtering by Project ID, Form Type, Report Group, Status, Status Class (`Open`/`Closed`), Date range, and Free-text search.
- Stale form detection and open-action item metrics.

---

## 4. Technical Specifications

- **Database:** MySQL 8.0+ / MariaDB 10.4+ (InnoDB engine, strict foreign key constraints, 3NF normalization, automated triggers, stored procedures, and analytical views).
- **Backend:** Node.js (v18+) with Express REST API, JWT authentication, bcrypt hashing, parameterized queries, and Swagger/OpenAPI documentation.
- **Frontend:** React 18 (Vite build system), modern CSS with responsive glassmorphism aesthetic, Recharts interactive data visualizations, React Router DOM.
- **Data Engineering:** Automated Python ETL pipeline (`scripts/import_csv.py`) validating, normalizing, and ingesting 10,254 site forms with idempotent batch transactions.
