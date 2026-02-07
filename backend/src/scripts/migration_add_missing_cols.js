import pool from "../configs/database.js";

const migrate = async () => {
  try {
    console.log("Checking sys_settings table...");

    // Add updated_at column if missing
    await pool.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sys_settings' AND column_name='updated_at') THEN
          ALTER TABLE sys_settings ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
          RAISE NOTICE 'Added updated_at column to sys_settings';
        END IF;
      END $$;
    `);

    // Add created_at column if missing (good practice)
    await pool.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sys_settings' AND column_name='created_at') THEN
          ALTER TABLE sys_settings ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
          RAISE NOTICE 'Added created_at column to sys_settings';
        END IF;
      END $$;
    `);

    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit();
  }
};

migrate();
