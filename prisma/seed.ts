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
