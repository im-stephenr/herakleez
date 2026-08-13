import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";

const sqlite = new SQLiteConnection(CapacitorSQLite);

let db;

export async function initDB() {
  console.log("initDB called");
  try {
    // Check connection consistency (important for Live Reload)
    await sqlite.checkConnectionsConsistency();

    // Check if connection already exists
    const isConnection = await sqlite.isConnection("herakleez_app_db", false);
    if (isConnection.result) {
      console.log("Retrieving existing connection...");
      db = await sqlite.retrieveConnection("herakleez_app_db", false);
    } else {
      console.log("Creating new connection...");
      // Create connection
      db = await sqlite.createConnection(
        "herakleez_app_db",
        false,
        "no-encryption",
        4,
        false,
      );
    }

    // Open database
    // Open if not already open
    if (!(await db.isDBOpen()).result) {
      await db.open();
    }

    // Create tables

    // exercises table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        image_path TEXT,
        body_part_id INTEGER
      );
    `);

    // body parts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS body_parts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        image_path TEXT
      );
    `);

    // workouts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        duration TEXT,
        start_time TEXT,
        end_time TEXT,
        calories INTEGER
      );
    `);

    // workout_exercises table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS workout_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER,
        exercise_id INTEGER,
        sets INTEGER,
        reps INTEGER,
        max_weight INTEGER
      );
    `);

    // profile table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT,
        last_name TEXT,
        age INTEGER,
        height INTEGER,
        weight INTEGER,
        email_address TEXT
      );
    `);

    // Weight table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS weights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        weight INTEGER,
        date DATE
      );
    `);

    // Muscle Progress Photos
    await db.execute(`CREATE TABLE IF NOT EXISTS muscle_progress_photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            photo TEXT NOT NULL,
            date_added TEXT NOT NULL
        );`);

    // Check if body_parts has any data
    const check_body_parts = await db.query(
      "SELECT COUNT(*) AS total FROM body_parts",
    );

    if (check_body_parts.values[0].total === 0) {
      await db.execute(`
                INSERT INTO body_parts (id, name, image_path) VALUES
                  (1, 'chest', 'chest.jpg'),
                  (2, 'triceps', 'triceps.jpg'),
                  (3, 'back', 'back.jpg'),
                  (4, 'biceps', 'biceps.jpg'),
                  (5, 'shoulders', 'shoulders.jpg'),
                  (6, 'legs', 'legs.jpg'),
                  (7, 'core', 'core.jpg');
              `);
    }

    // Check if body_parts has any data
    const check_exercises = await db.query(
      "SELECT COUNT(*) AS total FROM exercises",
    );

    if (check_exercises.values[0].total === 0) {
      await db.execute(`
    INSERT INTO exercises (id, title, image_path, body_part_id) VALUES
      (107, 'Band Alternate Low Chest Fly', 'Band Alternate Low Chest Fly', 1),
      (108, 'Band Chest Fly', 'Band Chest Fly', 1),
      (109, 'Band high fly', 'Band high fly', 1),
      (110, 'Barbell Bench Press', 'Barbell Bench Press', 1),
      (111, 'Barbell Decline Bench Press', 'Barbell Decline Bench Press', 1),
      (112, 'Barbell Incline Bench Press', 'Barbell Incline Bench Press', 1),
      (113, 'Dumbbell Bench Press', 'Dumbbell Bench Press', 1),
      (114, 'Dumbbell Decline Bench Press', 'Dumbbell Decline Bench Press', 1),
      (115, 'Dumbbell Decline Fly', 'Dumbbell Decline Fly', 1),
      (116, 'Dumbbell Decline Hammer Press', 'Dumbbell Decline Hammer Press', 1),
      (117, 'Dumbbell Decline Twist Fly', 'Dumbbell Decline Twist Fly', 1),
      (118, 'Dumbbell Fly', 'Dumbbell Fly', 1),
      (119, 'Dumbbell Incline Alternate Press', 'Dumbbell Incline Alternate Press', 1),
      (120, 'Dumbbell Incline Bench Press', 'Dumbbell Incline Bench Press', 1),
      (121, 'Dumbbell Incline Fly', 'Dumbbell Incline Fly', 1),
      (122, 'Dumbbell Incline Low Fly', 'Dumbbell Incline Low Fly', 1),
      (123, 'Dumbbell Incline Twist Press', 'Dumbbell Incline Twist Press', 1),
      (124, 'Dumbbell Incline Twisted Flyes', 'Dumbbell Incline Twisted Flyes', 1),
      (125, 'Dumbbell Low Fly', 'Dumbbell Low Fly', 1),
      (126, 'Dumbbell Lying Hammer Press', 'Dumbbell Lying Hammer Press', 1),
      (127, 'Dumbbell Straight Arm Pullover', 'Dumbbell Straight Arm Pullover', 1),
      (128, 'Dumbbell Svend Press', 'Dumbbell Svend Press', 1),
      (129, 'Dumbbell Twisted Fly', 'Dumbbell Twisted Fly', 1),
      (130, 'Hyght Dumbbell Fly', 'Hyght Dumbbell Fly', 1),
      (131, 'Barbell Incline Triceps Extension Skull Crusher', 'Barbell Incline Triceps Extension Skull Crusher', 2),
      (132, 'Barbell Seated Close grip Behind Neck Triceps Extension', 'Barbell Seated Close grip Behind Neck Triceps Extension', 2),
      (133, 'Barbell Seated Overhead Triceps Extension', 'Barbell Seated Overhead Triceps Extension', 2),
      (134, 'Barbell Lying Triceps Extension', 'Barbell Lying Triceps Extension', 2),
      (135, 'Barbell Lying Triceps Extension Skull Crusher', 'Barbell Lying Triceps Extension Skull Crusher', 2),
      (136, 'Barbell Lying Close grip Triceps Extension', 'Barbell Lying Close grip Triceps Extension', 2),
      (137, 'Triceps Dip', 'Triceps Dip', 2),
      (138, 'Cable High Pulley Straight Bar Overhead Triceps Extension', 'Cable High Pulley Straight Bar Overhead Triceps Extension', 2),
      (139, 'Cable Overhead Single Arm Triceps Extension', 'Cable Overhead Single Arm Triceps Extension', 2),
      (140, 'Cable Triceps Pushdown (V bar)', 'Cable Triceps Pushdown (V bar)', 2),
      (141, 'Cable Standing High Cross Triceps Extension', 'Cable Standing High Cross Triceps Extension', 2),
      (142, 'Cable Reverse Grip Triceps Pushdown', 'Cable Reverse Grip Triceps Pushdown', 2),
      (143, 'Cable Triceps Pushdown', 'Cable Triceps Pushdown', 2),
      (144, 'Cable One Arm Side Triceps Pushdown', 'Cable One Arm Side Triceps Pushdown', 2),
      (145, 'Cable Overhead Triceps Extension (rope)', 'Cable Overhead Triceps Extension (rope)', 2),
      (146, 'Cable Alternate Triceps Extension', 'Cable Alternate Triceps Extension', 2),
      (147, 'Dumbbell Seated Single Arm Overhead Triceps Extension', 'Dumbbell Seated Single Arm Overhead Triceps Extension', 2),
      (148, 'Dumbbell Seated Triceps Extension', 'Dumbbell Seated Triceps Extension', 2),
      (149, 'Dumbbell Seated Bent Over Triceps Extension', 'Dumbbell Seated Bent Over Triceps Extension', 2),
      (150, 'Dumbbell Lying Triceps Extension', 'Dumbbell Lying Triceps Extension', 2),
      (151, 'Dumbbell Incline Triceps Extension', 'Dumbbell Incline Triceps Extension', 2),
      (152, 'Dumbbell Lying One Arm Supinated Triceps Extension', 'Dumbbell Lying One Arm Supinated Triceps Extension', 2),
      (153, 'Dumbbell Lying One Arm Pronated Triceps Extension', 'Dumbbell Lying One Arm Pronated Triceps Extension', 2),
      (154, 'Barbell Back Wide Shrug', 'Barbell Back Wide Shrug', 3),
      (155, 'Barbell Wide Shrug', 'Barbell Wide Shrug', 3),
      (156, 'Barbell Seated Shrug', 'Barbell Seated Shrug', 3),
      (157, 'Barbell Pendlay Row', 'Barbell Pendlay Row', 3),
      (158, 'Barbell Bent Over Row', 'Barbell Bent Over Row', 3),
      (159, 'Wide Chin-up', 'Wide Chin-up', 3),
      (160, 'Bent Arms Chin-up', 'Bent Arms Chin-up', 3),
      (161, 'Close Grip Pull-Up', 'Close Grip Pull-Up', 3),
      (162, 'Wide Grip Pull Up on Dip Cage', 'Wide Grip Pull Up on Dip Cage', 3),
      (163, 'Hammer Grip Pull up on Dip Cage', 'Hammer Grip Pull up on Dip Cage', 3),
      (164, 'Shoulder Grip Pull-up', 'Shoulder Grip Pull-up', 3),
      (165, 'Wide Grip Pull Up', 'Wide Grip Pull Up', 3),
      (166, 'Chin Up', 'Chin Up', 3),
      (167, 'Close Grip Chin Up', 'Close Grip Chin Up', 3),
      (168, 'Cable Reverse Narrow grip Lat Pulldown', 'Cable Reverse Narrow grip Lat Pulldown', 3),
      (169, 'Cable Seated Single Arm Lats', 'Cable Seated Single Arm Lats', 3),
      (170, 'Cable Straight Arm Pulldown (rope)', 'Cable Straight Arm Pulldown (rope)', 3),
      (171, 'Cable Lateral Pulldown with V-bar', 'Cable Lateral Pulldown with V-bar', 3),
      (172, 'Cable Close Grip Front Lat Pulldown', 'Cable Close Grip Front Lat Pulldown', 3),
      (173, 'Cable Straight Arm Pulldown', 'Cable Straight Arm Pulldown', 3),
      (174, 'Cable Seated High Row (V bar)', 'Cable Seated High Row (V bar)', 3),
      (175, 'Cable Reverse grip Straight Back Seated High Row', 'Cable Reverse grip Straight Back Seated High Row', 3),
      (176, 'Cable Pulldown', 'Cable Pulldown', 3),
      (177, 'Cable Wide Pulldown', 'Cable Wide Pulldown', 3),
      (178, 'Cable Bar Lateral Pulldown', 'Cable Bar Lateral Pulldown', 3),
      (179, 'Dumbbell Kroc Row', 'Dumbbell Kroc Row', 3),
      (180, 'EZ Bar Reverse Grip Bent Over Row', 'EZ Bar Reverse Grip Bent Over Row', 3),
      (181, 'Barbell Standing Wide-Grip Biceps Curl', 'Barbell Standing Wide-Grip Biceps Curl', 4),
      (182, 'Barbell Biceps Curl', 'Barbell Biceps Curl', 4),
      (183, 'Cable Standing Biceps Curl (rope)', 'Cable Standing Biceps Curl (rope)', 4),
      (184, 'Dumbbell Waiter Biceps Curl', 'Dumbbell Waiter Biceps Curl', 4),
      (185, 'Dumbbell Seated Reverse Grip Biceps Curl', 'Dumbbell Seated Reverse Grip Biceps Curl', 4),
      (186, 'Dumbbell Alternate Biceps Curl', 'Dumbbell Alternate Biceps Curl', 4),
      (187, 'Dumbbell Biceps Curl', 'Dumbbell Biceps Curl', 4),
      (188, 'Dumbbell Standing Inner Biceps Curl', 'Dumbbell Standing Inner Biceps Curl', 4),
      (189, 'Dumbbell Standing Biceps Curl', 'Dumbbell Standing Biceps Curl', 4),
      (190, 'EZ-Barbell Standing Wide Grip Biceps Curl', 'EZ-Barbell Standing Wide Grip Biceps Curl', 4),
      (191, 'EZ-bar Biceps Curl', 'EZ-bar Biceps Curl', 4),
      (192, 'Barbell Hang Clean High Pull', 'Barbell Hang Clean High Pull', 5),
      (193, 'Barbell Standing Shoulder Pin Press', 'Barbell Standing Shoulder Pin Press', 5),
      (194, 'Barbell Standing Shoulders Press', 'Barbell Standing Shoulders Press', 5),
      (195, 'Barbell Upright Row', 'Barbell Upright Row', 5),
      (196, 'Cable 45 degrees Reverse Grip Reverse Fly', 'Cable 45 degrees Reverse Grip Reverse Fly', 5),
      (197, 'Cable Single Arm Lateral Raise', 'Cable Single Arm Lateral Raise', 5),
      (198, 'Cable Standing Supinated Face Pull', 'Cable Standing Supinated Face Pull', 5),
      (199, 'Cable Leaning Lateral Raise', 'Cable Leaning Lateral Raise', 5),
      (200, 'Cable One Arm Lateral Raise', 'Cable One Arm Lateral Raise', 5),
      (201, 'Dumbbell Seated Single Arm Front Raise', 'Dumbbell Seated Single Arm Front Raise', 5),
      (202, 'Dumbbell Standing Bent Arm Lateral raise', 'Dumbbell Standing Bent Arm Lateral raise', 5),
      (203, 'Dumbbell Incline Shoulders Press', 'Dumbbell Incline Shoulders Press', 5),
      (204, 'Dumbbell Seated Lateral to Front Raise', 'Dumbbell Seated Lateral to Front Raise', 5),
      (205, 'Dumbbell Seated Bent Arm Lateral raise', 'Dumbbell Seated Bent Arm Lateral raise', 5),
      (206, 'Dumbbell Arnold Press', 'Dumbbell Arnold Press', 5),
      (207, 'Dumbbell Standing Alternate Vertical Front Raises', 'Dumbbell Standing Alternate Vertical Front Raises', 5),
      (208, 'Dumbbell Seated Shoulder Press', 'Dumbbell Seated Shoulder Press', 5),
      (209, 'Dumbbell Seated Front Raise', 'Dumbbell Seated Front Raise', 5),
      (210, 'Lever Seated Reverse Fly', 'Lever Seated Reverse Fly', 5),
      (211, 'Weighted Front Raise Hold', 'Weighted Front Raise Hold', 5),
      (212, 'Lever Seated Calf Raise', 'Lever Seated Calf Raise', 6),
      (213, 'Barbell Deadlift', 'Barbell Deadlift', 6),
      (214, 'Barbell Hip Thrust', 'Barbell Hip Thrust', 6),
      (215, 'Barbell Split Squat', 'Barbell Split Squat', 6),
      (216, 'Dumbbell Bar Grip Sumo Squat', 'Dumbbell Bar Grip Sumo Squat', 6),
      (217, 'Sled Glute Dominant Leg Press', 'Sled Glute Dominant Leg Press', 6),
      (218, 'Barbell Anderson Squat', 'Barbell Anderson Squat', 6),
      (219, 'Barbell Full Squat', 'Barbell Full Squat', 6),
      (220, 'Dumbbell Split Squat', 'Dumbbell Split Squat', 6),
      (221, 'Lever Leg Extension', 'Lever Leg Extension', 6),
      (222, 'Lever Lying Leg Curl', 'Lever Lying Leg Curl', 6),
      (223, 'Sled Full Hack Squat', 'Sled Full Hack Squat', 6);
  `);
    }

    return true;
  } catch (err) {
    console.error("DB init error:", err);
    return false;
  }
}

export function getDB() {
  if (!db) throw new Error("Database not initialized!");
  return db;
}
