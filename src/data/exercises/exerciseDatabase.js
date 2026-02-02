// Exercise Database
// This could eventually be moved to a backend API or local database

export const exercises = [
  {
    id: 1,
    name: "Bench Press",
    category: "compound",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts"],
    equipment: "barbell",
    difficulty: "intermediate",
    instructions: [
      "Lie flat on the bench with your eyes under the bar",
      "Grip the bar with hands slightly wider than shoulder-width",
      "Unrack the bar and lower it to your chest",
      "Press the bar back up to starting position"
    ],
    tips: [
      "Keep your shoulder blades retracted",
      "Control the weight on the descent",
      "Don't bounce the bar off your chest"
    ]
  },
  {
    id: 2,
    name: "Pull-ups",
    category: "compound",
    primaryMuscles: ["lats", "rhomboids"],
    secondaryMuscles: ["biceps", "rear_delts"],
    equipment: "pull_up_bar",
    difficulty: "intermediate",
    instructions: [
      "Hang from the bar with palms facing away",
      "Pull your body up until chin clears the bar",
      "Lower yourself back down with control"
    ],
    tips: [
      "Engage your core throughout the movement",
      "Don't swing or use momentum",
      "Focus on pulling with your back muscles"
    ]
  },
  {
    id: 3,
    name: "Squats",
    category: "compound",
    primaryMuscles: ["quadriceps", "glutes"],
    secondaryMuscles: ["hamstrings", "calves", "core"],
    equipment: "barbell",
    difficulty: "intermediate",
    instructions: [
      "Stand with feet shoulder-width apart",
      "Lower your body by bending at hips and knees",
      "Keep your chest up and knees tracking over toes",
      "Return to standing position"
    ],
    tips: [
      "Keep your weight on your heels",
      "Don't let knees cave inward",
      "Maintain a neutral spine"
    ]
  },
  {
    id: 4,
    name: "Lateral Raises",
    category: "isolation",
    primaryMuscles: ["side_delts"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    difficulty: "beginner",
    instructions: [
      "Stand with dumbbells at your sides",
      "Raise arms out to sides until parallel to floor",
      "Lower with control back to starting position"
    ],
    tips: [
      "Lead with your pinkies",
      "Don't use too much weight",
      "Control the descent"
    ]
  },
  {
    id: 5,
    name: "Barbell Curls",
    category: "isolation",
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    equipment: "barbell",
    difficulty: "beginner",
    instructions: [
      "Stand with barbell held at arm's length",
      "Curl the weight up by flexing your biceps",
      "Lower the weight back down with control"
    ],
    tips: [
      "Keep your elbows stationary",
      "Don't swing the weight",
      "Focus on the muscle contraction"
    ]
  },
  {
    id: 6,
    name: "Deadlifts",
    category: "compound",
    primaryMuscles: ["hamstrings", "glutes", "lower_back"],
    secondaryMuscles: ["traps", "lats", "forearms", "core"],
    equipment: "barbell",
    difficulty: "advanced",
    instructions: [
      "Stand with feet hip-width apart, barbell over mid-foot",
      "Bend at hips and knees to grip the bar",
      "Keep chest up and shoulders back",
      "Drive through heels to stand up straight"
    ],
    tips: [
      "Keep the bar close to your body",
      "Engage your lats throughout the movement",
      "Don't round your back"
    ]
  },
  {
    id: 7,
    name: "Overhead Press",
    category: "compound",
    primaryMuscles: ["front_delts", "side_delts"],
    secondaryMuscles: ["triceps", "traps", "core"],
    equipment: "barbell",
    difficulty: "intermediate",
    instructions: [
      "Stand with feet shoulder-width apart",
      "Hold barbell at shoulder height",
      "Press the bar straight up overhead",
      "Lower back to starting position"
    ],
    tips: [
      "Keep your core tight",
      "Don't arch your back excessively",
      "Press in a straight line"
    ]
  },
  {
    id: 8,
    name: "Dumbbell Rows",
    category: "compound",
    primaryMuscles: ["lats", "middle_back"],
    secondaryMuscles: ["biceps", "rear_delts"],
    equipment: "dumbbells",
    difficulty: "beginner",
    instructions: [
      "Place one knee and hand on bench",
      "Hold dumbbell in opposite hand",
      "Pull weight to your hip",
      "Lower with control"
    ],
    tips: [
      "Keep your back straight",
      "Pull with your back, not your arm",
      "Squeeze your shoulder blade at the top"
    ]
  },
  {
    id: 9,
    name: "Dips",
    category: "compound",
    primaryMuscles: ["triceps", "chest"],
    secondaryMuscles: ["front_delts"],
    equipment: "bodyweight",
    difficulty: "intermediate",
    instructions: [
      "Support yourself on parallel bars",
      "Lower your body by bending your elbows",
      "Push back up to starting position"
    ],
    tips: [
      "Keep your body upright",
      "Don't go too low",
      "Control the descent"
    ]
  },
  {
    id: 10,
    name: "Lunges",
    category: "compound",
    primaryMuscles: ["quadriceps", "glutes"],
    secondaryMuscles: ["hamstrings", "calves", "core"],
    equipment: "bodyweight",
    difficulty: "beginner",
    instructions: [
      "Step forward into a lunge position",
      "Lower your back knee toward the ground",
      "Push back to starting position",
      "Repeat on other leg"
    ],
    tips: [
      "Keep your front knee over your ankle",
      "Don't let your knee cave inward",
      "Maintain good posture"
    ]
  },
  {
    id: 11,
    name: "Romanian Deadlifts",
    category: "compound",
    primaryMuscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["lower_back", "core"],
    equipment: "barbell",
    difficulty: "intermediate",
    instructions: [
      "Hold barbell with overhand grip",
      "Keep knees slightly bent",
      "Hinge at hips, lowering the weight",
      "Return to starting position"
    ],
    tips: [
      "Feel the stretch in your hamstrings",
      "Keep the bar close to your legs",
      "Don't round your back"
    ]
  },
  {
    id: 12,
    name: "Tricep Pushdowns",
    category: "isolation",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner",
    instructions: [
      "Stand at cable machine with rope or bar",
      "Keep elbows at your sides",
      "Push the weight down until arms are straight",
      "Slowly return to starting position"
    ],
    tips: [
      "Don't move your elbows",
      "Focus on the tricep contraction",
      "Control the weight on the way up"
    ]
  },
  {
    id: 13,
    name: "Hammer Curls",
    category: "isolation",
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    equipment: "dumbbells",
    difficulty: "beginner",
    instructions: [
      "Hold dumbbells with neutral grip",
      "Keep elbows at your sides",
      "Curl weights up toward shoulders",
      "Lower with control"
    ],
    tips: [
      "Don't swing the weights",
      "Keep wrists straight",
      "Focus on the muscle contraction"
    ]
  },
  {
    id: 14,
    name: "Face Pulls",
    category: "isolation",
    primaryMuscles: ["rear_delts"],
    secondaryMuscles: ["middle_back", "traps"],
    equipment: "cable",
    difficulty: "beginner",
    instructions: [
      "Set cable at face height",
      "Pull rope to your face",
      "Separate the rope at your face",
      "Return to starting position"
    ],
    tips: [
      "Keep your elbows high",
      "Pull to your upper chest/face level",
      "Focus on rear delt contraction"
    ]
  },
  {
    id: 15,
    name: "Leg Press",
    category: "compound",
    primaryMuscles: ["quadriceps", "glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: "machine",
    difficulty: "beginner",
    instructions: [
      "Sit in leg press machine",
      "Place feet on platform shoulder-width apart",
      "Lower the weight by bending your knees",
      "Push through your heels to extend legs"
    ],
    tips: [
      "Don't let knees cave inward",
      "Keep your core engaged",
      "Control the descent"
    ]
  },
  {
    id: 16,
    name: "Calf Raises",
    category: "isolation",
    primaryMuscles: ["calves"],
    secondaryMuscles: [],
    equipment: "bodyweight",
    difficulty: "beginner",
    instructions: [
      "Stand with feet hip-width apart",
      "Rise up on your toes",
      "Hold briefly at the top",
      "Lower back down with control"
    ],
    tips: [
      "Get a full range of motion",
      "Pause at the top",
      "Control the descent"
    ]
  },
  {
    id: 17,
    name: "Plank",
    category: "isolation",
    primaryMuscles: ["core", "abs"],
    secondaryMuscles: ["front_delts", "glutes"],
    equipment: "bodyweight",
    difficulty: "beginner",
    instructions: [
      "Start in push-up position",
      "Hold your body in a straight line",
      "Keep your core engaged",
      "Hold for desired time"
    ],
    tips: [
      "Don't let hips sag",
      "Breathe normally",
      "Keep your head neutral"
    ]
  },
  {
    id: 18,
    name: "Russian Twists",
    category: "isolation",
    primaryMuscles: ["obliques", "abs"],
    secondaryMuscles: ["core"],
    equipment: "bodyweight",
    difficulty: "beginner",
    instructions: [
      "Sit with knees bent, feet off ground",
      "Lean back slightly",
      "Rotate your torso left and right",
      "Keep your core engaged throughout"
    ],
    tips: [
      "Control the movement",
      "Don't use momentum",
      "Keep your chest up"
    ]
  },
  {
    id: 19,
    name: "Incline Dumbbell Press",
    category: "compound",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts", "triceps"],
    equipment: "dumbbells",
    difficulty: "intermediate",
    instructions: [
      "Set bench to 30-45 degree incline",
      "Hold dumbbells at chest level",
      "Press weights up and together",
      "Lower with control"
    ],
    tips: [
      "Don't arch your back excessively",
      "Control the weight on descent",
      "Focus on chest contraction"
    ]
  },
  {
    id: 20,
    name: "Leg Curls",
    category: "isolation",
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: [],
    equipment: "machine",
    difficulty: "beginner",
    instructions: [
      "Lie face down on leg curl machine",
      "Position pad behind your ankles",
      "Curl your heels toward your glutes",
      "Lower with control"
    ],
    tips: [
      "Don't use momentum",
      "Feel the stretch at the bottom",
      "Squeeze at the top"
    ]
  },
  {
    id: 21,
    name: "Chest Flyes",
    category: "isolation",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts"],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 22,
    name: "Cable Chest Flyes",
    category: "isolation",
    primaryMuscles: ["chest"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 23,
    name: "Lat Pulldowns",
    category: "compound",
    primaryMuscles: ["lats"],
    secondaryMuscles: ["biceps", "rear_delts"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 24,
    name: "Seated Cable Rows",
    category: "compound",
    primaryMuscles: ["middle_back"],
    secondaryMuscles: ["lats", "biceps"],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 25,
    name: "Hip Thrusts",
    category: "compound",
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings", "core"],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 26,
    name: "Bulgarian Split Squats",
    category: "compound",
    primaryMuscles: ["quadriceps", "glutes"],
    secondaryMuscles: ["hamstrings", "core"],
    equipment: "dumbbells",
    difficulty: "advanced"
  },
  {
    id: 27,
    name: "Step-Ups",
    category: "compound",
    primaryMuscles: ["glutes", "quadriceps"],
    secondaryMuscles: ["hamstrings", "calves"],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 28,
    name: "Glute Kickbacks",
    category: "isolation",
    primaryMuscles: ["glutes"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 29,
    name: "Preacher Curls",
    category: "isolation",
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 30,
    name: "Skull Crushers",
    category: "isolation",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 31,
    name: "Arnold Press",
    category: "compound",
    primaryMuscles: ["front_delts", "side_delts"],
    secondaryMuscles: ["triceps"],
    equipment: "dumbbells",
    difficulty: "intermediate"
  },
  {
    id: 32,
    name: "Reverse Pec Deck",
    category: "isolation",
    primaryMuscles: ["rear_delts"],
    secondaryMuscles: ["middle_back"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 33,
    name: "Shrugs",
    category: "isolation",
    primaryMuscles: ["traps"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 34,
    name: "Smith Machine Squats",
    category: "compound",
    primaryMuscles: ["quadriceps"],
    secondaryMuscles: ["glutes"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 35,
    name: "Hack Squats",
    category: "compound",
    primaryMuscles: ["quadriceps"],
    secondaryMuscles: ["glutes"],
    equipment: "machine",
    difficulty: "intermediate"
  },
  {
    id: 36,
    name: "Ab Rollouts",
    category: "isolation",
    primaryMuscles: ["abs"],
    secondaryMuscles: ["core"],
    equipment: "bodyweight",
    difficulty: "advanced"
  },
  {
    id: 37,
    name: "Hanging Leg Raises",
    category: "isolation",
    primaryMuscles: ["abs"],
    secondaryMuscles: ["hip_flexors"],
    equipment: "pull_up_bar",
    difficulty: "advanced"
  },
  {
    id: 38,
    name: "Cable Crunches",
    category: "isolation",
    primaryMuscles: ["abs"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 39,
    name: "Farmer’s Walk",
    category: "compound",
    primaryMuscles: ["forearms", "core"],
    secondaryMuscles: ["traps"],
    equipment: "dumbbells",
    difficulty: "intermediate"
  },
  {
    id: 40,
    name: "Push-Ups",
    category: "compound",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts"],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 41,
    name: "Incline Barbell Press",
    category: "compound",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts", "triceps"],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 42,
    name: "Machine Chest Press",
    category: "compound",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 43,
    name: "Cable Lateral Raises",
    category: "isolation",
    primaryMuscles: ["side_delts"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 44,
    name: "Rear Delt Flyes",
    category: "isolation",
    primaryMuscles: ["rear_delts"],
    secondaryMuscles: ["middle_back"],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 45,
    name: "Machine Shoulder Press",
    category: "compound",
    primaryMuscles: ["front_delts", "side_delts"],
    secondaryMuscles: ["triceps"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 46,
    name: "Assisted Pull-Ups",
    category: "compound",
    primaryMuscles: ["lats"],
    secondaryMuscles: ["biceps"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 47,
    name: "T-Bar Rows",
    category: "compound",
    primaryMuscles: ["middle_back"],
    secondaryMuscles: ["lats", "biceps"],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 48,
    name: "Chest-Supported Dumbbell Rows",
    category: "compound",
    primaryMuscles: ["middle_back"],
    secondaryMuscles: ["rear_delts", "biceps"],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 49,
    name: "Cable Rows (Wide Grip)",
    category: "compound",
    primaryMuscles: ["middle_back"],
    secondaryMuscles: ["rear_delts", "biceps"],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 50,
    name: "Good Mornings",
    category: "compound",
    primaryMuscles: ["hamstrings", "lower_back"],
    secondaryMuscles: ["glutes", "core"],
    equipment: "barbell",
    difficulty: "advanced"
  },
  {
    id: 51,
    name: "Seated Leg Extensions",
    category: "isolation",
    primaryMuscles: ["quadriceps"],
    secondaryMuscles: [],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 52,
    name: "Standing Calf Raises (Machine)",
    category: "isolation",
    primaryMuscles: ["calves"],
    secondaryMuscles: [],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 53,
    name: "Seated Calf Raises",
    category: "isolation",
    primaryMuscles: ["calves"],
    secondaryMuscles: [],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 54,
    name: "Cable Pullovers",
    category: "isolation",
    primaryMuscles: ["lats"],
    secondaryMuscles: ["core"],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 55,
    name: "EZ-Bar Curls",
    category: "isolation",
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    equipment: "barbell",
    difficulty: "beginner"
  },
  {
    id: 56,
    name: "Incline Dumbbell Curls",
    category: "isolation",
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    difficulty: "intermediate"
  },
  {
    id: 57,
    name: "Cable Tricep Extensions (Overhead)",
    category: "isolation",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 58,
    name: "Close-Grip Bench Press",
    category: "compound",
    primaryMuscles: ["triceps"],
    secondaryMuscles: ["chest", "front_delts"],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 59,
    name: "Machine Hip Abductions",
    category: "isolation",
    primaryMuscles: ["glutes"],
    secondaryMuscles: [],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 60,
    name: "Machine Hip Adductions",
    category: "isolation",
    primaryMuscles: ["inner_thighs"],
    secondaryMuscles: [],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 61,
    name: "Single-Arm Dumbbell Bench Press",
    category: "compound",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts", "core"],
    equipment: "dumbbells",
    difficulty: "intermediate"
  },
  {
    id: 62,
    name: "Decline Barbell Bench Press",
    category: "compound",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts"],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 63,
    name: "Pec Deck Flyes",
    category: "isolation",
    primaryMuscles: ["chest"],
    secondaryMuscles: [],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 64,
    name: "Straight-Arm Pulldowns",
    category: "isolation",
    primaryMuscles: ["lats"],
    secondaryMuscles: ["core"],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 65,
    name: "Wide-Grip Pull-Ups",
    category: "compound",
    primaryMuscles: ["lats"],
    secondaryMuscles: ["biceps", "rear_delts"],
    equipment: "pull_up_bar",
    difficulty: "advanced"
  },
  {
    id: 66,
    name: "Meadows Rows",
    category: "compound",
    primaryMuscles: ["middle_back"],
    secondaryMuscles: ["lats", "rear_delts", "biceps"],
    equipment: "barbell",
    difficulty: "advanced"
  },
  {
    id: 67,
    name: "Cable Upright Rows",
    category: "compound",
    primaryMuscles: ["traps", "side_delts"],
    secondaryMuscles: ["biceps"],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 68,
    name: "Front Raises",
    category: "isolation",
    primaryMuscles: ["front_delts"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 69,
    name: "Z-Press",
    category: "compound",
    primaryMuscles: ["front_delts", "side_delts"],
    secondaryMuscles: ["triceps", "core"],
    equipment: "barbell",
    difficulty: "advanced"
  },
  {
    id: 70,
    name: "Nordic Hamstring Curls",
    category: "isolation",
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: ["glutes"],
    equipment: "bodyweight",
    difficulty: "advanced"
  },
  {
    id: 71,
    name: "Single-Leg Romanian Deadlifts",
    category: "compound",
    primaryMuscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["core"],
    equipment: "dumbbells",
    difficulty: "intermediate"
  },
  {
    id: 72,
    name: "Cable Glute Pull-Throughs",
    category: "compound",
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings", "core"],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 73,
    name: "Sissy Squats",
    category: "isolation",
    primaryMuscles: ["quadriceps"],
    secondaryMuscles: [],
    equipment: "bodyweight",
    difficulty: "advanced"
  },
  {
    id: 74,
    name: "Goblet Squats",
    category: "compound",
    primaryMuscles: ["quadriceps", "glutes"],
    secondaryMuscles: ["core"],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 75,
    name: "Reverse Lunges",
    category: "compound",
    primaryMuscles: ["glutes", "quadriceps"],
    secondaryMuscles: ["hamstrings", "core"],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 76,
    name: "Cable Woodchoppers",
    category: "isolation",
    primaryMuscles: ["obliques"],
    secondaryMuscles: ["core"],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 77,
    name: "Decline Sit-Ups",
    category: "isolation",
    primaryMuscles: ["abs"],
    secondaryMuscles: ["hip_flexors"],
    equipment: "bodyweight",
    difficulty: "intermediate"
  },
  {
    id: 78,
    name: "Weighted Plank",
    category: "isolation",
    primaryMuscles: ["core"],
    secondaryMuscles: ["abs", "glutes"],
    equipment: "bodyweight",
    difficulty: "intermediate"
  },
  {
    id: 79,
    name: "Barbell Wrist Curls",
    category: "isolation",
    primaryMuscles: ["forearms"],
    secondaryMuscles: [],
    equipment: "barbell",
    difficulty: "beginner"
  },
  {
    id: 80,
    name: "Reverse Wrist Curls",
    category: "isolation",
    primaryMuscles: ["forearms"],
    secondaryMuscles: [],
    equipment: "barbell",
    difficulty: "beginner"
  },
  {
    id: 81,
    name: "Battle Ropes",
    category: "compound",
    primaryMuscles: ["shoulders", "core"],
    secondaryMuscles: ["forearms"],
    equipment: "machine",
    difficulty: "intermediate"
  },
  {
    id: 82,
    name: "Sled Push",
    category: "compound",
    primaryMuscles: ["quadriceps", "glutes"],
    secondaryMuscles: ["calves", "core"],
    equipment: "machine",
    difficulty: "intermediate"
  },
  {
    id: 83,
    name: "Sled Pull",
    category: "compound",
    primaryMuscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["core"],
    equipment: "machine",
    difficulty: "intermediate"
  },
  {
    id: 84,
    name: "Landmine Press",
    category: "compound",
    primaryMuscles: ["front_delts"],
    secondaryMuscles: ["triceps", "core"],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 85,
    name: "Landmine Rows",
    category: "compound",
    primaryMuscles: ["middle_back"],
    secondaryMuscles: ["lats", "biceps"],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 86,
    name: "Trap Bar Deadlift",
    category: "compound",
    primaryMuscles: ["glutes", "hamstrings", "quadriceps"],
    secondaryMuscles: ["lower_back", "traps", "core"],
    equipment: "trap_bar",
    difficulty: "intermediate",
    instructions: [
      "Stand inside the trap bar with feet hip-width apart",
      "Grip the handles and brace your core",
      "Drive through your heels to stand up",
      "Lower the weight with control"
    ],
    tips: [
      "Keep your chest tall",
      "Push the floor away",
      "Do not jerk the weight off the ground"
    ]
  },
  {
    id: 87,
    name: "Standing Dumbbell Overhead Press",
    category: "compound",
    primaryMuscles: ["front_delts", "side_delts"],
    secondaryMuscles: ["triceps", "core"],
    equipment: "dumbbells",
    difficulty: "intermediate",
    instructions: [
      "Hold dumbbells at shoulder height",
      "Brace your core and glutes",
      "Press dumbbells overhead",
      "Lower back to starting position with control"
    ],
    tips: [
      "Do not lean back",
      "Press in a straight line",
      "Control the eccentric"
    ]
  },
  {
    id: 88,
    name: "Single-Leg Calf Raises",
    category: "isolation",
    primaryMuscles: ["calves"],
    secondaryMuscles: ["ankles"],
    equipment: "bodyweight",
    difficulty: "beginner",
    instructions: [
      "Stand on one foot near a wall or rail",
      "Rise onto your toes",
      "Pause briefly at the top",
      "Lower slowly under control"
    ],
    tips: [
      "Use full range of motion",
      "Slow eccentric",
      "Do not bounce"
    ]
  },
  {
    id: 89,
    name: "Pallof Press",
    category: "isolation",
    primaryMuscles: ["core"],
    secondaryMuscles: ["obliques"],
    equipment: "cable",
    difficulty: "beginner",
    instructions: [
      "Stand perpendicular to the cable stack",
      "Hold handle at chest height",
      "Press arms straight out",
      "Resist rotation and return slowly"
    ],
    tips: [
      "Brace your abs hard",
      "Do not twist",
      "Control the movement"
    ]
  },
  {
    id: 90,
    name: "Walking Lunges",
    category: "compound",
    primaryMuscles: ["glutes", "quadriceps"],
    secondaryMuscles: ["hamstrings", "calves", "core"],
    equipment: "dumbbells",
    difficulty: "beginner",
    instructions: [
      "Step forward into a lunge",
      "Lower back knee toward the ground",
      "Step through into next rep",
      "Alternate legs continuously"
    ],
    tips: [
      "Stay tall",
      "Drive through the front heel",
      "Do not rush reps"
    ]
  },
  // Cardio Exercises
  {
    id: 1001,
    name: "Treadmill",
    exerciseType: "cardio",
    cardioFields: ["duration", "incline", "speed"],
    category: "cardio",
    primaryMuscles: ["cardio"],
    secondaryMuscles: ["quadriceps", "calves", "glutes"],
    difficulty: "beginner",
    instructions: [
      "Step onto the treadmill and straddle the belt",
      "Start the treadmill at a slow speed",
      "Begin walking and gradually increase speed",
      "Adjust incline to increase intensity",
      "Maintain good posture throughout"
    ],
    tips: [
      "Don't hold onto the handrails - let arms swing naturally",
      "Keep your core engaged",
      "Start with a warm-up pace before increasing intensity",
      "Cool down with a slower pace at the end"
    ]
  },
  {
    id: 1002,
    name: "Stairmaster",
    exerciseType: "cardio",
    cardioFields: ["duration", "speed"],
    category: "cardio",
    primaryMuscles: ["cardio"],
    secondaryMuscles: ["quadriceps", "glutes", "calves", "hamstrings"],
    difficulty: "intermediate",
    instructions: [
      "Step onto the machine and grip the handrails lightly",
      "Start at a comfortable speed",
      "Step with your full foot on each stair",
      "Maintain an upright posture",
      "Avoid leaning heavily on handrails"
    ],
    tips: [
      "Push through your heels to engage glutes",
      "Keep a steady rhythm",
      "Use handrails for balance only, not support",
      "Start slower and increase speed as you warm up"
    ]
  },

  // ===== ADDITIONAL CHEST EXERCISES =====
  {
    id: 91,
    name: "Dumbbell Bench Press",
    category: "compound",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts"],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 92,
    name: "Decline Dumbbell Press",
    category: "compound",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts"],
    equipment: "dumbbells",
    difficulty: "intermediate"
  },
  {
    id: 93,
    name: "Incline Cable Flyes",
    category: "isolation",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts"],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 94,
    name: "Low Cable Flyes",
    category: "isolation",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts"],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 95,
    name: "High Cable Flyes",
    category: "isolation",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts"],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 96,
    name: "Single-Arm Cable Chest Press",
    category: "compound",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts", "core"],
    equipment: "cable",
    difficulty: "intermediate"
  },
  {
    id: 97,
    name: "Incline Push-Ups",
    category: "compound",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts"],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 98,
    name: "Decline Push-Ups",
    category: "compound",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts"],
    equipment: "bodyweight",
    difficulty: "intermediate"
  },
  {
    id: 99,
    name: "Diamond Push-Ups",
    category: "compound",
    primaryMuscles: ["triceps", "chest"],
    secondaryMuscles: ["front_delts"],
    equipment: "bodyweight",
    difficulty: "intermediate"
  },
  {
    id: 100,
    name: "Wide Push-Ups",
    category: "compound",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts"],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 101,
    name: "Svend Press",
    category: "isolation",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts"],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 102,
    name: "Floor Press",
    category: "compound",
    primaryMuscles: ["chest", "triceps"],
    secondaryMuscles: ["front_delts"],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 103,
    name: "Dumbbell Floor Press",
    category: "compound",
    primaryMuscles: ["chest", "triceps"],
    secondaryMuscles: ["front_delts"],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 104,
    name: "Incline Dumbbell Flyes",
    category: "isolation",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts"],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 105,
    name: "Decline Dumbbell Flyes",
    category: "isolation",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts"],
    equipment: "dumbbells",
    difficulty: "intermediate"
  },

  // ===== ADDITIONAL BACK EXERCISES =====
  {
    id: 106,
    name: "Single-Arm Lat Pulldown",
    category: "compound",
    primaryMuscles: ["lats"],
    secondaryMuscles: ["biceps", "rear_delts"],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 107,
    name: "Close-Grip Lat Pulldown",
    category: "compound",
    primaryMuscles: ["lats"],
    secondaryMuscles: ["biceps", "middle_back"],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 108,
    name: "Wide-Grip Lat Pulldown",
    category: "compound",
    primaryMuscles: ["lats"],
    secondaryMuscles: ["biceps", "rear_delts"],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 109,
    name: "Reverse-Grip Lat Pulldown",
    category: "compound",
    primaryMuscles: ["lats"],
    secondaryMuscles: ["biceps"],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 110,
    name: "Chin-Ups",
    category: "compound",
    primaryMuscles: ["lats", "biceps"],
    secondaryMuscles: ["middle_back"],
    equipment: "pull_up_bar",
    difficulty: "intermediate"
  },
  {
    id: 111,
    name: "Neutral-Grip Pull-Ups",
    category: "compound",
    primaryMuscles: ["lats"],
    secondaryMuscles: ["biceps", "middle_back"],
    equipment: "pull_up_bar",
    difficulty: "intermediate"
  },
  {
    id: 112,
    name: "Single-Arm Cable Row",
    category: "compound",
    primaryMuscles: ["lats", "middle_back"],
    secondaryMuscles: ["biceps", "rear_delts"],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 113,
    name: "Barbell Rows",
    category: "compound",
    primaryMuscles: ["middle_back", "lats"],
    secondaryMuscles: ["biceps", "rear_delts"],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 114,
    name: "Pendlay Rows",
    category: "compound",
    primaryMuscles: ["middle_back", "lats"],
    secondaryMuscles: ["biceps", "rear_delts"],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 115,
    name: "Yates Rows",
    category: "compound",
    primaryMuscles: ["middle_back"],
    secondaryMuscles: ["lats", "biceps"],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 116,
    name: "Seal Rows",
    category: "compound",
    primaryMuscles: ["middle_back"],
    secondaryMuscles: ["lats", "biceps", "rear_delts"],
    equipment: "dumbbells",
    difficulty: "intermediate"
  },
  {
    id: 117,
    name: "Inverted Rows",
    category: "compound",
    primaryMuscles: ["middle_back"],
    secondaryMuscles: ["lats", "biceps", "rear_delts"],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 118,
    name: "Machine Rows",
    category: "compound",
    primaryMuscles: ["middle_back"],
    secondaryMuscles: ["lats", "biceps"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 119,
    name: "Single-Arm Machine Row",
    category: "compound",
    primaryMuscles: ["middle_back", "lats"],
    secondaryMuscles: ["biceps", "rear_delts"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 120,
    name: "Dumbbell Pullovers",
    category: "compound",
    primaryMuscles: ["lats", "chest"],
    secondaryMuscles: ["triceps"],
    equipment: "dumbbells",
    difficulty: "intermediate"
  },
  {
    id: 121,
    name: "Hyperextensions",
    category: "isolation",
    primaryMuscles: ["lower_back"],
    secondaryMuscles: ["glutes", "hamstrings"],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 122,
    name: "Weighted Hyperextensions",
    category: "isolation",
    primaryMuscles: ["lower_back"],
    secondaryMuscles: ["glutes", "hamstrings"],
    equipment: "dumbbells",
    difficulty: "intermediate"
  },
  {
    id: 123,
    name: "Reverse Hyperextensions",
    category: "isolation",
    primaryMuscles: ["glutes", "lower_back"],
    secondaryMuscles: ["hamstrings"],
    equipment: "machine",
    difficulty: "intermediate"
  },
  {
    id: 124,
    name: "Superman Hold",
    category: "isolation",
    primaryMuscles: ["lower_back"],
    secondaryMuscles: ["glutes"],
    equipment: "bodyweight",
    difficulty: "beginner"
  },

  // ===== ADDITIONAL SHOULDER EXERCISES =====
  {
    id: 125,
    name: "Seated Dumbbell Press",
    category: "compound",
    primaryMuscles: ["front_delts", "side_delts"],
    secondaryMuscles: ["triceps"],
    equipment: "dumbbells",
    difficulty: "intermediate"
  },
  {
    id: 126,
    name: "Single-Arm Dumbbell Press",
    category: "compound",
    primaryMuscles: ["front_delts", "side_delts"],
    secondaryMuscles: ["triceps", "core"],
    equipment: "dumbbells",
    difficulty: "intermediate"
  },
  {
    id: 127,
    name: "Push Press",
    category: "compound",
    primaryMuscles: ["front_delts", "side_delts"],
    secondaryMuscles: ["triceps", "quadriceps", "core"],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 128,
    name: "Behind the Neck Press",
    category: "compound",
    primaryMuscles: ["front_delts", "side_delts"],
    secondaryMuscles: ["triceps", "traps"],
    equipment: "barbell",
    difficulty: "advanced"
  },
  {
    id: 129,
    name: "Single-Arm Cable Lateral Raise",
    category: "isolation",
    primaryMuscles: ["side_delts"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 130,
    name: "Leaning Cable Lateral Raise",
    category: "isolation",
    primaryMuscles: ["side_delts"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "intermediate"
  },
  {
    id: 131,
    name: "Machine Lateral Raise",
    category: "isolation",
    primaryMuscles: ["side_delts"],
    secondaryMuscles: [],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 132,
    name: "Dumbbell Front Raises",
    category: "isolation",
    primaryMuscles: ["front_delts"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 133,
    name: "Cable Front Raises",
    category: "isolation",
    primaryMuscles: ["front_delts"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 134,
    name: "Plate Front Raises",
    category: "isolation",
    primaryMuscles: ["front_delts"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 135,
    name: "Cable Rear Delt Flyes",
    category: "isolation",
    primaryMuscles: ["rear_delts"],
    secondaryMuscles: ["middle_back"],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 136,
    name: "Bent-Over Rear Delt Raises",
    category: "isolation",
    primaryMuscles: ["rear_delts"],
    secondaryMuscles: ["middle_back"],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 137,
    name: "Incline Rear Delt Raises",
    category: "isolation",
    primaryMuscles: ["rear_delts"],
    secondaryMuscles: ["middle_back"],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 138,
    name: "Dumbbell Upright Rows",
    category: "compound",
    primaryMuscles: ["traps", "side_delts"],
    secondaryMuscles: ["biceps"],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 139,
    name: "Barbell Upright Rows",
    category: "compound",
    primaryMuscles: ["traps", "side_delts"],
    secondaryMuscles: ["biceps"],
    equipment: "barbell",
    difficulty: "beginner"
  },
  {
    id: 140,
    name: "Lu Raises",
    category: "isolation",
    primaryMuscles: ["front_delts", "side_delts"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    difficulty: "intermediate"
  },
  {
    id: 141,
    name: "Barbell Shrugs",
    category: "isolation",
    primaryMuscles: ["traps"],
    secondaryMuscles: [],
    equipment: "barbell",
    difficulty: "beginner"
  },
  {
    id: 142,
    name: "Cable Shrugs",
    category: "isolation",
    primaryMuscles: ["traps"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 143,
    name: "Machine Shrugs",
    category: "isolation",
    primaryMuscles: ["traps"],
    secondaryMuscles: [],
    equipment: "machine",
    difficulty: "beginner"
  },

  // ===== ADDITIONAL BICEP EXERCISES =====
  {
    id: 144,
    name: "Concentration Curls",
    category: "isolation",
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 145,
    name: "Spider Curls",
    category: "isolation",
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    difficulty: "intermediate"
  },
  {
    id: 146,
    name: "Cable Curls",
    category: "isolation",
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 147,
    name: "Single-Arm Cable Curl",
    category: "isolation",
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 148,
    name: "High Cable Curls",
    category: "isolation",
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "intermediate"
  },
  {
    id: 149,
    name: "Drag Curls",
    category: "isolation",
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 150,
    name: "21s (Bicep Curls)",
    category: "isolation",
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 151,
    name: "Cross-Body Hammer Curls",
    category: "isolation",
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 152,
    name: "Cable Hammer Curls",
    category: "isolation",
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 153,
    name: "Reverse Curls",
    category: "isolation",
    primaryMuscles: ["forearms"],
    secondaryMuscles: ["biceps"],
    equipment: "barbell",
    difficulty: "beginner"
  },
  {
    id: 154,
    name: "Dumbbell Reverse Curls",
    category: "isolation",
    primaryMuscles: ["forearms"],
    secondaryMuscles: ["biceps"],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 155,
    name: "Machine Bicep Curls",
    category: "isolation",
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 156,
    name: "Zottman Curls",
    category: "isolation",
    primaryMuscles: ["biceps", "forearms"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    difficulty: "intermediate"
  },
  {
    id: 157,
    name: "Bayesian Cable Curls",
    category: "isolation",
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "intermediate"
  },

  // ===== ADDITIONAL TRICEP EXERCISES =====
  {
    id: 158,
    name: "Overhead Dumbbell Tricep Extension",
    category: "isolation",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 159,
    name: "Single-Arm Overhead Tricep Extension",
    category: "isolation",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 160,
    name: "Tricep Kickbacks",
    category: "isolation",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 161,
    name: "Cable Tricep Kickbacks",
    category: "isolation",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 162,
    name: "Single-Arm Tricep Pushdowns",
    category: "isolation",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 163,
    name: "Rope Tricep Pushdowns",
    category: "isolation",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 164,
    name: "V-Bar Tricep Pushdowns",
    category: "isolation",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 165,
    name: "Straight Bar Tricep Pushdowns",
    category: "isolation",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 166,
    name: "Overhead Cable Tricep Extension",
    category: "isolation",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 167,
    name: "EZ-Bar Skull Crushers",
    category: "isolation",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 168,
    name: "Dumbbell Skull Crushers",
    category: "isolation",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    difficulty: "intermediate"
  },
  {
    id: 169,
    name: "Bench Dips",
    category: "compound",
    primaryMuscles: ["triceps"],
    secondaryMuscles: ["chest", "front_delts"],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 170,
    name: "JM Press",
    category: "compound",
    primaryMuscles: ["triceps"],
    secondaryMuscles: ["chest"],
    equipment: "barbell",
    difficulty: "advanced"
  },
  {
    id: 171,
    name: "Machine Tricep Dips",
    category: "compound",
    primaryMuscles: ["triceps"],
    secondaryMuscles: ["chest"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 172,
    name: "Tate Press",
    category: "isolation",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    difficulty: "intermediate"
  },

  // ===== ADDITIONAL LEG EXERCISES =====
  {
    id: 173,
    name: "Front Squats",
    category: "compound",
    primaryMuscles: ["quadriceps"],
    secondaryMuscles: ["glutes", "core"],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 174,
    name: "Pause Squats",
    category: "compound",
    primaryMuscles: ["quadriceps", "glutes"],
    secondaryMuscles: ["hamstrings", "core"],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 175,
    name: "Box Squats",
    category: "compound",
    primaryMuscles: ["quadriceps", "glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 176,
    name: "Sumo Squats",
    category: "compound",
    primaryMuscles: ["quadriceps", "inner_thighs"],
    secondaryMuscles: ["glutes"],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 177,
    name: "Dumbbell Squats",
    category: "compound",
    primaryMuscles: ["quadriceps", "glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 178,
    name: "Zercher Squats",
    category: "compound",
    primaryMuscles: ["quadriceps", "glutes"],
    secondaryMuscles: ["core", "biceps"],
    equipment: "barbell",
    difficulty: "advanced"
  },
  {
    id: 179,
    name: "Pendulum Squats",
    category: "compound",
    primaryMuscles: ["quadriceps"],
    secondaryMuscles: ["glutes"],
    equipment: "machine",
    difficulty: "intermediate"
  },
  {
    id: 180,
    name: "Belt Squats",
    category: "compound",
    primaryMuscles: ["quadriceps", "glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: "machine",
    difficulty: "intermediate"
  },
  {
    id: 181,
    name: "Single-Leg Leg Press",
    category: "compound",
    primaryMuscles: ["quadriceps", "glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: "machine",
    difficulty: "intermediate"
  },
  {
    id: 182,
    name: "Dumbbell Lunges",
    category: "compound",
    primaryMuscles: ["quadriceps", "glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 183,
    name: "Barbell Lunges",
    category: "compound",
    primaryMuscles: ["quadriceps", "glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 184,
    name: "Lateral Lunges",
    category: "compound",
    primaryMuscles: ["quadriceps", "inner_thighs"],
    secondaryMuscles: ["glutes"],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 185,
    name: "Curtsy Lunges",
    category: "compound",
    primaryMuscles: ["glutes", "quadriceps"],
    secondaryMuscles: ["inner_thighs"],
    equipment: "bodyweight",
    difficulty: "intermediate"
  },
  {
    id: 186,
    name: "Sumo Deadlifts",
    category: "compound",
    primaryMuscles: ["glutes", "inner_thighs"],
    secondaryMuscles: ["hamstrings", "lower_back", "quadriceps"],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 187,
    name: "Dumbbell Romanian Deadlifts",
    category: "compound",
    primaryMuscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["lower_back"],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 188,
    name: "Stiff-Leg Deadlifts",
    category: "compound",
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: ["glutes", "lower_back"],
    equipment: "barbell",
    difficulty: "intermediate"
  },
  {
    id: 189,
    name: "Deficit Deadlifts",
    category: "compound",
    primaryMuscles: ["hamstrings", "glutes", "lower_back"],
    secondaryMuscles: ["quadriceps", "traps"],
    equipment: "barbell",
    difficulty: "advanced"
  },
  {
    id: 190,
    name: "Seated Leg Curls",
    category: "isolation",
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: [],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 191,
    name: "Standing Leg Curls",
    category: "isolation",
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: [],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 192,
    name: "Cable Leg Curls",
    category: "isolation",
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 193,
    name: "Single-Leg Hip Thrusts",
    category: "compound",
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings", "core"],
    equipment: "bodyweight",
    difficulty: "intermediate"
  },
  {
    id: 194,
    name: "Dumbbell Hip Thrusts",
    category: "compound",
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 195,
    name: "Machine Hip Thrusts",
    category: "compound",
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 196,
    name: "Glute Bridges",
    category: "isolation",
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 197,
    name: "Single-Leg Glute Bridges",
    category: "isolation",
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings", "core"],
    equipment: "bodyweight",
    difficulty: "intermediate"
  },
  {
    id: 198,
    name: "Frog Pumps",
    category: "isolation",
    primaryMuscles: ["glutes"],
    secondaryMuscles: [],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 199,
    name: "Cable Pull-Throughs",
    category: "compound",
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 200,
    name: "Donkey Calf Raises",
    category: "isolation",
    primaryMuscles: ["calves"],
    secondaryMuscles: [],
    equipment: "machine",
    difficulty: "intermediate"
  },
  {
    id: 201,
    name: "Leg Press Calf Raises",
    category: "isolation",
    primaryMuscles: ["calves"],
    secondaryMuscles: [],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 202,
    name: "Smith Machine Calf Raises",
    category: "isolation",
    primaryMuscles: ["calves"],
    secondaryMuscles: [],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 203,
    name: "Dumbbell Calf Raises",
    category: "isolation",
    primaryMuscles: ["calves"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 204,
    name: "Bodyweight Split Squats",
    category: "compound",
    primaryMuscles: ["quadriceps", "glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 205,
    name: "Barbell Step-Ups",
    category: "compound",
    primaryMuscles: ["glutes", "quadriceps"],
    secondaryMuscles: ["hamstrings"],
    equipment: "barbell",
    difficulty: "intermediate"
  },

  // ===== ADDITIONAL CORE EXERCISES =====
  {
    id: 206,
    name: "Crunches",
    category: "isolation",
    primaryMuscles: ["abs"],
    secondaryMuscles: [],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 207,
    name: "Bicycle Crunches",
    category: "isolation",
    primaryMuscles: ["abs", "obliques"],
    secondaryMuscles: [],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 208,
    name: "Reverse Crunches",
    category: "isolation",
    primaryMuscles: ["abs"],
    secondaryMuscles: ["hip_flexors"],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 209,
    name: "Sit-Ups",
    category: "isolation",
    primaryMuscles: ["abs"],
    secondaryMuscles: ["hip_flexors"],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 210,
    name: "V-Ups",
    category: "isolation",
    primaryMuscles: ["abs"],
    secondaryMuscles: ["hip_flexors"],
    equipment: "bodyweight",
    difficulty: "intermediate"
  },
  {
    id: 211,
    name: "Toe Touches",
    category: "isolation",
    primaryMuscles: ["abs"],
    secondaryMuscles: [],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 212,
    name: "Mountain Climbers",
    category: "compound",
    primaryMuscles: ["core", "abs"],
    secondaryMuscles: ["hip_flexors", "quadriceps"],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 213,
    name: "Dead Bug",
    category: "isolation",
    primaryMuscles: ["core", "abs"],
    secondaryMuscles: [],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 214,
    name: "Bird Dog",
    category: "isolation",
    primaryMuscles: ["core", "lower_back"],
    secondaryMuscles: ["glutes"],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 215,
    name: "Side Plank",
    category: "isolation",
    primaryMuscles: ["obliques", "core"],
    secondaryMuscles: [],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 216,
    name: "Side Plank Dips",
    category: "isolation",
    primaryMuscles: ["obliques"],
    secondaryMuscles: ["core"],
    equipment: "bodyweight",
    difficulty: "intermediate"
  },
  {
    id: 217,
    name: "Copenhagen Plank",
    category: "isolation",
    primaryMuscles: ["inner_thighs", "obliques"],
    secondaryMuscles: ["core"],
    equipment: "bodyweight",
    difficulty: "intermediate"
  },
  {
    id: 218,
    name: "Hollow Body Hold",
    category: "isolation",
    primaryMuscles: ["core", "abs"],
    secondaryMuscles: [],
    equipment: "bodyweight",
    difficulty: "intermediate"
  },
  {
    id: 219,
    name: "L-Sit Hold",
    category: "isolation",
    primaryMuscles: ["abs", "hip_flexors"],
    secondaryMuscles: ["triceps"],
    equipment: "bodyweight",
    difficulty: "advanced"
  },
  {
    id: 220,
    name: "Leg Raises",
    category: "isolation",
    primaryMuscles: ["abs"],
    secondaryMuscles: ["hip_flexors"],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 221,
    name: "Knee Raises",
    category: "isolation",
    primaryMuscles: ["abs"],
    secondaryMuscles: ["hip_flexors"],
    equipment: "bodyweight",
    difficulty: "beginner"
  },
  {
    id: 222,
    name: "Hanging Knee Raises",
    category: "isolation",
    primaryMuscles: ["abs"],
    secondaryMuscles: ["hip_flexors"],
    equipment: "pull_up_bar",
    difficulty: "intermediate"
  },
  {
    id: 223,
    name: "Captain's Chair Leg Raises",
    category: "isolation",
    primaryMuscles: ["abs"],
    secondaryMuscles: ["hip_flexors"],
    equipment: "machine",
    difficulty: "intermediate"
  },
  {
    id: 224,
    name: "Toes to Bar",
    category: "isolation",
    primaryMuscles: ["abs"],
    secondaryMuscles: ["hip_flexors", "lats"],
    equipment: "pull_up_bar",
    difficulty: "advanced"
  },
  {
    id: 225,
    name: "Windshield Wipers",
    category: "isolation",
    primaryMuscles: ["obliques", "abs"],
    secondaryMuscles: ["core"],
    equipment: "pull_up_bar",
    difficulty: "advanced"
  },
  {
    id: 226,
    name: "Cable Oblique Crunches",
    category: "isolation",
    primaryMuscles: ["obliques"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 227,
    name: "Machine Ab Crunches",
    category: "isolation",
    primaryMuscles: ["abs"],
    secondaryMuscles: [],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 228,
    name: "Weighted Sit-Ups",
    category: "isolation",
    primaryMuscles: ["abs"],
    secondaryMuscles: ["hip_flexors"],
    equipment: "dumbbells",
    difficulty: "intermediate"
  },
  {
    id: 229,
    name: "Medicine Ball Slams",
    category: "compound",
    primaryMuscles: ["core", "abs"],
    secondaryMuscles: ["lats", "shoulders"],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 230,
    name: "Suitcase Carries",
    category: "compound",
    primaryMuscles: ["core", "obliques"],
    secondaryMuscles: ["forearms", "traps"],
    equipment: "dumbbells",
    difficulty: "intermediate"
  },

  // ===== ADDITIONAL FOREARM EXERCISES =====
  {
    id: 231,
    name: "Dumbbell Wrist Curls",
    category: "isolation",
    primaryMuscles: ["forearms"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 232,
    name: "Dumbbell Reverse Wrist Curls",
    category: "isolation",
    primaryMuscles: ["forearms"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    difficulty: "beginner"
  },
  {
    id: 233,
    name: "Behind-the-Back Wrist Curls",
    category: "isolation",
    primaryMuscles: ["forearms"],
    secondaryMuscles: [],
    equipment: "barbell",
    difficulty: "beginner"
  },
  {
    id: 234,
    name: "Plate Pinches",
    category: "isolation",
    primaryMuscles: ["forearms"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    difficulty: "intermediate"
  },
  {
    id: 235,
    name: "Dead Hangs",
    category: "isolation",
    primaryMuscles: ["forearms"],
    secondaryMuscles: ["lats"],
    equipment: "pull_up_bar",
    difficulty: "beginner"
  },
  {
    id: 236,
    name: "Towel Pull-Ups",
    category: "compound",
    primaryMuscles: ["lats", "forearms"],
    secondaryMuscles: ["biceps"],
    equipment: "pull_up_bar",
    difficulty: "advanced"
  },

  // ===== SMITH MACHINE EXERCISES =====
  {
    id: 237,
    name: "Smith Machine Bench Press",
    category: "compound",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 238,
    name: "Smith Machine Incline Press",
    category: "compound",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 239,
    name: "Smith Machine Overhead Press",
    category: "compound",
    primaryMuscles: ["front_delts", "side_delts"],
    secondaryMuscles: ["triceps"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 240,
    name: "Smith Machine Rows",
    category: "compound",
    primaryMuscles: ["middle_back"],
    secondaryMuscles: ["lats", "biceps"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 241,
    name: "Smith Machine Lunges",
    category: "compound",
    primaryMuscles: ["quadriceps", "glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 242,
    name: "Smith Machine Hip Thrusts",
    category: "compound",
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 243,
    name: "Smith Machine Romanian Deadlifts",
    category: "compound",
    primaryMuscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["lower_back"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 244,
    name: "Smith Machine Close-Grip Bench Press",
    category: "compound",
    primaryMuscles: ["triceps"],
    secondaryMuscles: ["chest"],
    equipment: "machine",
    difficulty: "beginner"
  },

  // ===== ADDITIONAL MACHINE EXERCISES =====
  {
    id: 245,
    name: "Pec Deck Machine",
    category: "isolation",
    primaryMuscles: ["chest"],
    secondaryMuscles: [],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 246,
    name: "Chest Press Machine",
    category: "compound",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 247,
    name: "Incline Chest Press Machine",
    category: "compound",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 248,
    name: "Low Row Machine",
    category: "compound",
    primaryMuscles: ["lats", "middle_back"],
    secondaryMuscles: ["biceps"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 249,
    name: "High Row Machine",
    category: "compound",
    primaryMuscles: ["lats"],
    secondaryMuscles: ["biceps", "rear_delts"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 250,
    name: "Seated Row Machine",
    category: "compound",
    primaryMuscles: ["middle_back"],
    secondaryMuscles: ["lats", "biceps"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 251,
    name: "Glute Drive Machine",
    category: "compound",
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 252,
    name: "Pendulum Hip Extension",
    category: "isolation",
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: "machine",
    difficulty: "beginner"
  },
  {
    id: 253,
    name: "Glute Kickback Machine",
    category: "isolation",
    primaryMuscles: ["glutes"],
    secondaryMuscles: [],
    equipment: "machine",
    difficulty: "beginner"
  },

  // ===== ADDITIONAL CABLE EXERCISES =====
  {
    id: 254,
    name: "Cable Crossover",
    category: "isolation",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts"],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 255,
    name: "Single-Arm Cable Fly",
    category: "isolation",
    primaryMuscles: ["chest"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 256,
    name: "Cable Y-Raises",
    category: "isolation",
    primaryMuscles: ["rear_delts", "middle_back"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 257,
    name: "Cable External Rotation",
    category: "isolation",
    primaryMuscles: ["rear_delts"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 258,
    name: "Cable Internal Rotation",
    category: "isolation",
    primaryMuscles: ["front_delts"],
    secondaryMuscles: [],
    equipment: "cable",
    difficulty: "beginner"
  },
  {
    id: 259,
    name: "Cable Reverse Flyes",
    category: "isolation",
    primaryMuscles: ["rear_delts"],
    secondaryMuscles: ["middle_back"],
    equipment: "cable",
    difficulty: "beginner"
  },

  // ===== ADDITIONAL CARDIO EXERCISES =====
  {
    id: 1003,
    name: "Elliptical",
    exerciseType: "cardio",
    cardioFields: ["duration", "resistance"],
    category: "cardio",
    primaryMuscles: ["cardio"],
    secondaryMuscles: ["quadriceps", "glutes", "hamstrings"],
    difficulty: "beginner"
  },
  {
    id: 1004,
    name: "Stationary Bike",
    exerciseType: "cardio",
    cardioFields: ["duration", "resistance"],
    category: "cardio",
    primaryMuscles: ["cardio"],
    secondaryMuscles: ["quadriceps", "calves", "hamstrings"],
    difficulty: "beginner"
  },
  {
    id: 1005,
    name: "Rowing Machine",
    exerciseType: "cardio",
    cardioFields: ["duration", "resistance"],
    category: "cardio",
    primaryMuscles: ["cardio"],
    secondaryMuscles: ["lats", "middle_back", "biceps", "quadriceps"],
    difficulty: "intermediate"
  },
  {
    id: 1006,
    name: "Assault Bike",
    exerciseType: "cardio",
    cardioFields: ["duration", "resistance"],
    category: "cardio",
    primaryMuscles: ["cardio"],
    secondaryMuscles: ["quadriceps", "shoulders", "core"],
    difficulty: "intermediate"
  },
  {
    id: 1007,
    name: "Ski Erg",
    exerciseType: "cardio",
    cardioFields: ["duration", "resistance"],
    category: "cardio",
    primaryMuscles: ["cardio"],
    secondaryMuscles: ["lats", "triceps", "core"],
    difficulty: "intermediate"
  },
  {
    id: 1008,
    name: "Jump Rope",
    exerciseType: "cardio",
    cardioFields: ["duration"],
    category: "cardio",
    primaryMuscles: ["cardio"],
    secondaryMuscles: ["calves", "forearms"],
    difficulty: "beginner"
  },
  {
    id: 1009,
    name: "Running (Outdoor)",
    exerciseType: "cardio",
    cardioFields: ["duration", "distance"],
    category: "cardio",
    primaryMuscles: ["cardio"],
    secondaryMuscles: ["quadriceps", "calves", "hamstrings", "glutes"],
    difficulty: "beginner"
  },
  {
    id: 1010,
    name: "Sprints",
    exerciseType: "cardio",
    cardioFields: ["duration", "distance"],
    category: "cardio",
    primaryMuscles: ["cardio"],
    secondaryMuscles: ["quadriceps", "hamstrings", "glutes", "calves"],
    difficulty: "intermediate"
  },
  {
    id: 1011,
    name: "Box Jumps",
    exerciseType: "cardio",
    cardioFields: ["duration"],
    category: "cardio",
    primaryMuscles: ["cardio"],
    secondaryMuscles: ["quadriceps", "glutes", "calves"],
    difficulty: "intermediate"
  },
  {
    id: 1012,
    name: "Burpees",
    exerciseType: "cardio",
    cardioFields: ["duration"],
    category: "cardio",
    primaryMuscles: ["cardio"],
    secondaryMuscles: ["chest", "quadriceps", "core"],
    difficulty: "intermediate"
  },
  {
    id: 1013,
    name: "Cycling (Outdoor)",
    exerciseType: "cardio",
    cardioFields: ["duration", "distance"],
    category: "cardio",
    primaryMuscles: ["cardio"],
    secondaryMuscles: ["quadriceps", "hamstrings", "calves", "glutes"],
    difficulty: "beginner"
  },
  {
    id: 1014,
    name: "Swimming",
    exerciseType: "cardio",
    cardioFields: ["duration", "distance"],
    category: "cardio",
    primaryMuscles: ["cardio"],
    secondaryMuscles: ["lats", "shoulders", "core"],
    difficulty: "intermediate"
  },
  {
    id: 1015,
    name: "Hiking",
    exerciseType: "cardio",
    cardioFields: ["duration", "incline"],
    category: "cardio",
    primaryMuscles: ["cardio"],
    secondaryMuscles: ["quadriceps", "glutes", "calves"],
    difficulty: "beginner"
  },
  {
    id: 1016,
    name: "Incline Walking",
    exerciseType: "cardio",
    cardioFields: ["duration", "incline", "speed"],
    category: "cardio",
    primaryMuscles: ["cardio"],
    secondaryMuscles: ["glutes", "hamstrings", "calves"],
    difficulty: "beginner"
  },
  {
    id: 1017,
    name: "Spin Class",
    exerciseType: "cardio",
    cardioFields: ["duration"],
    category: "cardio",
    primaryMuscles: ["cardio"],
    secondaryMuscles: ["quadriceps", "hamstrings", "glutes"],
    difficulty: "intermediate"
  },
  {
    id: 1018,
    name: "HIIT",
    exerciseType: "cardio",
    cardioFields: ["duration"],
    category: "cardio",
    primaryMuscles: ["cardio"],
    secondaryMuscles: ["core", "quadriceps"],
    difficulty: "advanced"
  },
  {
    id: 1019,
    name: "Jumping Jacks",
    exerciseType: "cardio",
    cardioFields: ["duration"],
    category: "cardio",
    primaryMuscles: ["cardio"],
    secondaryMuscles: ["calves", "shoulders"],
    difficulty: "beginner"
  },
  {
    id: 1020,
    name: "High Knees",
    exerciseType: "cardio",
    cardioFields: ["duration"],
    category: "cardio",
    primaryMuscles: ["cardio"],
    secondaryMuscles: ["hip_flexors", "quadriceps", "core"],
    difficulty: "beginner"
  }
];

// Helper functions for filtering exercises
export const getExercisesByMuscle = (muscle) => {
  return exercises.filter(exercise =>
    exercise.primaryMuscles.includes(muscle) ||
    exercise.secondaryMuscles.includes(muscle)
  );
};

export const getExercisesByEquipment = (equipment) => {
  return exercises.filter(exercise => exercise.equipment === equipment);
};

export const getExercisesByDifficulty = (difficulty) => {
  return exercises.filter(exercise => exercise.difficulty === difficulty);
};

export const getExercisesByCategory = (category) => {
  return exercises.filter(exercise => exercise.category === category);
};

export const searchExercises = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(lowercaseQuery) ||
    exercise.primaryMuscles.some(muscle => muscle.toLowerCase().includes(lowercaseQuery)) ||
    exercise.secondaryMuscles.some(muscle => muscle.toLowerCase().includes(lowercaseQuery))
  );
};

// Cardio exercise helpers
export const isCardioExercise = (exercise) => exercise?.exerciseType === 'cardio';

export const getCardioFields = (exercise) => exercise?.cardioFields || ['duration', 'incline'];

export default exercises;