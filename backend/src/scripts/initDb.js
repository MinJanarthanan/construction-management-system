const bcrypt = require('bcryptjs');
const { getInitializedDb } = require('../config/database');
const {
  Role,
  User,
  Contractor,
  Project,
  Task,
  Milestone,
  Budget,
  Expense,
  Resource,
  Material,
  FormType,
  SiteForm,
  LowStockAlert
} = require('../models');

const seedDatabase = async () => {
  console.log('🚀 [InitDB] Initializing Database & Seeding Sample Data...');

  const db = await getInitializedDb();
  await db.sync({ force: true });
  console.log('✅ [InitDB] Tables synchronized successfully.');

  // 1. Roles
  const roles = await Role.bulkCreate([
    { Role_ID: 1, Role_Name: 'Admin', Description: 'Complete administrative, governance and report access across system' },
    { Role_ID: 2, Role_Name: 'Project Manager', Description: 'Oversees project delivery, budgets, task assignments and schedules' },
    { Role_ID: 3, Role_Name: 'Site Engineer', Description: 'Manages day-to-day site operations, forms, inspections and quality' },
    { Role_ID: 4, Role_Name: 'Accountant', Description: 'Manages financial records, budgets, cost auditing and fiscal reports' },
    { Role_ID: 5, Role_Name: 'Site Supervisor', Description: 'Field supervisor handling work crews, materials count and diary entries' }
  ]);
  console.log(`✅ [InitDB] Seeded ${roles.length} Roles.`);

  // 2. Users (Password: Demo@123)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Demo@123', salt);

  const users = await User.bulkCreate([
    { User_ID: 1, Username: 'alex.vance', Email: 'alex.vance@buildcorp.com', Password_Hash: passwordHash, Full_Name: 'Alex Vance', Role_ID: 1, Status: 'Active' },
    { User_ID: 2, Username: 'sarah.jenkins', Email: 'sarah.jenkins@buildcorp.com', Password_Hash: passwordHash, Full_Name: 'Sarah Jenkins', Role_ID: 2, Status: 'Active' },
    { User_ID: 3, Username: 'rajesh.patel', Email: 'rajesh.patel@buildcorp.com', Password_Hash: passwordHash, Full_Name: 'Rajesh Patel', Role_ID: 3, Status: 'Active' },
    { User_ID: 4, Username: 'elena.rostova', Email: 'elena.rostova@buildcorp.com', Password_Hash: passwordHash, Full_Name: 'Elena Rostova', Role_ID: 4, Status: 'Active' },
    { User_ID: 5, Username: 'marcus.brody', Email: 'marcus.brody@buildcorp.com', Password_Hash: passwordHash, Full_Name: 'Marcus Brody', Role_ID: 5, Status: 'Active' }
  ]);
  console.log(`✅ [InitDB] Seeded ${users.length} Users.`);

  // 3. Contractors
  const contractors = await Contractor.bulkCreate([
    { Contractor_ID: 1, Contractor_Name: 'Apex Civil Engineering Ltd', Phone: '+1-555-0192', Email: 'contact@apexcivil.com', Address: '452 Industrial Parkway, Sector 4' },
    { Contractor_ID: 2, Contractor_Name: 'Pinnacle Structural Works', Phone: '+1-555-0144', Email: 'contracts@pinnaclestruct.com', Address: '88 Commercial Boulevard, Suite 210' },
    { Contractor_ID: 3, Contractor_Name: 'BuildTech MEP Systems', Phone: '+1-555-0188', Email: 'tenders@buildtechmep.com', Address: '12 Innovation Way, Tech Park' },
    { Contractor_ID: 4, Contractor_Name: 'Horizon Concrete Solutions', Phone: '+1-555-0173', Email: 'info@horizonconcrete.com', Address: '709 Harbor Expressway, Bay Area' }
  ]);
  console.log(`✅ [InitDB] Seeded ${contractors.length} Contractors.`);

  // 4. Projects (The 8 real historical projects)
  const projects = await Project.bulkCreate([
    { Project_ID: 1328, Project_Name: 'Project 1328', Description: 'Metro Terminal Expansion - Heavy civil foundation', Start_Date: '2019-01-01', End_Date: '2021-12-31', Status: 'In-Progress', Manager_ID: 2, Contractor_ID: 1 },
    { Project_ID: 1330, Project_Name: 'Project 1330', Description: 'Skyline Commercial Center - 24-story core superstructure', Start_Date: '2019-01-01', End_Date: '2021-12-31', Status: 'In-Progress', Manager_ID: 2, Contractor_ID: 2 },
    { Project_ID: 1329, Project_Name: 'Project 1329', Description: 'Riverside Logistics Hub - High-cube distribution warehouse', Start_Date: '2019-01-01', End_Date: '2021-12-31', Status: 'In-Progress', Manager_ID: 3, Contractor_ID: 3 },
    { Project_ID: 1335, Project_Name: 'Project 1335', Description: 'Oakridge Residential Towers - Multi-phase concrete pouring', Start_Date: '2019-01-01', End_Date: '2021-12-31', Status: 'In-Progress', Manager_ID: 2, Contractor_ID: 4 },
    { Project_ID: 1340, Project_Name: 'Project 1340', Description: 'Harbor Point Viaduct - Elevated bridge segment', Start_Date: '2019-01-01', End_Date: '2021-12-31', Status: 'In-Progress', Manager_ID: 3, Contractor_ID: 1 },
    { Project_ID: 1338, Project_Name: 'Project 1338', Description: 'West End Medical Complex - Specialized MEP fitouts', Start_Date: '2019-01-01', End_Date: '2021-12-31', Status: 'In-Progress', Manager_ID: 5, Contractor_ID: 2 },
    { Project_ID: 1343, Project_Name: 'Project 1343', Description: 'Tech Valley Innovation Campus - LEED Platinum lab facility', Start_Date: '2019-01-01', End_Date: '2021-12-31', Status: 'In-Progress', Manager_ID: 2, Contractor_ID: 3 },
    { Project_ID: 1345, Project_Name: 'Project 1345', Description: 'Southwest Industrial Park - Subgrade excavation', Start_Date: '2019-01-01', End_Date: '2021-12-31', Status: 'In-Progress', Manager_ID: 3, Contractor_ID: 4 }
  ]);
  console.log(`✅ [InitDB] Seeded ${projects.length} Projects.`);

  // 5. Budgets
  const budgets = await Budget.bulkCreate([
    { Budget_ID: 1, Project_ID: 1328, Total_Budget: 4500000.00, Approved_Budget: 4200000.00, Created_Date: '2019-01-10', Remarks: 'Primary municipal infrastructure grant' },
    { Budget_ID: 2, Project_ID: 1330, Total_Budget: 3800000.00, Approved_Budget: 3600000.00, Created_Date: '2019-02-15', Remarks: 'Phase 1 commercial capital allocation' },
    { Budget_ID: 3, Project_ID: 1329, Total_Budget: 2900000.00, Approved_Budget: 2750000.00, Created_Date: '2019-03-01', Remarks: 'Private logistics developer financed budget' },
    { Budget_ID: 4, Project_ID: 1335, Total_Budget: 3200000.00, Approved_Budget: 3000000.00, Created_Date: '2019-04-12', Remarks: 'Joint-venture residential financing package' },
    { Budget_ID: 5, Project_ID: 1340, Total_Budget: 2100000.00, Approved_Budget: 2000000.00, Created_Date: '2019-05-20', Remarks: 'Civil transportation authority allocation' },
    { Budget_ID: 6, Project_ID: 1338, Total_Budget: 1950000.00, Approved_Budget: 1850000.00, Created_Date: '2019-06-05', Remarks: 'Healthcare trust approved capital budget' },
    { Budget_ID: 7, Project_ID: 1343, Total_Budget: 2400000.00, Approved_Budget: 2250000.00, Created_Date: '2019-07-01', Remarks: 'Cleanroom and green building technology grant' },
    { Budget_ID: 8, Project_ID: 1345, Total_Budget: 1750000.00, Approved_Budget: 1600000.00, Created_Date: '2019-08-18', Remarks: 'Industrial zone infrastructure funding' }
  ]);
  console.log(`✅ [InitDB] Seeded ${budgets.length} Budgets.`);

  // 6. Expenses
  const expenses = await Expense.bulkCreate([
    { Expense_ID: 1, Project_ID: 1328, Category: 'Labor', Amount: 950000.00, Expense_Date: '2019-06-15', Description: 'Piling labor contract' },
    { Expense_ID: 2, Project_ID: 1328, Category: 'Material', Amount: 1100000.00, Expense_Date: '2019-07-20', Description: 'Grade 60 steel rebars' },
    { Expense_ID: 3, Project_ID: 1328, Category: 'Equipment', Amount: 620000.00, Expense_Date: '2019-08-10', Description: 'Tower crane monthly lease' },
    { Expense_ID: 4, Project_ID: 1330, Category: 'Labor', Amount: 820000.00, Expense_Date: '2019-08-01', Description: 'Formwork carpenting crew' },
    { Expense_ID: 5, Project_ID: 1330, Category: 'Material', Amount: 980000.00, Expense_Date: '2019-09-12', Description: 'Ready-mix concrete C40' }
  ]);
  console.log(`✅ [InitDB] Seeded ${expenses.length} Expenses.`);

  // 7. Tasks
  const tasks = await Task.bulkCreate([
    { Task_ID: 1, Project_ID: 1328, Assigned_To: 2, Task_Name: 'Substructure Bored Piling', Start_Date: '2019-02-01', Due_Date: '2019-04-15', Status: 'Done' },
    { Task_ID: 2, Project_ID: 1328, Assigned_To: 3, Task_Name: 'Ground Floor Structural Deck', Start_Date: '2019-08-01', Due_Date: '2019-10-15', Status: 'In-Progress' },
    { Task_ID: 3, Project_ID: 1328, Assigned_To: 5, Task_Name: 'Perimeter Dewatering Wellpoint', Start_Date: '2019-09-01', Due_Date: '2019-11-30', Status: 'Blocked' },
    { Task_ID: 4, Project_ID: 1330, Assigned_To: 3, Task_Name: 'Tower Core Slipform Assembly', Start_Date: '2019-03-01', Due_Date: '2019-05-20', Status: 'Done' },
    { Task_ID: 5, Project_ID: 1330, Assigned_To: 5, Task_Name: 'Fire Suppression Risers Pressure Testing', Start_Date: '2019-10-01', Due_Date: '2019-12-15', Status: 'Open' }
  ]);
  console.log(`✅ [InitDB] Seeded ${tasks.length} Tasks.`);

  // 8. Milestones
  const milestones = await Milestone.bulkCreate([
    { Milestone_ID: 1, Project_ID: 1328, Milestone_Name: 'Foundation Substructure Sign-off', Description: 'Civil sign-off', Due_Date: '2019-05-15', Status: 'Achieved' },
    { Milestone_ID: 2, Project_ID: 1328, Milestone_Name: 'Mid-Rise Structural Topping Out', Description: 'Floor 15 topped out', Due_Date: '2019-12-15', Status: 'Delayed' },
    { Milestone_ID: 3, Project_ID: 1330, Milestone_Name: 'Exterior Curtain Wall Completion', Description: 'Double-glazed facade', Due_Date: '2020-04-15', Status: 'Pending' }
  ]);
  console.log(`✅ [InitDB] Seeded ${milestones.length} Milestones.`);

  // 9. Materials
  const materials = await Material.bulkCreate([
    { Material_ID: 1, Project_ID: 1328, Material_Name: 'OPC 53 Grade Portland Cement', Quantity: 1500.00, Unit: 'Bags', Unit_Cost: 8.50, Total_Cost: 12750.00, Reorder_Level: 200 },
    { Material_ID: 2, Project_ID: 1328, Material_Name: 'Hydraulic Bentonite Slurry', Quantity: 6.00, Unit: 'Barrels', Unit_Cost: 185.00, Total_Cost: 1110.00, Reorder_Level: 15 },
    { Material_ID: 3, Project_ID: 1330, Material_Name: 'Anchor Bolts M24 High-Tensile', Quantity: 12.00, Unit: 'Boxes', Unit_Cost: 95.00, Total_Cost: 1140.00, Reorder_Level: 40 }
  ]);
  console.log(`✅ [InitDB] Seeded ${materials.length} Materials.`);

  console.log('🎉 [InitDB] Database initialization & seeding completed successfully!');
};

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ [InitDB] Error initializing database:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
