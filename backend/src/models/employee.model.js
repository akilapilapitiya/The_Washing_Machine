const createEmployeeTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS employee (
      empid SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(first_name)) > 0),
      last_name VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(last_name)) > 0),
      name_with_initials VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(name_with_initials)) > 0),
      email VARCHAR(100) UNIQUE NOT NULL
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
      emptel VARCHAR(10) NOT NULL
        CHECK (emptel ~ '^[0-9]{10}$'),
      emptype VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(emptype)) > 0),
      roleid INT REFERENCES role(roleid),
      empnic VARCHAR(12) UNIQUE NOT NULL
        CHECK (empnic ~ '^[0-9]{9}[Vv]$|^[0-9]{12}$'),
      address_number VARCHAR(20),
      address_line1 VARCHAR(100),
      address_line2 VARCHAR(100),
      dob DATE,
      speciality VARCHAR(100),
      profile_picture_url TEXT,
      password_hash VARCHAR(255) NOT NULL,
      telegram_chat_id VARCHAR(50) UNIQUE,
      telegram_connected_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Migration: Handle legacy empname removal and new field additions
    DO $$ 
    BEGIN 
      -- Add new columns if they don't exist
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employee' AND column_name='first_name') THEN
        ALTER TABLE employee ADD COLUMN first_name VARCHAR(100) DEFAULT 'Temp';
        ALTER TABLE employee ADD COLUMN last_name VARCHAR(100) DEFAULT 'Temp';
        ALTER TABLE employee ADD COLUMN name_with_initials VARCHAR(100) DEFAULT 'Temp';
        ALTER TABLE employee ADD COLUMN address_number VARCHAR(20);
        ALTER TABLE employee ADD COLUMN address_line1 VARCHAR(100);
        ALTER TABLE employee ADD COLUMN address_line2 VARCHAR(100);
        ALTER TABLE employee ADD COLUMN dob DATE;
        ALTER TABLE employee ADD COLUMN speciality VARCHAR(100);
        ALTER TABLE employee ADD COLUMN profile_picture_url TEXT;

        -- Attempt to split legacy empname into first/last if possible
        UPDATE employee SET 
          first_name = split_part(empname, ' ', 1),
          last_name = CASE 
            WHEN position(' ' in empname) > 0 THEN substring(empname from position(' ' in empname) + 1)
            ELSE 'Employee'
          END,
          name_with_initials = empname;
      END IF;

      -- Add Telegram columns independently
      ALTER TABLE employee ADD COLUMN IF NOT EXISTS telegram_chat_id VARCHAR(50) UNIQUE;
      ALTER TABLE employee ADD COLUMN IF NOT EXISTS telegram_connected_at TIMESTAMP;

      -- Remove NOT NULL constraints after split if needed (already set in table creation but added for migration)
      ALTER TABLE employee ALTER COLUMN first_name SET NOT NULL;
      ALTER TABLE employee ALTER COLUMN last_name SET NOT NULL;
      ALTER TABLE employee ALTER COLUMN name_with_initials SET NOT NULL;

      -- Remove legacy empname column
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employee' AND column_name='empname') THEN
        ALTER TABLE employee DROP COLUMN empname;
      END IF;
    END $$;

    -- Update owner seed if exists
    UPDATE employee SET 
      first_name = 'Ridma',
      last_name = 'Jayasinghe',
      name_with_initials = 'R. Jayasinghe',
      address_number = '100',
      address_line1 = 'Pannipitiya Road',
      address_line2 = 'Maharagama',
      dob = '1990-11-29',
      speciality = 'System Management'
    WHERE email = 'owner@washingmachine.com';

    -- Add roleid migration logic (keep existing)
    ALTER TABLE employee ADD COLUMN IF NOT EXISTS roleid INT REFERENCES role(roleid);

    -- Assign default roles based on legacy emptype
    UPDATE employee SET roleid = (SELECT roleid FROM role WHERE rolename = 'owner') WHERE emptype IN ('owner', 'manager') AND roleid IS NULL;
    UPDATE employee SET roleid = (SELECT roleid FROM role WHERE rolename = 'cashier') WHERE emptype = 'cashier' AND roleid IS NULL;
    UPDATE employee SET roleid = (SELECT roleid FROM role WHERE rolename = 'employee') WHERE roleid IS NULL;

    CREATE INDEX IF NOT EXISTS idx_employee_email ON employee(email);
    CREATE INDEX IF NOT EXISTS idx_employee_nic ON employee(empnic);
    CREATE INDEX IF NOT EXISTS idx_employee_type ON employee(emptype);
  `;

  await pool.query(queryText);
};

export default createEmployeeTable;
