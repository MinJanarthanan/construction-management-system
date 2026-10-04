-- ==========================================================
-- Construction Management System - Seed Data (MySQL)
-- Realistic Sample Data for Demo, Evaluation & Testing
-- Password for all sample users is: password123
-- ==========================================================

USE `construction_db`;

-- ----------------------------------------------------------
-- 1. Insert Seed Roles
-- ----------------------------------------------------------
INSERT INTO `ROLE` (`Role_ID`, `Role_Name`, `Description`) VALUES
(1, 'Admin', 'Full administrative system access and user governance'),
(2, 'Project Manager', 'Manages project lifecycle, scheduling, budget, and overall execution'),
(3, 'Site Engineer', 'Oversees technical site execution, structural milestones, and material specs'),
(4, 'Accountant', 'Manages financial budgets, expenses, invoices, and fiscal reporting'),
(5, 'Site Supervisor', 'Monitors day-to-day site operations, labor tasks, and material usage');

-- ----------------------------------------------------------
-- 2. Insert Seed Users (Password: password123)
-- Bcrypt Hash for 'password123': $2a$10$e8vK05b6qYy.P2L6f9w4.O4rT8T6dE9/eR0m.lP5L7s4V0fQzUqKu
-- ----------------------------------------------------------
INSERT INTO `USER` (`User_ID`, `Username`, `Email`, `Password_Hash`, `Full_Name`, `Role_ID`, `Status`) VALUES
(1, 'admin_alex', 'alex.admin@buildcorp.com', '$2a$10$Wq9b2R3YxM1O9zS4K7J.2e5lZg8H9.U3b0V7m6P1l4K2j9o0i3r.K', 'Alex Vance', 1, 'Active'),
(2, 'pm_sarah', 'sarah.pm@buildcorp.com', '$2a$10$Wq9b2R3YxM1O9zS4K7J.2e5lZg8H9.U3b0V7m6P1l4K2j9o0i3r.K', 'Sarah Jenkins', 2, 'Active'),
(3, 'eng_raj', 'raj.engineer@buildcorp.com', '$2a$10$Wq9b2R3YxM1O9zS4K7J.2e5lZg8H9.U3b0V7m6P1l4K2j9o0i3r.K', 'Rajesh Patel', 3, 'Active'),
(4, 'acct_elena', 'elena.acct@buildcorp.com', '$2a$10$Wq9b2R3YxM1O9zS4K7J.2e5lZg8H9.U3b0V7m6P1l4K2j9o0i3r.K', 'Elena Rostova', 4, 'Active'),
(5, 'sup_marcus', 'marcus.sup@buildcorp.com', '$2a$10$Wq9b2R3YxM1O9zS4K7J.2e5lZg8H9.U3b0V7m6P1l4K2j9o0i3r.K', 'Marcus Brody', 5, 'Active');

-- ----------------------------------------------------------
-- 3. Insert Contractors
-- ----------------------------------------------------------
INSERT INTO `CONTRACTOR` (`Contractor_ID`, `Contractor_Name`, `Phone`, `Email`, `Address`) VALUES
(1, 'Apex Structural Foundations Ltd', '+1-555-0192', 'contact@apexstructural.com', '742 Evergreen Terrace, Industrial Zone, Chicago, IL'),
(2, 'Titan Earthworks & Concrete', '+1-555-0341', 'bids@titanearth.com', '1200 Quarry Way, Suite 400, Houston, TX'),
(3, 'Skyline Steel & Glazing Co', '+1-555-0784', 'info@skylinesteel.com', '88 Metro Boulevard, North District, New York, NY'),
(4, 'Vanguard MEP & Electrical', '+1-555-0912', 'operations@vanguardmep.com', '540 Volt Ave, Westside Hub, Seattle, WA'),
(5, 'GreenTerra Landscaping & Paving', '+1-555-0456', 'hello@greenterra.com', '310 Eco Park Drive, Denver, CO');

-- ----------------------------------------------------------
-- 4. Insert Projects
-- ----------------------------------------------------------
INSERT INTO `PROJECT` (`Project_ID`, `Project_Name`, `Description`, `Start_Date`, `End_Date`, `Status`, `Manager_ID`, `Contractor_ID`) VALUES
(1, 'Skyline Heights Luxury Tower', 'Construction of a 32-story mixed-use residential tower with 3 levels of underground parking and rooftop amenities.', '2026-01-15', '2027-11-30', 'In-Progress', 2, 3),
(2, 'Grand Valley Highway Expansion', 'Widening a 14-km four-lane arterial highway including two overpass bridges and stormwater drainage.', '2025-09-01', '2026-12-15', 'In-Progress', 2, 2),
(3, 'Metro Central Commercial Mall', 'Redevelopment of multi-tier shopping center including modern atrium, fire-rated structural steel, and HVAC revamp.', '2026-03-01', '2027-04-20', 'Planned', 2, 1),
(4, 'Rivergate Suspension Bridge Rehab', 'Structural reinforcement of steel cables, deck resurfacing, seismic dampers, and sensor instrumentation.', '2025-05-10', '2026-08-30', 'In-Progress', 3, 1),
(5, 'EcoValley Solar & Tech Park', 'Development of sustainable innovation campus powered by micro-grid solar arrays and zero-emission building envelope.', '2026-02-01', '2026-10-31', 'On-Hold', 2, 5);

