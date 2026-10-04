-- ============================================================================
-- BuildCorp – Reproducible Demo Data Seed Script
-- Populates ROLE, USER, CONTRACTOR, BUDGET, EXPENSE, RESOURCE, MATERIAL, TASK, MILESTONE
-- For the 8 historical projects: 1328, 1329, 1330, 1335, 1338, 1340, 1343, 1345
-- Password for all users: Demo@123
-- Hash: $2a$10$4p31HgOBT.6jxlcBmWibQ..6wjzYFdDWtbVINS1L7inHCPBW3v4LW
-- ============================================================================

USE `construction_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. ROLES
INSERT INTO `ROLE` (`Role_ID`, `Role_Name`, `Description`) VALUES
(1, 'Admin', 'Complete administrative, governance and report access across system'),
(2, 'Project Manager', 'Oversees project delivery, budgets, task assignments and schedules'),
(3, 'Site Engineer', 'Manages day-to-day site operations, forms, inspections and quality'),
(4, 'Accountant', 'Manages financial records, budgets, cost auditing and fiscal reports'),
(5, 'Site Supervisor', 'Field supervisor handling work crews, materials count and diary entries')
ON DUPLICATE KEY UPDATE `Role_Name`=VALUES(`Role_Name`), `Description`=VALUES(`Description`);

-- 2. USERS
-- Password: Demo@123
INSERT INTO `USER` (`User_ID`, `Username`, `Email`, `Password_Hash`, `Full_Name`, `Role_ID`, `Status`) VALUES
(1, 'alex.vance', 'alex.vance@buildcorp.com', '$2a$10$4p31HgOBT.6jxlcBmWibQ..6wjzYFdDWtbVINS1L7inHCPBW3v4LW', 'Alex Vance', 1, 'Active'),
(2, 'sarah.jenkins', 'sarah.jenkins@buildcorp.com', '$2a$10$4p31HgOBT.6jxlcBmWibQ..6wjzYFdDWtbVINS1L7inHCPBW3v4LW', 'Sarah Jenkins', 2, 'Active'),
(3, 'rajesh.patel', 'rajesh.patel@buildcorp.com', '$2a$10$4p31HgOBT.6jxlcBmWibQ..6wjzYFdDWtbVINS1L7inHCPBW3v4LW', 'Rajesh Patel', 3, 'Active'),
(4, 'elena.rostova', 'elena.rostova@buildcorp.com', '$2a$10$4p31HgOBT.6jxlcBmWibQ..6wjzYFdDWtbVINS1L7inHCPBW3v4LW', 'Elena Rostova', 4, 'Active'),
(5, 'marcus.brody', 'marcus.brody@buildcorp.com', '$2a$10$4p31HgOBT.6jxlcBmWibQ..6wjzYFdDWtbVINS1L7inHCPBW3v4LW', 'Marcus Brody', 5, 'Active')
ON DUPLICATE KEY UPDATE 
  `Email`=VALUES(`Email`), 
  `Password_Hash`=VALUES(`Password_Hash`), 
  `Full_Name`=VALUES(`Full_Name`),
  `Role_ID`=VALUES(`Role_ID`),
  `Status`=VALUES(`Status`);

-- 3. CONTRACTORS
INSERT INTO `CONTRACTOR` (`Contractor_ID`, `Contractor_Name`, `Phone`, `Email`, `Address`) VALUES
(1, 'Apex Civil Engineering Ltd', '+1-555-0192', 'contact@apexcivil.com', '452 Industrial Parkway, Sector 4'),
(2, 'Pinnacle Structural Works', '+1-555-0144', 'contracts@pinnaclestruct.com', '88 Commercial Boulevard, Suite 210'),
(3, 'BuildTech MEP Systems', '+1-555-0188', 'tenders@buildtechmep.com', '12 Innovation Way, Tech Park'),
(4, 'Horizon Concrete Solutions', '+1-555-0173', 'info@horizonconcrete.com', '709 Harbor Expressway, Bay Area')
ON DUPLICATE KEY UPDATE
  `Contractor_Name`=VALUES(`Contractor_Name`),
  `Phone`=VALUES(`Phone`),
  `Email`=VALUES(`Email`),
  `Address`=VALUES(`Address`);

-- 4. UPDATE PROJECTS WITH MANAGERS & CONTRACTORS
UPDATE `PROJECT` SET `Manager_ID` = 2, `Contractor_ID` = 1, `Description` = 'Metro Terminal Expansion - Heavy civil foundation and structural framing' WHERE `Project_ID` = 1328;
UPDATE `PROJECT` SET `Manager_ID` = 2, `Contractor_ID` = 2, `Description` = 'Skyline Commercial Center - 24-story core superstructure & facade' WHERE `Project_ID` = 1330;
UPDATE `PROJECT` SET `Manager_ID` = 3, `Contractor_ID` = 3, `Description` = 'Riverside Logistics Hub - High-cube distribution warehouse' WHERE `Project_ID` = 1329;
UPDATE `PROJECT` SET `Manager_ID` = 2, `Contractor_ID` = 4, `Description` = 'Oakridge Residential Towers - Multi-phase concrete structural pouring' WHERE `Project_ID` = 1335;
UPDATE `PROJECT` SET `Manager_ID` = 3, `Contractor_ID` = 1, `Description` = 'Harbor Point Viaduct - Elevated bridge segment and utility corridors' WHERE `Project_ID` = 1340;
UPDATE `PROJECT` SET `Manager_ID` = 5, `Contractor_ID` = 2, `Description` = 'West End Medical Complex - Specialized MEP and sterile interior fitouts' WHERE `Project_ID` = 1338;
UPDATE `PROJECT` SET `Manager_ID` = 2, `Contractor_ID` = 3, `Description` = 'Tech Valley Innovation Campus - LEED Platinum sustainable lab facility' WHERE `Project_ID` = 1343;
UPDATE `PROJECT` SET `Manager_ID` = 3, `Contractor_ID` = 4, `Description` = 'Southwest Industrial Park - Subgrade excavation and stormwater drainage' WHERE `Project_ID` = 1345;

-- 5. BUDGETS (1:1 with PROJECT)
DELETE FROM `BUDGET`;
INSERT INTO `BUDGET` (`Budget_ID`, `Project_ID`, `Total_Budget`, `Approved_Budget`, `Created_Date`, `Remarks`) VALUES
(1, 1328, 4500000.00, 4200000.00, '2019-01-10', 'Primary municipal infrastructure grant approved'),
(2, 1330, 3800000.00, 3600000.00, '2019-02-15', 'Phase 1 commercial construction capital allocation'),
(3, 1329, 2900000.00, 2750000.00, '2019-03-01', 'Private logistics developer financed budget'),
(4, 1335, 3200000.00, 3000000.00, '2019-04-12', 'Joint-venture residential financing package'),
(5, 1340, 2100000.00, 2000000.00, '2019-05-20', 'Civil transportation authority allocation'),
(6, 1338, 1950000.00, 1850000.00, '2019-06-05', 'Healthcare trust approved capital budget'),
(7, 1343, 2400000.00, 2250000.00, '2019-07-01', 'Cleanroom and green building technology grant'),
(8, 1345, 1750000.00, 1600000.00, '2019-08-18', 'Industrial zone infrastructure funding');

-- 6. EXPENSES (Realistic breakdown across categories, within approved budgets)
DELETE FROM `EXPENSE`;
INSERT INTO `EXPENSE` (`Project_ID`, `Category`, `Amount`, `Expense_Date`, `Description`) VALUES
-- Project 1328 (Approved: 4,200,000 | Spent: 2,850,000)
(1328, 'Labor', 950000.00, '2019-06-15', 'Foundation & pilings specialized labor contract'),
(1328, 'Material', 1100000.00, '2019-07-20', 'Reinforced grade 60 steel rebars & bulk aggregate'),
(1328, 'Equipment', 620000.00, '2019-08-10', 'Liebherr 280 EC-H tower crane lease for 6 months'),
(1328, 'Misc', 180000.00, '2019-09-01', 'Site security, environmental permits, and testing'),

-- Project 1330 (Approved: 3,600,000 | Spent: 2,420,000)
(1330, 'Labor', 820000.00, '2019-08-01', 'Formwork carpenting and rebar tying crews'),
(1330, 'Material', 980000.00, '2019-09-12', 'High-strength C40 ready-mix concrete batch delivery'),
(1330, 'Equipment', 480000.00, '2019-10-05', 'Hydraulic crawler boom lifts and mobile cranes'),
(1330, 'Misc', 140000.00, '2019-11-20', 'Structural third-party QA/QC compliance inspections'),

-- Project 1329 (Approved: 2,750,000 | Spent: 1,910,000)
(1329, 'Labor', 640000.00, '2019-09-15', 'Subgrade earthmoving and compaction operators'),
(1329, 'Material', 790000.00, '2019-10-22', 'Precast tilt-up concrete wall panels and gravel'),
(1329, 'Equipment', 390000.00, '2019-11-14', 'CAT D8T Bulldozers and articulated dump trucks'),
(1329, 'Misc', 90000.00, '2019-12-01', 'Permits and geotechnical borehole verification'),

-- Project 1335 (Approved: 3,000,000 | Spent: 2,150,000)
(1335, 'Labor', 750000.00, '2019-11-01', 'Structural concrete pours and MEP rough-in crews'),
(1335, 'Material', 880000.00, '2019-12-05', 'Pre-stressed tendons and structural rebar bundles'),
(1335, 'Equipment', 410000.00, '2020-01-18', 'Concrete boom pumps and stationary batching units'),
(1335, 'Misc', 110000.00, '2020-02-10', 'Safety netting, scaffolding rentals, and hoist lines'),

-- Project 1340 (Approved: 2,000,000 | Spent: 1,380,000)
(1340, 'Labor', 490000.00, '2020-01-15', 'Deep caisson drilling and pile-cap steel fixing'),
(1340, 'Material', 560000.00, '2020-02-20', 'Bridge deck elastomeric bearings and girders'),
(1340, 'Equipment', 270000.00, '2020-03-12', 'Rotary drilling rig and hydraulic hammer rental'),
(1340, 'Misc', 60000.00, '2020-04-01', 'Highway traffic detour management and signage'),

-- Project 1338 (Approved: 1,850,000 | Spent: 1,210,000)
(1338, 'Labor', 430000.00, '2020-02-10', 'Cleanroom HVAC ducting and medical gas piping crews'),
(1338, 'Material', 510000.00, '2020-03-15', 'Antimicrobial epoxy flooring and lead shielding'),
(1338, 'Equipment', 210000.00, '2020-04-05', 'HEPA filtration units and scissor lift platforms'),
(1338, 'Misc', 60000.00, '2020-05-01', 'Hospital regulatory accreditation fees and test runs'),

-- Project 1343 (Approved: 2,250,000 | Spent: 1,490,000)
(1343, 'Labor', 520000.00, '2020-03-20', 'Solar photovoltaic mounting and electrical engineers'),
(1343, 'Material', 610000.00, '2020-04-25', 'Low-E triple pane curtain wall glazing panels'),
(1343, 'Equipment', 280000.00, '2020-05-18', 'Suction glass handling cranes and boom lifts'),
(1343, 'Misc', 80000.00, '2020-06-10', 'LEED certification consulting and thermal scans'),

-- Project 1345 (Approved: 1,600,000 | Spent: 980,000)
(1345, 'Labor', 350000.00, '2020-04-10', 'Site grading, trenching, and stormwater pipe laying'),
(1345, 'Material', 410000.00, '2020-05-12', 'Reinforced concrete culverts and sub-base gravel'),
(1345, 'Equipment', 180000.00, '2020-06-08', 'Vibratory soil compactors and backhoe excavators'),
(1345, 'Misc', 40000.00, '2020-07-01', 'Erosion control sedimentation barriers');

-- 7. RESOURCES (Equipment, Manpower, Subcontracts)
DELETE FROM `RESOURCE`;
INSERT INTO `RESOURCE` (`Project_ID`, `Resource_Name`, `Type`, `Quantity`, `Unit`, `Remarks`) VALUES
(1328, 'Potain MDT 389 Tower Crane', 'Equipment', 2.00, 'Units', 'Primary vertical transport tower crane'),
(1328, 'Certified Riggers & Steelworkers', 'Manpower', 35.00, 'Persons', 'Skilled union steel fixers'),
(1328, 'Deep Foundation Boring Subcontract', 'Subcontract', 1.00, 'Contract', 'Turnkey bored piling with Bauer BG30'),

(1330, 'Putzmeister Concrete Boom Pump 42m', 'Equipment', 1.00, 'Units', 'High-rise structural pour placement'),
(1330, 'Structural Concrete Pouring Team', 'Manpower', 28.00, 'Persons', 'Specialized pump operators & vibrators'),
(1330, 'Facade Glazing Subcontract', 'Subcontract', 1.00, 'Contract', 'Unitized curtain wall installation'),

(1329, 'Komatsu PC390 Excavator', 'Equipment', 3.00, 'Units', 'Bulk excavation & earth retention'),
(1329, 'Heavy Equipment Operators', 'Manpower', 12.00, 'Persons', 'Earthmoving crew'),
(1329, 'Precast Erection Subcontract', 'Subcontract', 1.00, 'Contract', 'Tilt-up panel crane rigging and erection'),

(1335, 'Alimak Scando Personnel Hoist', 'Equipment', 2.00, 'Units', 'Vertical personnel and tools transport'),
(1335, 'Formwork Carpentry Crew', 'Manpower', 24.00, 'Persons', 'Doka climbing formwork technicians'),
(1335, 'MEP Rough-in Subcontract', 'Subcontract', 1.00, 'Contract', 'Plumbing, electrical and HVAC rough-ins');

-- 8. MATERIALS (Includes low-stock items where Quantity <= Reorder_Level to test alerts)
DELETE FROM `LOW_STOCK_ALERT`;
DELETE FROM `MATERIAL`;

INSERT INTO `MATERIAL` (`Project_ID`, `Material_Name`, `Quantity`, `Unit`, `Unit_Cost`, `Reorder_Level`) VALUES
-- Normal stock items
(1328, 'OPC 53 Grade Portland Cement', 1500.00, 'Bags', 8.50, 200),
(1328, 'TMT Fe500D 16mm Steel Rebars', 45.00, 'Tons', 780.00, 10),
-- LOW STOCK ITEM 1 (Quantity 6 <= Reorder 15) -> Will trigger LOW_STOCK_ALERT
(1328, 'Hydraulic Bentonite Slurry', 6.00, 'Barrels', 185.00, 15),

-- Normal stock items
(1330, 'Ready-Mix Concrete Grade C40', 820.00, 'm3', 120.00, 100),
(1330, 'Structural Plywood Formwork 18mm', 650.00, 'Sheets', 28.00, 80),
-- LOW STOCK ITEM 2 (Quantity 12 <= Reorder 40) -> Will trigger LOW_STOCK_ALERT
(1330, 'Anchor Bolts M24 High-Tensile', 12.00, 'Boxes', 95.00, 40),

-- Normal stock items
(1329, 'Crushed Aggregate 20mm', 850.00, 'Tons', 32.00, 150),
-- LOW STOCK ITEM 3 (Quantity 8 <= Reorder 25) -> Will trigger LOW_STOCK_ALERT
(1329, 'Geotextile Non-Woven Fabric 300gsm', 8.00, 'Rolls', 240.00, 25),

-- Normal stock items
(1335, 'Galvanized Post-Tension Ducting', 1200.00, 'Meters', 9.50, 200),
-- LOW STOCK ITEM 4 (Quantity 5 <= Reorder 20) -> Will trigger LOW_STOCK_ALERT
(1335, 'Epoxy Bonding Agent SikaDur 32', 5.00, 'Kits', 145.00, 20);

-- 9. TASKS (With diverse statuses across projects)
DELETE FROM `TASK`;
INSERT INTO `TASK` (`Project_ID`, `Assigned_To`, `Task_Name`, `Start_Date`, `Due_Date`, `Status`) VALUES
-- Project 1328
(1328, 2, 'Substructure Bored Piling & Load Testing', '2019-02-01', '2019-04-15', 'Done'),
(1328, 3, 'Basement Retaining Wall Concrete Pouring', '2019-04-16', '2019-07-30', 'Done'),
(1328, 3, 'Ground Floor Structural Deck Reinforcement', '2019-08-01', '2019-10-15', 'In-Progress'),
(1328, 5, 'Perimeter Dewatering Wellpoint Maintenance', '2019-09-01', '2019-11-30', 'Blocked'),

-- Project 1330
(1330, 2, 'Tower Core Slipform Assembly', '2019-03-01', '2019-05-20', 'Done'),
(1330, 3, 'Level 10 Structural Slab Post-Tensioning', '2019-06-01', '2019-08-15', 'Done'),
(1330, 5, 'External Curtain Wall Bracket Anchoring', '2019-08-20', '2019-11-10', 'In-Progress'),
(1330, 3, 'Fire Suppression Risers Pressure Testing', '2019-10-01', '2019-12-15', 'Open'),

-- Project 1329
(1329, 3, 'Stormwater Detention Pond Excavation', '2019-04-10', '2019-06-30', 'Done'),
(1329, 5, 'Heavy Industrial Floor Slab Laser Screed Pour', '2019-07-05', '2019-09-25', 'In-Progress'),
(1329, 2, 'Loading Dock Leveler Frame Installation', '2019-10-01', '2019-11-15', 'Open'),

-- Project 1335
(1335, 5, 'Podium Parking Deck Waterproofing Membrane', '2019-06-01', '2019-08-30', 'Done'),
(1335, 3, 'Tower 1 Shear Wall Steel Caging Inspection', '2019-09-01', '2019-11-20', 'In-Progress'),
(1335, 2, 'Transformer Substation Civil Handover', '2019-11-15', '2020-01-30', 'Open');

-- 10. MILESTONES (With Pending, Achieved, and Delayed states)
DELETE FROM `MILESTONE`;
INSERT INTO `MILESTONE` (`Project_ID`, `Milestone_Name`, `Description`, `Due_Date`, `Status`) VALUES
-- Project 1328
(1328, 'Foundation Substructure Sign-off', 'Civil engineering sign-off on 180 bored piles and raft slab', '2019-05-15', 'Achieved'),
(1328, 'Ground Level Transfer Slab Complete', 'Post-tensioned heavy transfer girder and deck poured', '2019-09-30', 'Achieved'),
(1328, 'Mid-Rise Structural Topping Out', 'Level 15 structural frame topped out and sealed', '2019-12-15', 'Delayed'),
(1328, 'Final Envelope Enclosure & Glazing', 'Weather-tight building envelope certification', '2020-05-30', 'Pending'),

-- Project 1330
(1330, 'Deep Basement Excavation & Retention', 'Excavation to -14m with soldier piles and shotcrete', '2019-04-30', 'Achieved'),
(1330, 'Core Superstructure Level 12 Pour', 'Climbing formwork core reached Level 12 threshold', '2019-08-30', 'Achieved'),
(1330, 'Main Electrical Substation Energization', 'Utility tie-in and medium voltage switchgear testing', '2019-11-30', 'Delayed'),
(1330, 'Exterior Curtain Wall Completion', 'Complete high-performance double-glazed facade', '2020-04-15', 'Pending'),

-- Project 1329
(1329, 'Industrial Pad Subgrade Certification', 'Compaction testing achieving 98% Proctor density', '2019-06-15', 'Achieved'),
(1329, 'Precast Tilt-Wall Perimeter Closed', 'All 48 concrete tilt-panels erected and braced', '2019-10-15', 'Achieved'),
(1329, 'Roof Membrane & Skylight Installation', 'TPO heat-welded roofing system water test', '2019-12-01', 'Delayed'),

-- Project 1335
(1335, 'Foundation Raft 2400m3 Monolithic Pour', 'Continuous 36-hour ready-mix concrete placement', '2019-07-20', 'Achieved'),
(1335, 'Podium Level 3 Concrete Decks Poured', 'Retail and parking deck structural signoff', '2019-11-10', 'Achieved'),
(1335, 'Vertical Passenger Lift Shaft Handover', 'Elevator contractor shaft plumbness acceptance', '2020-02-28', 'Pending');

SET FOREIGN_KEY_CHECKS = 1;
