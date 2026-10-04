-- ============================================================================
-- BuildCorp – Construction Management System (DBMS Project)
-- Relational Database Schema: MySQL 8.0+ / MariaDB 10.4+ (InnoDB Engine)
-- Department of CSE (AIML), SRM Institute of Science and Technology
-- Normalized to 3NF with Foreign Keys, Triggers, Views & Stored Procedures
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `construction_db`
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `construction_db`;

-- Disable FK checks for clean teardown and rebuild
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `SITE_FORM`;
DROP TABLE IF EXISTS `FORM_TYPE`;
DROP TABLE IF EXISTS `LOW_STOCK_ALERT`;
DROP TABLE IF EXISTS `MATERIAL`;
DROP TABLE IF EXISTS `RESOURCE`;
DROP TABLE IF EXISTS `EXPENSE`;
DROP TABLE IF EXISTS `BUDGET`;
DROP TABLE IF EXISTS `MILESTONE`;
DROP TABLE IF EXISTS `TASK`;
DROP TABLE IF EXISTS `PROJECT`;
DROP TABLE IF EXISTS `CONTRACTOR`;
DROP TABLE IF EXISTS `USER`;
DROP TABLE IF EXISTS `ROLE`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. ROLE TABLE
-- ============================================================================
CREATE TABLE `ROLE` (
  `Role_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Role_Name` VARCHAR(50) NOT NULL UNIQUE,
  `Description` VARCHAR(255) NULL,
  `Created_At` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. USER TABLE
-- ============================================================================
CREATE TABLE `USER` (
  `User_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Username` VARCHAR(50) NOT NULL UNIQUE,
  `Email` VARCHAR(100) NOT NULL UNIQUE,
  `Password_Hash` VARCHAR(255) NOT NULL,
  `Full_Name` VARCHAR(100) NOT NULL,
  `Role_ID` INT NOT NULL,
  `Status` ENUM('Active', 'Inactive', 'Suspended') NOT NULL DEFAULT 'Active',
  `Created_At` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_user_role` FOREIGN KEY (`Role_ID`)
    REFERENCES `ROLE` (`Role_ID`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_user_role` (`Role_ID`),
  INDEX `idx_user_status` (`Status`),
  INDEX `idx_user_email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. CONTRACTOR TABLE
-- ============================================================================
CREATE TABLE `CONTRACTOR` (
  `Contractor_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Contractor_Name` VARCHAR(100) NOT NULL,
  `Phone` VARCHAR(20) NOT NULL,
  `Email` VARCHAR(100) NOT NULL,
  `Address` VARCHAR(255) NOT NULL,
  `Created_At` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_contractor_name` (`Contractor_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. PROJECT TABLE
-- Supports explicit manual IDs (such as 1328, 1330 from real CSV) or AUTO_INCREMENT
-- ============================================================================
CREATE TABLE `PROJECT` (
  `Project_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Project_Name` VARCHAR(150) NOT NULL,
  `Description` TEXT NULL,
  `Start_Date` DATE NOT NULL,
  `End_Date` DATE NOT NULL,
  `Status` ENUM('Planned', 'In-Progress', 'On-Hold', 'Completed') NOT NULL DEFAULT 'Planned',
  `Manager_ID` INT NULL,
  `Contractor_ID` INT NULL,
  `Created_At` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_project_manager` FOREIGN KEY (`Manager_ID`)
    REFERENCES `USER` (`User_ID`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_project_contractor` FOREIGN KEY (`Contractor_ID`)
    REFERENCES `CONTRACTOR` (`Contractor_ID`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_project_manager` (`Manager_ID`),
  INDEX `idx_project_contractor` (`Contractor_ID`),
  INDEX `idx_project_status` (`Status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. TASK TABLE
-- ============================================================================
CREATE TABLE `TASK` (
  `Task_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Project_ID` INT NOT NULL,
  `Assigned_To` INT NULL,
  `Task_Name` VARCHAR(150) NOT NULL,
  `Start_Date` DATE NOT NULL,
  `Due_Date` DATE NOT NULL,
  `Status` ENUM('Open', 'In-Progress', 'Blocked', 'Done') NOT NULL DEFAULT 'Open',
  `Created_At` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_task_project` FOREIGN KEY (`Project_ID`)
    REFERENCES `PROJECT` (`Project_ID`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_task_user` FOREIGN KEY (`Assigned_To`)
    REFERENCES `USER` (`User_ID`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_task_project` (`Project_ID`),
  INDEX `idx_task_assigned` (`Assigned_To`),
  INDEX `idx_task_status` (`Status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. MILESTONE TABLE
-- ============================================================================
CREATE TABLE `MILESTONE` (
  `Milestone_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Project_ID` INT NOT NULL,
  `Milestone_Name` VARCHAR(150) NOT NULL,
  `Description` VARCHAR(255) NULL,
  `Due_Date` DATE NOT NULL,
  `Status` ENUM('Pending', 'Achieved', 'Delayed') NOT NULL DEFAULT 'Pending',
  `Created_At` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_milestone_project` FOREIGN KEY (`Project_ID`)
    REFERENCES `PROJECT` (`Project_ID`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_milestone_project` (`Project_ID`),
  INDEX `idx_milestone_status` (`Status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. BUDGET TABLE (Strict 1:1 with PROJECT via UNIQUE constraint)
-- ============================================================================
CREATE TABLE `BUDGET` (
  `Budget_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Project_ID` INT NOT NULL UNIQUE,
  `Total_Budget` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `Approved_Budget` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `Created_Date` DATE NOT NULL,
  `Remarks` VARCHAR(255) NULL,
  `Created_At` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_budget_project` FOREIGN KEY (`Project_ID`)
    REFERENCES `PROJECT` (`Project_ID`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_budget_project` (`Project_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. EXPENSE TABLE
-- ============================================================================
CREATE TABLE `EXPENSE` (
  `Expense_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Project_ID` INT NOT NULL,
  `Category` ENUM('Labor', 'Material', 'Equipment', 'Misc') NOT NULL,
  `Amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `Expense_Date` DATE NOT NULL,
  `Description` VARCHAR(255) NULL,
  `Is_Override` BOOLEAN NOT NULL DEFAULT FALSE,
  `Created_At` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_expense_project` FOREIGN KEY (`Project_ID`)
    REFERENCES `PROJECT` (`Project_ID`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_expense_project` (`Project_ID`),
  INDEX `idx_expense_category` (`Category`),
  INDEX `idx_expense_date` (`Expense_Date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. RESOURCE TABLE
-- ============================================================================
CREATE TABLE `RESOURCE` (
  `Resource_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Project_ID` INT NOT NULL,
  `Resource_Name` VARCHAR(100) NOT NULL,
  `Type` ENUM('Equipment', 'Manpower', 'Subcontract') NOT NULL,
  `Quantity` DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  `Unit` VARCHAR(20) NOT NULL,
  `Remarks` VARCHAR(255) NULL,
  `Created_At` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_resource_project` FOREIGN KEY (`Project_ID`)
    REFERENCES `PROJECT` (`Project_ID`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_resource_project` (`Project_ID`),
  INDEX `idx_resource_type` (`Type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. MATERIAL TABLE
-- Total_Cost is computed automatically via trigger (Quantity * Unit_Cost)
-- ============================================================================
CREATE TABLE `MATERIAL` (
  `Material_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Project_ID` INT NOT NULL,
  `Material_Name` VARCHAR(100) NOT NULL,
  `Quantity` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `Unit` VARCHAR(20) NOT NULL,
  `Unit_Cost` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `Total_Cost` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `Reorder_Level` INT NOT NULL DEFAULT 10,
  `Created_At` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_material_project` FOREIGN KEY (`Project_ID`)
    REFERENCES `PROJECT` (`Project_ID`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_material_project` (`Project_ID`),
  INDEX `idx_material_name` (`Material_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. LOW_STOCK_ALERT TABLE
-- Populated automatically via trigger when MATERIAL Quantity <= Reorder_Level
-- ============================================================================
CREATE TABLE `LOW_STOCK_ALERT` (
  `Alert_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Material_ID` INT NOT NULL,
  `Project_ID` INT NOT NULL,
  `Material_Name` VARCHAR(100) NOT NULL,
  `Current_Quantity` DECIMAL(10,2) NOT NULL,
  `Reorder_Level` INT NOT NULL,
  `Alert_Date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `Status` ENUM('Active', 'Resolved') NOT NULL DEFAULT 'Active',
  CONSTRAINT `fk_alert_material` FOREIGN KEY (`Material_ID`)
    REFERENCES `MATERIAL` (`Material_ID`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_alert_project` FOREIGN KEY (`Project_ID`)
    REFERENCES `PROJECT` (`Project_ID`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_alert_material` (`Material_ID`),
  INDEX `idx_alert_project` (`Project_ID`),
  INDEX `idx_alert_status` (`Status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 12. FORM_TYPE TABLE (For Real Site Forms Dataset)
-- ============================================================================
CREATE TABLE `FORM_TYPE` (
  `Type_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Type_Name` VARCHAR(100) NOT NULL UNIQUE,
  `Report_Group` VARCHAR(100) NULL,
  `Created_At` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_form_type_group` (`Report_Group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 13. SITE_FORM TABLE (Supports 10,254 Real Records)
-- ============================================================================
CREATE TABLE `SITE_FORM` (
  `Form_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Source_Ref` VARCHAR(30) NOT NULL, -- Ref is not unique in raw data
  `Project_ID` INT NOT NULL,
  `Type_ID` INT NULL,
  `Form_Name` VARCHAR(200) NOT NULL,
  `Form_Status` VARCHAR(80) NOT NULL,
  `Status_Class` ENUM('Open', 'Closed') NULL,
  `Location_Path` VARCHAR(255) NULL,
  `Created_Date` DATE NOT NULL,
  `Status_Changed_Date` DATE NULL,
  `Open_Actions` INT NOT NULL DEFAULT 0,
  `Total_Actions` INT NOT NULL DEFAULT 0,
  `Association` ENUM('parent', 'child') NULL,
  `Is_Overdue` BOOLEAN NOT NULL DEFAULT FALSE,
  `Has_Images` BOOLEAN NOT NULL DEFAULT FALSE,
  `Has_Comments` BOOLEAN NOT NULL DEFAULT FALSE,
  `Has_Documents` BOOLEAN NULL,
  `Created_At` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_siteform_project` FOREIGN KEY (`Project_ID`)
    REFERENCES `PROJECT` (`Project_ID`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_siteform_type` FOREIGN KEY (`Type_ID`)
    REFERENCES `FORM_TYPE` (`Type_ID`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_siteform_project` (`Project_ID`),
  INDEX `idx_siteform_date` (`Created_Date`),
  INDEX `idx_siteform_type` (`Type_ID`),
  INDEX `idx_siteform_class` (`Status_Class`),
  INDEX `idx_siteform_search` (`Project_ID`, `Created_Date`, `Type_ID`, `Status_Class`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DATABASE TRIGGERS
-- ============================================================================
DELIMITER $$

-- Trigger (a1): Compute Total_Cost before INSERT on MATERIAL
DROP TRIGGER IF EXISTS `trg_material_before_insert`$$
CREATE TRIGGER `trg_material_before_insert`
BEFORE INSERT ON `MATERIAL`
FOR EACH ROW
BEGIN
  SET NEW.Total_Cost = ROUND(NEW.Quantity * NEW.Unit_Cost, 2);
END$$

-- Trigger (a2): Compute Total_Cost before UPDATE on MATERIAL
DROP TRIGGER IF EXISTS `trg_material_before_update`$$
CREATE TRIGGER `trg_material_before_update`
BEFORE UPDATE ON `MATERIAL`
FOR EACH ROW
BEGIN
  SET NEW.Total_Cost = ROUND(NEW.Quantity * NEW.Unit_Cost, 2);
END$$

-- Trigger (b1): Write alert to LOW_STOCK_ALERT after INSERT on MATERIAL
DROP TRIGGER IF EXISTS `trg_material_after_insert`$$
CREATE TRIGGER `trg_material_after_insert`
AFTER INSERT ON `MATERIAL`
FOR EACH ROW
BEGIN
  IF NEW.Quantity <= NEW.Reorder_Level THEN
    INSERT INTO `LOW_STOCK_ALERT` (
      `Material_ID`, `Project_ID`, `Material_Name`, `Current_Quantity`, `Reorder_Level`, `Status`
    ) VALUES (
      NEW.Material_ID, NEW.Project_ID, NEW.Material_Name, NEW.Quantity, NEW.Reorder_Level, 'Active'
    );
  END IF;
END$$

-- Trigger (b2): Write alert to LOW_STOCK_ALERT after UPDATE on MATERIAL
DROP TRIGGER IF EXISTS `trg_material_after_update`$$
CREATE TRIGGER `trg_material_after_update`
AFTER UPDATE ON `MATERIAL`
FOR EACH ROW
BEGIN
  IF NEW.Quantity <= NEW.Reorder_Level THEN
    -- Only insert if no unresolved active alert exists
    IF NOT EXISTS (
      SELECT 1 FROM `LOW_STOCK_ALERT` 
      WHERE `Material_ID` = NEW.Material_ID AND `Status` = 'Active'
    ) THEN
      INSERT INTO `LOW_STOCK_ALERT` (
        `Material_ID`, `Project_ID`, `Material_Name`, `Current_Quantity`, `Reorder_Level`, `Status`
      ) VALUES (
        NEW.Material_ID, NEW.Project_ID, NEW.Material_Name, NEW.Quantity, NEW.Reorder_Level, 'Active'
      );
    ELSE
      -- Update existing active alert values
      UPDATE `LOW_STOCK_ALERT`
      SET `Current_Quantity` = NEW.Quantity, `Alert_Date` = CURRENT_TIMESTAMP
      WHERE `Material_ID` = NEW.Material_ID AND `Status` = 'Active';
    END IF;
  ELSE
    -- If replenished above reorder level, resolve existing active alerts
    UPDATE `LOW_STOCK_ALERT`
    SET `Status` = 'Resolved'
    WHERE `Material_ID` = NEW.Material_ID AND `Status` = 'Active';
  END IF;
END$$

-- Trigger (c): Block EXPENSE insert if cumulative expenses exceed Approved_Budget
DROP TRIGGER IF EXISTS `trg_expense_before_insert`$$
CREATE TRIGGER `trg_expense_before_insert`
BEFORE INSERT ON `EXPENSE`
FOR EACH ROW
BEGIN
  DECLARE v_approved_budget DECIMAL(14,2);
  DECLARE v_total_spent DECIMAL(14,2);

  -- Fetch Approved_Budget for this project
  SELECT `Approved_Budget` INTO v_approved_budget
  FROM `BUDGET`
  WHERE `Project_ID` = NEW.Project_ID
  LIMIT 1;

  -- Validate only if budget exists and override flag is not set
  IF v_approved_budget IS NOT NULL AND (NEW.Is_Override IS NULL OR NEW.Is_Override = FALSE) THEN
    SELECT COALESCE(SUM(`Amount`), 0.00) INTO v_total_spent
    FROM `EXPENSE`
    WHERE `Project_ID` = NEW.Project_ID;

    IF (v_total_spent + NEW.Amount) > v_approved_budget THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaction Rejected: Cumulative project expenses exceed Approved Budget. Manager override required.';
    END IF;
  END IF;
END$$

DELIMITER ;

-- ============================================================================
-- DATABASE VIEWS
-- ============================================================================

-- View 1: Project Financial Performance & Budget Utilization
CREATE OR REPLACE VIEW `v_project_financials` AS
SELECT 
  p.Project_ID,
  p.Project_Name,
  p.Status AS Project_Status,
  COALESCE(b.Total_Budget, 0.00) AS Total_Budget,
  COALESCE(b.Approved_Budget, 0.00) AS Approved_Budget,
  COALESCE(e.Total_Spent, 0.00) AS Total_Spent,
  ROUND(COALESCE(b.Approved_Budget, 0.00) - COALESCE(e.Total_Spent, 0.00), 2) AS Remaining_Budget,
  CASE 
    WHEN COALESCE(b.Approved_Budget, 0.00) > 0 THEN 
      ROUND((COALESCE(e.Total_Spent, 0.00) / b.Approved_Budget) * 100, 2)
    ELSE 0.00 
  END AS Percent_Used
FROM `PROJECT` p
LEFT JOIN `BUDGET` b ON p.Project_ID = b.Project_ID
LEFT JOIN (
  SELECT `Project_ID`, SUM(`Amount`) AS `Total_Spent`
  FROM `EXPENSE`
  GROUP BY `Project_ID`
) e ON p.Project_ID = e.Project_ID;

-- View 2: Task Status Aggregates per Project
CREATE OR REPLACE VIEW `v_task_status_counts` AS
SELECT 
  p.Project_ID,
  p.Project_Name,
  COUNT(t.Task_ID) AS Total_Tasks,
  SUM(CASE WHEN t.Status = 'Open' THEN 1 ELSE 0 END) AS Open_Tasks,
  SUM(CASE WHEN t.Status = 'In-Progress' THEN 1 ELSE 0 END) AS In_Progress_Tasks,
  SUM(CASE WHEN t.Status = 'Blocked' THEN 1 ELSE 0 END) AS Blocked_Tasks,
  SUM(CASE WHEN t.Status = 'Done' THEN 1 ELSE 0 END) AS Done_Tasks,
  CASE 
    WHEN COUNT(t.Task_ID) > 0 THEN 
      ROUND((SUM(CASE WHEN t.Status = 'Done' THEN 1 ELSE 0 END) / COUNT(t.Task_ID)) * 100, 2)
    ELSE 0.00 
  END AS Completion_Percentage
FROM `PROJECT` p
LEFT JOIN `TASK` t ON p.Project_ID = t.Project_ID
GROUP BY p.Project_ID, p.Project_Name;

-- View 3: Low-Stock Material Inventory Watchlist
CREATE OR REPLACE VIEW `v_low_stock` AS
SELECT 
  m.Material_ID,
  m.Project_ID,
  p.Project_Name,
  m.Material_Name,
  m.Quantity,
  m.Unit,
  m.Unit_Cost,
  m.Total_Cost,
  m.Reorder_Level,
  ROUND(m.Reorder_Level - m.Quantity, 2) AS Deficit
FROM `MATERIAL` m
JOIN `PROJECT` p ON m.Project_ID = p.Project_ID
WHERE m.Quantity <= m.Reorder_Level;

-- View 4: Site Forms Operational Metrics by Project
CREATE OR REPLACE VIEW `v_form_summary_by_project` AS
SELECT 
  p.Project_ID,
  p.Project_Name,
  COUNT(f.Form_ID) AS Total_Forms,
  SUM(CASE WHEN f.Status_Class = 'Open' THEN 1 ELSE 0 END) AS Open_Forms,
  SUM(CASE WHEN f.Status_Class = 'Closed' THEN 1 ELSE 0 END) AS Closed_Forms,
  COALESCE(SUM(f.Open_Actions), 0) AS Total_Open_Actions,
  COALESCE(SUM(f.Total_Actions), 0) AS Total_Actions,
  SUM(CASE WHEN f.Status_Class = 'Open' AND f.Status_Changed_Date < DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS Stale_Open_Forms
FROM `PROJECT` p
LEFT JOIN `SITE_FORM` f ON p.Project_ID = f.Project_ID
GROUP BY p.Project_ID, p.Project_Name;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================
DELIMITER $$

-- Stored Procedure 1: Project 360-Degree Comprehensive Dashboard
DROP PROCEDURE IF EXISTS `sp_project_dashboard`$$
CREATE PROCEDURE `sp_project_dashboard`(IN p_project_id INT)
BEGIN
  -- 1. Project Info & Financials
  SELECT 
    p.Project_ID, p.Project_Name, p.Status, p.Start_Date, p.End_Date,
    u.Full_Name AS Manager_Name,
    c.Contractor_Name,
    f.Approved_Budget, f.Total_Spent, f.Remaining_Budget, f.Percent_Used
  FROM `PROJECT` p
  LEFT JOIN `USER` u ON p.Manager_ID = u.User_ID
  LEFT JOIN `CONTRACTOR` c ON p.Contractor_ID = c.Contractor_ID
  LEFT JOIN `v_project_financials` f ON p.Project_ID = f.Project_ID
  WHERE p.Project_ID = p_project_id;

  -- 2. Task Summary
  SELECT * FROM `v_task_status_counts` WHERE `Project_ID` = p_project_id;

  -- 3. Low-Stock Alerts for this Project
  SELECT * FROM `v_low_stock` WHERE `Project_ID` = p_project_id;

  -- 4. Site Forms Summary for this Project
  SELECT * FROM `v_form_summary_by_project` WHERE `Project_ID` = p_project_id;
END$$

-- Stored Procedure 2: Cost & Payroll / Resource Expenditure Summary
DROP PROCEDURE IF EXISTS `sp_payroll_or_cost_summary`$$
CREATE PROCEDURE `sp_payroll_or_cost_summary`(IN p_project_id INT)
BEGIN
  -- Category-wise expense breakdown
  SELECT 
    `Category`,
    COUNT(`Expense_ID`) AS Transaction_Count,
    SUM(`Amount`) AS Total_Amount,
    MIN(`Expense_Date`) AS Earliest_Expense,
    MAX(`Expense_Date`) AS Latest_Expense
  FROM `EXPENSE`
  WHERE `Project_ID` = p_project_id
  GROUP BY `Category`;

  -- Total Material Inventory Valuation
  SELECT 
    COUNT(`Material_ID`) AS Total_Material_Types,
    SUM(`Total_Cost`) AS Inventory_Valuation
  FROM `MATERIAL`
  WHERE `Project_ID` = p_project_id;

  -- Active Resources by Type
  SELECT 
    `Type`,
    COUNT(`Resource_ID`) AS Resource_Count,
    SUM(`Quantity`) AS Total_Quantity
  FROM `RESOURCE`
  WHERE `Project_ID` = p_project_id
  GROUP BY `Type`;
END$$

DELIMITER ;
