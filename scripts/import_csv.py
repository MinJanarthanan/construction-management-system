#!/usr/bin/env python3
"""
BuildCorp – CSV Data Ingestion Pipeline
Ingests historical site inspection forms into MySQL database.
Handles 10,254 rows across 8 distinct construction projects.
"""

import os
import sys
import datetime
import pandas as pd
import mysql.connector
from mysql.connector import Error

CSV_FILE_PATHS = [
    os.path.join(os.path.dirname(__file__), "..", "data", "Construction_Data_PM_Forms_All_Projects.csv"),
    r"C:\Users\Janarthanan R\Downloads\Construction_Data_PM_Forms_All_Projects.csv\Construction_Data_PM_Forms_All_Projects.csv",
    r"C:\Users\Janarthanan R\Downloads\Construction_Data_PM_Forms_All_Projects.csv"
]

DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": int(os.environ.get("DB_PORT", 3306)),
    "user": os.environ.get("DB_USER", "root"),
    "password": os.environ.get("DB_PASS", ""),
    "database": os.environ.get("DB_NAME", "construction_db"),
    "charset": "utf8mb4"
}

def locate_csv():
    for path in CSV_FILE_PATHS:
        normalized = os.path.abspath(path)
        if os.path.isfile(normalized):
            return normalized
    raise FileNotFoundError("Could not locate Construction_Data_PM_Forms_All_Projects.csv")

def parse_date_safe(val):
    if pd.isna(val) or val is None or str(val).strip() == "":
        return None
    try:
        # Expected DD/MM/YYYY
        dt = pd.to_datetime(val, dayfirst=True)
        return dt.strftime("%Y-%m-%d")
    except Exception:
        return None

def parse_bool_safe(val):
    if pd.isna(val) or val is None:
        return None
    s = str(val).strip().lower()
    if s in ["true", "1", "yes", "t"]:
        return True
    if s in ["false", "0", "no", "f"]:
        return False
    return None