-- ----------------------------------------------------------
-- 5. Insert Tasks
-- ----------------------------------------------------------
INSERT INTO `TASK` (`Task_ID`, `Project_ID`, `Assigned_To`, `Task_Name`, `Start_Date`, `Due_Date`, `Status`) VALUES
(1, 1, 3, 'Deep foundation excavation & piling inspection', '2026-01-18', '2026-03-10', 'Done'),
(2, 1, 3, 'Basement B1-B3 reinforced concrete slab casting', '2026-03-12', '2026-05-25', 'In-Progress'),
(3, 1, 5, 'Safety scaffolding assembly for floors 1 to 10', '2026-05-26', '2026-06-30', 'Open'),
(4, 1, 4, 'MEP rough-in audit for podium levels', '2026-07-01', '2026-08-15', 'Blocked'),
(5, 2, 5, 'Sub-grade soil compaction testing on Section B', '2026-02-01', '2026-04-15', 'In-Progress'),
(6, 2, 3, 'Overpass pier 4 concrete curing & strength tests', '2026-03-01', '2026-04-30', 'In-Progress'),
(7, 3, 2, 'Architectural schematics signoff & zoning permit', '2026-03-01', '2026-04-10', 'Done'),
(8, 4, 3, 'Ultrasonic testing of main suspension cables', '2026-01-10', '2026-03-01', 'Done'),
(9, 4, 5, 'Deck resurfacing asphalt layer application', '2026-03-15', '2026-05-15', 'In-Progress'),
(10, 5, 2, 'Environmental clearance & wetland buffer review', '2026-02-05', '2026-06-01', 'Blocked');

-- ----------------------------------------------------------
-- 6. Insert Milestones
-- ----------------------------------------------------------
INSERT INTO `MILESTONE` (`Milestone_ID`, `Project_ID`, `Milestone_Name`, `Description`, `Due_Date`, `Status`) VALUES
(1, 1, 'Substructure Completion', 'Basement piling and perimeter foundation walls certified', '2026-04-30', 'Achieved'),
(2, 1, 'Superstructure Top-Out (Floor 32)', 'Completion of highest roof slab structural pour', '2027-02-15', 'Pending'),
(3, 1, 'Facade & Glazing Enclosure', 'Full exterior curtain wall and waterproofing finished', '2027-06-30', 'Pending'),
(4, 2, 'Earthworks & Grade Stabilization', 'All grading, culverts, and baseline compaction completed', '2026-05-30', 'Pending'),
(5, 2, 'Overpass Bridge Opening', 'Traffic diverters active and both bridges load tested', '2026-10-15', 'Pending'),
(6, 3, 'Site Mobilization & Demolition', 'Old parking structure demolished and site cleared', '2026-05-01', 'Delayed'),
(7, 4, 'Suspension Cable Retrofit', 'All tensioning jacks and safety clamps installed', '2026-04-15', 'Achieved'),
(8, 5, 'Solar Array Foundation Grid', 'Installation of 4,000 ground-mounted PV anchor piers', '2026-07-31', 'Pending');

-- ----------------------------------------------------------
-- 7. Insert Budgets (1:1 with Project)
-- ----------------------------------------------------------
INSERT INTO `BUDGET` (`Budget_ID`, `Project_ID`, `Total_Budget`, `Approved_Budget`, `Created_Date`, `Remarks`) VALUES
(1, 1, 45000000.00, 42500000.00, '2026-01-05', 'Phase 1 high-rise commercial & residential development funding'),
(2, 2, 18500000.00, 18000000.00, '2025-08-20', 'State DOT infrastructure grant and regional transit matching fund'),
(3, 3, 28000000.00, 25000000.00, '2026-02-15', 'Private equity consortium tranche A approved'),
(4, 4, 9200000.00, 9200000.00, '2025-04-10', 'Municipal emergency bridge rehabilitation capital fund'),
(5, 5, 12000000.00, 11500000.00, '2026-01-20', 'Clean Energy Development Bond allocation');

