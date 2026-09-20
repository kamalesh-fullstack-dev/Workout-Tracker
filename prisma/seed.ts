import "dotenv/config";
import { db } from "../src/lib/db";

type SeedExercise = {
  name: string;
  category: "STRENGTH" | "CARDIO" | "MOBILITY" | "PLYOMETRIC" | "OTHER";
  muscleGroups: (
    | "CHEST"
    | "BACK"
    | "SHOULDERS"
    | "BICEPS"
    | "TRICEPS"
    | "FOREARMS"
    | "QUADS"
    | "HAMSTRINGS"
    | "GLUTES"
    | "CALVES"
    | "CORE"
    | "FULL_BODY"
    | "CARDIO"
  )[];
  equipment:
    | "BARBELL"
    | "DUMBBELL"
    | "MACHINE"
    | "CABLE"
    | "BODYWEIGHT"
    | "KETTLEBELL"
    | "BAND"
    | "OTHER";
  trackingType: "WEIGHT_REPS" | "BODYWEIGHT_REPS" | "TIME" | "DISTANCE";
};

const exercises: SeedExercise[] = [
  // Chest
  { name: "Barbell Bench Press", category: "STRENGTH", muscleGroups: ["CHEST", "TRICEPS"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Incline Barbell Bench Press", category: "STRENGTH", muscleGroups: ["CHEST", "SHOULDERS"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Bench Press", category: "STRENGTH", muscleGroups: ["CHEST", "TRICEPS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Incline Dumbbell Bench Press", category: "STRENGTH", muscleGroups: ["CHEST", "SHOULDERS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Fly", category: "STRENGTH", muscleGroups: ["CHEST"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Cable Fly", category: "STRENGTH", muscleGroups: ["CHEST"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Push-Up", category: "STRENGTH", muscleGroups: ["CHEST", "TRICEPS"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Chest Dip", category: "STRENGTH", muscleGroups: ["CHEST", "TRICEPS"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Machine Chest Press", category: "STRENGTH", muscleGroups: ["CHEST", "TRICEPS"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Pec Deck Machine", category: "STRENGTH", muscleGroups: ["CHEST"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },

  // Back
  { name: "Deadlift", category: "STRENGTH", muscleGroups: ["BACK", "HAMSTRINGS", "GLUTES"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Barbell Row", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Pull-Up", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Chin-Up", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Lat Pulldown", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Seated Cable Row", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Row", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "T-Bar Row", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Machine Row", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Face Pull", category: "STRENGTH", muscleGroups: ["BACK", "SHOULDERS"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },

  // Shoulders
  { name: "Overhead Press", category: "STRENGTH", muscleGroups: ["SHOULDERS", "TRICEPS"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Shoulder Press", category: "STRENGTH", muscleGroups: ["SHOULDERS", "TRICEPS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Arnold Press", category: "STRENGTH", muscleGroups: ["SHOULDERS", "TRICEPS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Lateral Raise", category: "STRENGTH", muscleGroups: ["SHOULDERS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Front Raise", category: "STRENGTH", muscleGroups: ["SHOULDERS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Rear Delt Fly", category: "STRENGTH", muscleGroups: ["SHOULDERS", "BACK"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Cable Lateral Raise", category: "STRENGTH", muscleGroups: ["SHOULDERS"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Machine Shoulder Press", category: "STRENGTH", muscleGroups: ["SHOULDERS", "TRICEPS"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Barbell Upright Row", category: "STRENGTH", muscleGroups: ["SHOULDERS", "BACK"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Barbell Shrug", category: "STRENGTH", muscleGroups: ["SHOULDERS", "BACK"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },

  // Biceps
  { name: "Barbell Curl", category: "STRENGTH", muscleGroups: ["BICEPS"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Curl", category: "STRENGTH", muscleGroups: ["BICEPS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Hammer Curl", category: "STRENGTH", muscleGroups: ["BICEPS", "FOREARMS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Preacher Curl", category: "STRENGTH", muscleGroups: ["BICEPS"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Cable Curl", category: "STRENGTH", muscleGroups: ["BICEPS"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Concentration Curl", category: "STRENGTH", muscleGroups: ["BICEPS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "EZ Bar Curl", category: "STRENGTH", muscleGroups: ["BICEPS"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },

  // Triceps
  { name: "Close-Grip Bench Press", category: "STRENGTH", muscleGroups: ["TRICEPS", "CHEST"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Tricep Pushdown", category: "STRENGTH", muscleGroups: ["TRICEPS"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Overhead Tricep Extension", category: "STRENGTH", muscleGroups: ["TRICEPS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Skull Crushers", category: "STRENGTH", muscleGroups: ["TRICEPS"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Tricep Dip", category: "STRENGTH", muscleGroups: ["TRICEPS", "CHEST"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Tricep Kickback", category: "STRENGTH", muscleGroups: ["TRICEPS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },

  // Forearms
  { name: "Barbell Wrist Curl", category: "STRENGTH", muscleGroups: ["FOREARMS"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Barbell Reverse Curl", category: "STRENGTH", muscleGroups: ["FOREARMS", "BICEPS"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Farmer's Carry", category: "STRENGTH", muscleGroups: ["FOREARMS", "FULL_BODY"], equipment: "DUMBBELL", trackingType: "TIME" },

  // Quads
  { name: "Back Squat", category: "STRENGTH", muscleGroups: ["QUADS", "GLUTES"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Front Squat", category: "STRENGTH", muscleGroups: ["QUADS", "GLUTES"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Leg Press", category: "STRENGTH", muscleGroups: ["QUADS", "GLUTES"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Leg Extension", category: "STRENGTH", muscleGroups: ["QUADS"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Walking Lunge", category: "STRENGTH", muscleGroups: ["QUADS", "GLUTES"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Bulgarian Split Squat", category: "STRENGTH", muscleGroups: ["QUADS", "GLUTES"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Goblet Squat", category: "STRENGTH", muscleGroups: ["QUADS", "GLUTES"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Hack Squat", category: "STRENGTH", muscleGroups: ["QUADS", "GLUTES"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },

  // Hamstrings
  { name: "Romanian Deadlift", category: "STRENGTH", muscleGroups: ["HAMSTRINGS", "GLUTES"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Lying Leg Curl", category: "STRENGTH", muscleGroups: ["HAMSTRINGS"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Good Morning", category: "STRENGTH", muscleGroups: ["HAMSTRINGS", "BACK"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Nordic Curl", category: "STRENGTH", muscleGroups: ["HAMSTRINGS"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },

  // Glutes
  { name: "Barbell Hip Thrust", category: "STRENGTH", muscleGroups: ["GLUTES", "HAMSTRINGS"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Glute Bridge", category: "STRENGTH", muscleGroups: ["GLUTES"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Cable Glute Kickback", category: "STRENGTH", muscleGroups: ["GLUTES"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Step-Up", category: "STRENGTH", muscleGroups: ["GLUTES", "QUADS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },

  // Calves
  { name: "Standing Calf Raise", category: "STRENGTH", muscleGroups: ["CALVES"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Seated Calf Raise", category: "STRENGTH", muscleGroups: ["CALVES"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Bodyweight Calf Raise", category: "STRENGTH", muscleGroups: ["CALVES"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },

  // Core
  { name: "Plank", category: "STRENGTH", muscleGroups: ["CORE"], equipment: "BODYWEIGHT", trackingType: "TIME" },
  { name: "Side Plank", category: "STRENGTH", muscleGroups: ["CORE"], equipment: "BODYWEIGHT", trackingType: "TIME" },
  { name: "Hanging Leg Raise", category: "STRENGTH", muscleGroups: ["CORE"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Cable Crunch", category: "STRENGTH", muscleGroups: ["CORE"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Russian Twist", category: "STRENGTH", muscleGroups: ["CORE"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Ab Wheel Rollout", category: "STRENGTH", muscleGroups: ["CORE"], equipment: "OTHER", trackingType: "BODYWEIGHT_REPS" },
  { name: "Sit-Up", category: "STRENGTH", muscleGroups: ["CORE"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },

  // Full body / Olympic / Kettlebell
  { name: "Clean and Jerk", category: "STRENGTH", muscleGroups: ["FULL_BODY"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Snatch", category: "STRENGTH", muscleGroups: ["FULL_BODY"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Kettlebell Swing", category: "STRENGTH", muscleGroups: ["FULL_BODY", "GLUTES"], equipment: "KETTLEBELL", trackingType: "WEIGHT_REPS" },
  { name: "Barbell Thruster", category: "STRENGTH", muscleGroups: ["FULL_BODY"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Burpee", category: "PLYOMETRIC", muscleGroups: ["FULL_BODY", "CARDIO"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Turkish Get-Up", category: "STRENGTH", muscleGroups: ["FULL_BODY"], equipment: "KETTLEBELL", trackingType: "WEIGHT_REPS" },
  { name: "Box Jump", category: "PLYOMETRIC", muscleGroups: ["QUADS", "GLUTES"], equipment: "OTHER", trackingType: "BODYWEIGHT_REPS" },

  // Cardio
  { name: "Running", category: "CARDIO", muscleGroups: ["CARDIO"], equipment: "OTHER", trackingType: "DISTANCE" },
  { name: "Cycling", category: "CARDIO", muscleGroups: ["CARDIO"], equipment: "OTHER", trackingType: "DISTANCE" },
  { name: "Rowing Machine", category: "CARDIO", muscleGroups: ["CARDIO", "BACK"], equipment: "MACHINE", trackingType: "DISTANCE" },
  { name: "Jump Rope", category: "CARDIO", muscleGroups: ["CARDIO"], equipment: "OTHER", trackingType: "TIME" },
  { name: "Stair Climber", category: "CARDIO", muscleGroups: ["CARDIO", "QUADS"], equipment: "MACHINE", trackingType: "TIME" },

  // Mobility
  { name: "Cat-Cow Stretch", category: "MOBILITY", muscleGroups: ["BACK", "CORE"], equipment: "BODYWEIGHT", trackingType: "TIME" },
  { name: "World's Greatest Stretch", category: "MOBILITY", muscleGroups: ["FULL_BODY"], equipment: "BODYWEIGHT", trackingType: "TIME" },
  { name: "Band Pull-Apart", category: "MOBILITY", muscleGroups: ["SHOULDERS", "BACK"], equipment: "BAND", trackingType: "BODYWEIGHT_REPS" },

  // --- Extended library: more dumbbell, machine, cable, barbell, bodyweight, kettlebell, band variations ---

  // Dumbbell (extended)
  { name: "Decline Dumbbell Bench Press", category: "STRENGTH", muscleGroups: ["CHEST", "TRICEPS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Single-Arm Dumbbell Bench Press", category: "STRENGTH", muscleGroups: ["CHEST", "TRICEPS", "CORE"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Incline Dumbbell Fly", category: "STRENGTH", muscleGroups: ["CHEST", "SHOULDERS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Pullover", category: "STRENGTH", muscleGroups: ["CHEST", "BACK"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Floor Press", category: "STRENGTH", muscleGroups: ["CHEST", "TRICEPS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Single-Arm Dumbbell Row", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Chest-Supported Dumbbell Row", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Shrug", category: "STRENGTH", muscleGroups: ["SHOULDERS", "BACK"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Seated Dumbbell Shoulder Press", category: "STRENGTH", muscleGroups: ["SHOULDERS", "TRICEPS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Single-Arm Lateral Raise", category: "STRENGTH", muscleGroups: ["SHOULDERS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Upright Row", category: "STRENGTH", muscleGroups: ["SHOULDERS", "BACK"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Cuban Press", category: "STRENGTH", muscleGroups: ["SHOULDERS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Alternating Dumbbell Curl", category: "STRENGTH", muscleGroups: ["BICEPS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Incline Dumbbell Curl", category: "STRENGTH", muscleGroups: ["BICEPS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Zottman Curl", category: "STRENGTH", muscleGroups: ["BICEPS", "FOREARMS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Single-Arm Overhead Tricep Extension", category: "STRENGTH", muscleGroups: ["TRICEPS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Skull Crusher", category: "STRENGTH", muscleGroups: ["TRICEPS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Reverse Lunge", category: "STRENGTH", muscleGroups: ["QUADS", "GLUTES"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Lateral Lunge", category: "STRENGTH", muscleGroups: ["QUADS", "GLUTES"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Romanian Deadlift", category: "STRENGTH", muscleGroups: ["HAMSTRINGS", "GLUTES"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Sumo Squat", category: "STRENGTH", muscleGroups: ["QUADS", "GLUTES"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Calf Raise", category: "STRENGTH", muscleGroups: ["CALVES"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Hip Thrust", category: "STRENGTH", muscleGroups: ["GLUTES", "HAMSTRINGS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Thruster", category: "STRENGTH", muscleGroups: ["FULL_BODY"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Snatch", category: "STRENGTH", muscleGroups: ["FULL_BODY"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Clean", category: "STRENGTH", muscleGroups: ["FULL_BODY"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Renegade Row", category: "STRENGTH", muscleGroups: ["BACK", "CORE"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },
  { name: "Dumbbell Wrist Curl", category: "STRENGTH", muscleGroups: ["FOREARMS"], equipment: "DUMBBELL", trackingType: "WEIGHT_REPS" },

  // Machine (extended)
  { name: "Incline Machine Chest Press", category: "STRENGTH", muscleGroups: ["CHEST", "SHOULDERS"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Smith Machine Bench Press", category: "STRENGTH", muscleGroups: ["CHEST", "TRICEPS"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Smith Machine Squat", category: "STRENGTH", muscleGroups: ["QUADS", "GLUTES"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Smith Machine Shoulder Press", category: "STRENGTH", muscleGroups: ["SHOULDERS", "TRICEPS"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Seated Leg Curl", category: "STRENGTH", muscleGroups: ["HAMSTRINGS"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Assisted Pull-Up Machine", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Assisted Dip Machine", category: "STRENGTH", muscleGroups: ["TRICEPS", "CHEST"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Machine Lateral Raise", category: "STRENGTH", muscleGroups: ["SHOULDERS"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Reverse Pec Deck", category: "STRENGTH", muscleGroups: ["SHOULDERS", "BACK"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Machine Bicep Curl", category: "STRENGTH", muscleGroups: ["BICEPS"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Machine Tricep Extension", category: "STRENGTH", muscleGroups: ["TRICEPS"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Machine Ab Crunch", category: "STRENGTH", muscleGroups: ["CORE"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Torso Rotation Machine", category: "STRENGTH", muscleGroups: ["CORE"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Glute Kickback Machine", category: "STRENGTH", muscleGroups: ["GLUTES"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Hip Abduction Machine", category: "STRENGTH", muscleGroups: ["GLUTES"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },
  { name: "Hip Adduction Machine", category: "STRENGTH", muscleGroups: ["GLUTES"], equipment: "MACHINE", trackingType: "WEIGHT_REPS" },

  // Cable (extended)
  { name: "Low-to-High Cable Fly", category: "STRENGTH", muscleGroups: ["CHEST"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "High-to-Low Cable Fly", category: "STRENGTH", muscleGroups: ["CHEST"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Cable Crossover", category: "STRENGTH", muscleGroups: ["CHEST"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Close-Grip Lat Pulldown", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Wide-Grip Lat Pulldown", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Single-Arm Lat Pulldown", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Single-Arm Cable Row", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Straight-Arm Pulldown", category: "STRENGTH", muscleGroups: ["BACK"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Cable Front Raise", category: "STRENGTH", muscleGroups: ["SHOULDERS"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Cable Upright Row", category: "STRENGTH", muscleGroups: ["SHOULDERS", "BACK"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Cable Hammer Curl", category: "STRENGTH", muscleGroups: ["BICEPS", "FOREARMS"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Cable Overhead Tricep Extension", category: "STRENGTH", muscleGroups: ["TRICEPS"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Cable Wood Chop", category: "STRENGTH", muscleGroups: ["CORE"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Pallof Press", category: "STRENGTH", muscleGroups: ["CORE"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },
  { name: "Cable Pull-Through", category: "STRENGTH", muscleGroups: ["GLUTES", "HAMSTRINGS"], equipment: "CABLE", trackingType: "WEIGHT_REPS" },

  // Barbell (extended)
  { name: "Decline Barbell Bench Press", category: "STRENGTH", muscleGroups: ["CHEST", "TRICEPS"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Box Squat", category: "STRENGTH", muscleGroups: ["QUADS", "GLUTES"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Overhead Squat", category: "STRENGTH", muscleGroups: ["QUADS", "FULL_BODY"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Sumo Deadlift", category: "STRENGTH", muscleGroups: ["BACK", "HAMSTRINGS", "GLUTES"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Deficit Deadlift", category: "STRENGTH", muscleGroups: ["BACK", "HAMSTRINGS", "GLUTES"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Pendlay Row", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Push Press", category: "STRENGTH", muscleGroups: ["SHOULDERS", "TRICEPS", "FULL_BODY"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Zercher Squat", category: "STRENGTH", muscleGroups: ["QUADS", "CORE"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Landmine Press", category: "STRENGTH", muscleGroups: ["SHOULDERS", "TRICEPS"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },
  { name: "Landmine Row", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "BARBELL", trackingType: "WEIGHT_REPS" },

  // Bodyweight (extended)
  { name: "Wide-Grip Push-Up", category: "STRENGTH", muscleGroups: ["CHEST"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Diamond Push-Up", category: "STRENGTH", muscleGroups: ["TRICEPS", "CHEST"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Decline Push-Up", category: "STRENGTH", muscleGroups: ["CHEST", "SHOULDERS"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Wide-Grip Pull-Up", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Neutral-Grip Pull-Up", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Inverted Row", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Bodyweight Squat", category: "STRENGTH", muscleGroups: ["QUADS", "GLUTES"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Pistol Squat", category: "STRENGTH", muscleGroups: ["QUADS", "GLUTES"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Jump Squat", category: "PLYOMETRIC", muscleGroups: ["QUADS", "GLUTES"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Bodyweight Lunge", category: "STRENGTH", muscleGroups: ["QUADS", "GLUTES"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Single-Leg Glute Bridge", category: "STRENGTH", muscleGroups: ["GLUTES"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Hollow Body Hold", category: "STRENGTH", muscleGroups: ["CORE"], equipment: "BODYWEIGHT", trackingType: "TIME" },
  { name: "Hanging Knee Raise", category: "STRENGTH", muscleGroups: ["CORE"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Crunch", category: "STRENGTH", muscleGroups: ["CORE"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Bicycle Crunch", category: "STRENGTH", muscleGroups: ["CORE"], equipment: "BODYWEIGHT", trackingType: "BODYWEIGHT_REPS" },
  { name: "Mountain Climber", category: "CARDIO", muscleGroups: ["CORE", "CARDIO"], equipment: "BODYWEIGHT", trackingType: "TIME" },

  // Kettlebell (extended)
  { name: "Kettlebell Goblet Squat", category: "STRENGTH", muscleGroups: ["QUADS", "GLUTES"], equipment: "KETTLEBELL", trackingType: "WEIGHT_REPS" },
  { name: "Kettlebell Snatch", category: "STRENGTH", muscleGroups: ["FULL_BODY"], equipment: "KETTLEBELL", trackingType: "WEIGHT_REPS" },
  { name: "Kettlebell Clean", category: "STRENGTH", muscleGroups: ["FULL_BODY"], equipment: "KETTLEBELL", trackingType: "WEIGHT_REPS" },
  { name: "Kettlebell Clean and Jerk", category: "STRENGTH", muscleGroups: ["FULL_BODY"], equipment: "KETTLEBELL", trackingType: "WEIGHT_REPS" },
  { name: "Kettlebell Windmill", category: "STRENGTH", muscleGroups: ["CORE", "SHOULDERS"], equipment: "KETTLEBELL", trackingType: "WEIGHT_REPS" },
  { name: "Kettlebell Halo", category: "STRENGTH", muscleGroups: ["SHOULDERS", "CORE"], equipment: "KETTLEBELL", trackingType: "WEIGHT_REPS" },
  { name: "Kettlebell Row", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "KETTLEBELL", trackingType: "WEIGHT_REPS" },
  { name: "Kettlebell Overhead Press", category: "STRENGTH", muscleGroups: ["SHOULDERS", "TRICEPS"], equipment: "KETTLEBELL", trackingType: "WEIGHT_REPS" },
  { name: "Kettlebell Deadlift", category: "STRENGTH", muscleGroups: ["HAMSTRINGS", "GLUTES", "BACK"], equipment: "KETTLEBELL", trackingType: "WEIGHT_REPS" },
  { name: "Kettlebell Farmer's Carry", category: "STRENGTH", muscleGroups: ["FOREARMS", "FULL_BODY"], equipment: "KETTLEBELL", trackingType: "TIME" },

  // Band (extended)
  { name: "Band Face Pull", category: "STRENGTH", muscleGroups: ["SHOULDERS", "BACK"], equipment: "BAND", trackingType: "BODYWEIGHT_REPS" },
  { name: "Band Lateral Walk", category: "STRENGTH", muscleGroups: ["GLUTES"], equipment: "BAND", trackingType: "BODYWEIGHT_REPS" },
  { name: "Band Assisted Pull-Up", category: "STRENGTH", muscleGroups: ["BACK", "BICEPS"], equipment: "BAND", trackingType: "BODYWEIGHT_REPS" },
  { name: "Band Bicep Curl", category: "STRENGTH", muscleGroups: ["BICEPS"], equipment: "BAND", trackingType: "BODYWEIGHT_REPS" },
  { name: "Band Tricep Pushdown", category: "STRENGTH", muscleGroups: ["TRICEPS"], equipment: "BAND", trackingType: "BODYWEIGHT_REPS" },
  { name: "Band Squat", category: "STRENGTH", muscleGroups: ["QUADS", "GLUTES"], equipment: "BAND", trackingType: "BODYWEIGHT_REPS" },

  // Cardio (extended)
  { name: "Elliptical", category: "CARDIO", muscleGroups: ["CARDIO"], equipment: "MACHINE", trackingType: "TIME" },
  { name: "Swimming", category: "CARDIO", muscleGroups: ["CARDIO", "FULL_BODY"], equipment: "OTHER", trackingType: "DISTANCE" },
];

async function main() {
  console.log(`Seeding ${exercises.length} exercises...`);

  for (const exercise of exercises) {
    const existing = await db.exercise.findFirst({
      where: { name: exercise.name, isCustom: false },
      select: { id: true },
    });
    if (!existing) {
      await db.exercise.create({ data: { ...exercise, isCustom: false } });
    }
  }

  const count = await db.exercise.count({ where: { isCustom: false } });
  console.log(`Done. ${count} global exercises in the database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