def run_import():
    csv_path = locate_csv()
    print("=" * 70)
    print("BUILDCORP – SITE FORMS ETL INGESTION PIPELINE")
    print("=" * 70)
    print(f"Reading dataset from: {csv_path}")

    df = pd.read_csv(csv_path, dtype=str)
    total_read = len(df)
    print(f"Total records read from CSV: {total_read}")

    # Expected column verification
    expected_cols = [
        "Ref", "Status", "Location", "Name", "Created", "Type", 
        "Status Changed", "Open Actions", "Total Actions", "Association", 
        "OverDue", "Images", "Comments", "Documents", "Project", 
        "Report Forms Status", "Report Forms Group"
    ]
    missing = [c for c in expected_cols if c not in df.columns]
    if missing:
        raise ValueError(f"CSV is missing expected columns: {missing}")

    # Establish MySQL connection
    print(f"Connecting to MySQL database '{DB_CONFIG['database']}' at {DB_CONFIG['host']}:{DB_CONFIG['port']}...")
    conn = mysql.connector.connect(**DB_CONFIG)
    conn.autocommit = False
    cursor = conn.cursor()

    try:
        # Step 1: Ensure Distinct Projects exist
        print("\n[Step 1/4] Upserting 8 distinct projects...")
        project_ids = sorted([int(p) for p in df["Project"].dropna().unique()])
        print(f"Found project IDs: {project_ids}")

        project_upsert_sql = """
        INSERT INTO `PROJECT` (`Project_ID`, `Project_Name`, `Description`, `Start_Date`, `End_Date`, `Status`)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE 
            `Project_Name` = VALUES(`Project_Name`),
            `Status` = VALUES(`Status`)
        """

        project_records = []
        for pid in project_ids:
            p_name = f"Project {pid}"
            desc = f"Commercial construction and infrastructure development under Project #{pid}"
            # Standard dates spanning historical records
            start_date = "2019-01-01"
            end_date = "2021-12-31"
            status = "In-Progress"
            project_records.append((pid, p_name, desc, start_date, end_date, status))

        cursor.executemany(project_upsert_sql, project_records)
        print(f"Successfully configured {len(project_records)} project records.")

        # Step 2: Upsert FORM_TYPE table
        print("\n[Step 2/4] Upserting FORM_TYPE records...")
        type_group_df = df[["Type", "Report Forms Group"]].drop_duplicates()

        form_type_sql = """
        INSERT INTO `FORM_TYPE` (`Type_Name`, `Report_Group`)
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE 
            `Report_Group` = COALESCE(VALUES(`Report_Group`), `Report_Group`)
        """

        type_records = []
        for _, row in type_group_df.iterrows():
            t_name = str(row["Type"]).strip() if pd.notna(row["Type"]) else None
            r_group = str(row["Report Forms Group"]).strip() if pd.notna(row["Report Forms Group"]) else None
            if t_name:
                type_records.append((t_name, r_group))

        cursor.executemany(form_type_sql, type_records)
        print(f"Processed {len(type_records)} form type mappings.")

        # Cache Type_Name -> Type_ID
        cursor.execute("SELECT `Type_Name`, `Type_ID` FROM `FORM_TYPE`")
        type_map = {row[0]: row[1] for row in cursor.fetchall()}

        # Step 3: Clear existing SITE_FORM records for idempotent execution
        print("\n[Step 3/4] Truncating SITE_FORM table for idempotent clean reload...")
        cursor.execute("DELETE FROM `SITE_FORM`")

        # Step 4: Prepare and batch insert SITE_FORM records
        print("\n[Step 4/4] Transforming and batch-inserting 10,254 SITE_FORM rows...")
        insert_site_form_sql = """
        INSERT INTO `SITE_FORM` (
            `Source_Ref`, `Project_ID`, `Type_ID`, `Form_Name`, `Form_Status`,
            `Status_Class`, `Location_Path`, `Created_Date`, `Status_Changed_Date`,
            `Open_Actions`, `Total_Actions`, `Association`, `Is_Overdue`,
            `Has_Images`, `Has_Comments`, `Has_Documents`
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        batch_size = 1000
        batch = []
        inserted_count = 0

        for idx, row in df.iterrows():
            source_ref = str(row["Ref"]).strip()
            project_id = int(row["Project"])
            
            raw_type = str(row["Type"]).strip() if pd.notna(row["Type"]) else None
            type_id = type_map.get(raw_type)

            form_name = str(row["Name"]).strip()[:200]
            form_status = str(row["Status"]).strip()[:80]
            
            # Status_Class: derive from Report Forms Status ('Open', 'Closed', or NULL)
            raw_rf_status = str(row["Report Forms Status"]).strip() if pd.notna(row["Report Forms Status"]) else None
            if raw_rf_status in ["Open", "Closed"]:
                status_class = raw_rf_status
            else:
                status_class = None

            location_path = str(row["Location"]).strip()[:255] if pd.notna(row["Location"]) else None
            created_date = parse_date_safe(row["Created"])
            status_changed_date = parse_date_safe(row["Status Changed"])

            try:
                open_actions = int(float(row["Open Actions"])) if pd.notna(row["Open Actions"]) else 0
            except (ValueError, TypeError):
                open_actions = 0

            try:
                total_actions = int(float(row["Total Actions"])) if pd.notna(row["Total Actions"]) else 0
            except (ValueError, TypeError):
                total_actions = 0

            assoc_raw = str(row["Association"]).strip().lower() if pd.notna(row["Association"]) else None
            association = assoc_raw if assoc_raw in ["parent", "child"] else None

            is_overdue = bool(parse_bool_safe(row["OverDue"])) if parse_bool_safe(row["OverDue"]) is not None else False
            has_images = bool(parse_bool_safe(row["Images"])) if parse_bool_safe(row["Images"]) is not None else False
            has_comments = bool(parse_bool_safe(row["Comments"])) if parse_bool_safe(row["Comments"]) is not None else False
            has_documents = parse_bool_safe(row["Documents"])

            batch.append((
                source_ref, project_id, type_id, form_name, form_status,
                status_class, location_path, created_date, status_changed_date,
                open_actions, total_actions, association, is_overdue,
                has_images, has_comments, has_documents
            ))

            if len(batch) >= batch_size:
                cursor.executemany(insert_site_form_sql, batch)
                inserted_count += len(batch)
                print(f"  Inserted {inserted_count:,} / {total_read:,} rows...")
                batch = []

        if batch:
            cursor.executemany(insert_site_form_sql, batch)
            inserted_count += len(batch)
            print(f"  Inserted {inserted_count:,} / {total_read:,} rows (Complete).")

        conn.commit()
        print("\nAll database operations committed successfully.")

        # ====================================================================
        # RECONCILIATION REPORT
        # ====================================================================
        print("\n" + "=" * 70)
        print("RECONCILIATION & DATA VALIDATION REPORT")
        print("=" * 70)
        
        cursor.execute("SELECT COUNT(*) FROM `SITE_FORM`")
        total_in_db = cursor.fetchone()[0]
        print(f"Rows Read:     {total_read:,}")
        print(f"Rows Inserted: {total_in_db:,}")
        assert total_read == total_in_db, f"Discrepancy: Read {total_read} != Inserted {total_in_db}"

        print("\nPer-Project Form Counts Verification:")
        cursor.execute("""
            SELECT `Project_ID`, COUNT(*) as FormCount
            FROM `SITE_FORM`
            GROUP BY `Project_ID`
            ORDER BY FormCount DESC
        """)
        db_project_counts = dict(cursor.fetchall())
        expected_counts = {
            1328: 4043,
            1330: 2149,
            1329: 1212,
            1335: 804,
            1340: 744,
            1338: 510,
            1343: 396,
            1345: 396
        }

        all_matched = True
        for pid, exp_cnt in expected_counts.items():
            act_cnt = db_project_counts.get(pid, 0)
            status = "MATCH" if act_cnt == exp_cnt else "MISMATCH"
            if act_cnt != exp_cnt:
                all_matched = False
            print(f"  Project {pid}: {act_cnt:>5} rows (Expected: {exp_cnt:>5}) -> [{status}]")

        print("\nStatus Class Distribution:")
        cursor.execute("""
            SELECT COALESCE(`Status_Class`, 'NULL') as SClass, COUNT(*) 
            FROM `SITE_FORM` 
            GROUP BY `Status_Class`
        """)
        for sclass, cnt in cursor.fetchall():
            print(f"  Status_Class '{sclass}': {cnt:,}")

        print("\nNull Counts Ingestion Audit:")
        cursor.execute("""
            SELECT 
                SUM(CASE WHEN `Association` IS NULL THEN 1 ELSE 0 END) as Null_Assoc,
                SUM(CASE WHEN `Has_Documents` IS NULL THEN 1 ELSE 0 END) as Null_Docs,
                SUM(CASE WHEN `Status_Class` IS NULL THEN 1 ELSE 0 END) as Null_StatusClass,
                SUM(CASE WHEN `Type_ID` IS NULL THEN 1 ELSE 0 END) as Null_TypeID
            FROM `SITE_FORM`
        """)
        null_audit = cursor.fetchone()
        print(f"  Association NULLs:   {null_audit[0]:>5} (Expected: ~8,156)")
        print(f"  Has_Documents NULLs: {null_audit[1]:>5} (Expected: 804)")
        print(f"  Status_Class NULLs:  {null_audit[2]:>5} (Expected: 2)")

        if all_matched and total_read == total_in_db:
            print("\n>> VERIFICATION RESULT: 100% PERFECT MATCH WITH BENCHMARK METRICS <<")
        else:
            print("\n>> WARNING: Discrepancy detected during validation <<")

    except Error as e:
        conn.rollback()
        print(f"\n[ERROR] Database transaction failed: {e}")
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    run_import()