-- ----------------------------------------------------------
-- 8. Insert Expenses
-- ----------------------------------------------------------
INSERT INTO `EXPENSE` (`Expense_ID`, `Project_ID`, `Category`, `Amount`, `Expense_Date`, `Description`) VALUES
(1, 1, 'Material', 1450000.00, '2026-02-10', 'High-strength Grade 60 rebar and Portland cement batch #1'),
(2, 1, 'Labor', 320000.00, '2026-02-28', 'Site excavation crew and foundation engineering payroll'),
(3, 1, 'Equipment', 185000.00, '2026-03-05', 'Liebherr 280 EC-H tower crane monthly lease and rigging'),
(4, 1, 'Misc', 45000.00, '2026-03-12', 'Third-party ultrasonic concrete testing and safety permits'),
(5, 2, 'Material', 890000.00, '2026-01-25', 'Aggregate base course and asphalt binder delivery (500 tons)'),
(6, 2, 'Equipment', 240000.00, '2026-02-14', 'Caterpillar motor grader & pneumatic roller rental'),
(7, 2, 'Labor', 410000.00, '2026-03-01', 'Paving crew night shift differential payroll'),
(8, 4, 'Material', 620000.00, '2026-01-15', 'High-tensile galvanized steel wire ropes and corrosion inhibitors'),
(9, 4, 'Labor', 290000.00, '2026-02-20', 'Certified high-altitude rigging specialists contract payment'),
(10, 5, 'Misc', 65000.00, '2026-02-18', 'Environmental impact assessment and bird migration study');

-- ----------------------------------------------------------
-- 9. Insert Resources
-- ----------------------------------------------------------
INSERT INTO `RESOURCE` (`Resource_ID`, `Project_ID`, `Resource_Name`, `Type`, `Quantity`, `Unit`, `Remarks`) VALUES
(1, 1, 'Liebherr Tower Crane 280 EC-H', 'Equipment', 2.00, 'Units', 'Anchored on core elevator shaft, 70m hook height'),
(2, 1, 'Certified Riggers & Carpenters Crew', 'Manpower', 45.00, 'Workers', 'Day shift formwork and steel placement team'),
(3, 1, 'Foundation Piling Subcontractor', 'Subcontract', 1.00, 'Contract', 'Apex Structural specialized geotechnical team'),
(4, 2, 'Caterpillar 140M Motor Grader', 'Equipment', 3.00, 'Units', 'Precision GPS-guided leveling unit'),
(5, 2, 'Highway Paving & Compaction Crew', 'Manpower', 28.00, 'Workers', 'Asphalt paving machine operators and rakers'),
(6, 4, 'Hydraulic Cable Tensioning Jacks', 'Equipment', 4.00, 'Units', 'Calibrated 500-ton hydraulic units'),
(7, 4, 'Specialized Suspension Rope Access Techs', 'Manpower', 12.00, 'Workers', 'IRATA Level 3 certified bridge climbers'),
(8, 5, 'Geotechnical Drilling Rig', 'Equipment', 1.00, 'Units', 'Soil core sampling for solar mast footings');

-- ----------------------------------------------------------
-- 10. Insert Materials (Including Low Stock Items for Alerts)
-- Total_Cost = Quantity * Unit_Cost
-- ----------------------------------------------------------
INSERT INTO `MATERIAL` (`Material_ID`, `Project_ID`, `Material_Name`, `Quantity`, `Unit`, `Unit_Cost`, `Total_Cost`) VALUES
(1, 1, 'Grade 60 Deformed Steel Rebar (16mm)', 1250.00, 'ton', 850.00, 1062500.00),
(2, 1, 'Portland Cement Type I/II (50kg bags)', 4500.00, 'bag', 12.50, 56250.00),
(3, 1, 'Ready-Mix Concrete C35/45', 850.00, 'm³', 145.00, 123250.00),
(4, 1, 'Low-E Acoustic Insulated Glass Panels', 8.00, 'pcs', 650.00, 5200.00), -- LOW STOCK (<= 10)
(5, 2, 'Asphalt Wearing Course Mix', 3200.00, 'ton', 95.00, 304000.00),
(6, 2, 'Corrugated Galvanized Drainage Pipes (1200mm)', 6.00, 'pcs', 480.00, 2880.00), -- LOW STOCK (<= 10)
(7, 2, 'Crushed Aggregate Base Course', 5400.00, 'ton', 32.00, 172800.00),
(8, 3, 'Structural I-Beams HEB 300', 4.00, 'ton', 1100.00, 4400.00), -- LOW STOCK (<= 10)
(9, 4, 'Zinc-Coated High Tensile Steel Cable (42mm)', 1800.00, 'meter', 120.00, 216000.00),
(10, 4, 'Epoxy Anti-Corrosion Coating Primer', 5.00, 'drum', 380.00, 1900.00), -- LOW STOCK (<= 10)
(11, 5, 'Monocrystalline Solar PV Modules (550W)', 1500.00, 'pcs', 185.00, 277500.00);
