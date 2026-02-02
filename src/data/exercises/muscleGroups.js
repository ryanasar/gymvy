// Muscle Groups Database
export const muscleGroups = {
  // ===== UPPER BODY =====
  chest: {
    name: "Chest",
    category: "upper_body",
    description: "Pectoralis major and minor muscles",
    color: "#FF6B6B",
    icon: "🫀"
  },

  shoulders: {
    name: "Shoulders",
    category: "upper_body",
    description: "Deltoid muscle group",
    color: "#FFD166",
    icon: "🏋️"
  },

  front_delts: {
    name: "Front Deltoids",
    category: "upper_body",
    description: "Anterior shoulder muscles",
    color: "#96CEB4",
    icon: "🤲"
  },

  side_delts: {
    name: "Side Deltoids",
    category: "upper_body",
    description: "Lateral shoulder muscles",
    color: "#FECA57",
    icon: "🤲"
  },

  rear_delts: {
    name: "Rear Deltoids",
    category: "upper_body",
    description: "Posterior shoulder muscles",
    color: "#FF9FF3",
    icon: "🤲"
  },

  lats: {
    name: "Lats",
    category: "upper_body",
    description: "Latissimus dorsi muscles",
    color: "#4ECDC4",
    icon: "🔙"
  },

  rhomboids: {
    name: "Rhomboids",
    category: "upper_body",
    description: "Upper back muscles between shoulder blades",
    color: "#45B7D1",
    icon: "🔙"
  },

  middle_back: {
    name: "Middle Back",
    category: "upper_body",
    description: "Mid-back musculature",
    color: "#2196F3",
    icon: "🔙"
  },

  traps: {
    name: "Traps",
    category: "upper_body",
    description: "Trapezius muscles",
    color: "#FF5722",
    icon: "🔙"
  },

  lower_back: {
    name: "Lower Back",
    category: "upper_body",
    description: "Erector spinae muscles",
    color: "#795548",
    icon: "🔙"
  },

  biceps: {
    name: "Biceps",
    category: "upper_body",
    description: "Front arm muscles",
    color: "#54A0FF",
    icon: "💪"
  },

  triceps: {
    name: "Triceps",
    category: "upper_body",
    description: "Back arm muscles",
    color: "#5F27CD",
    icon: "💪"
  },

  forearms: {
    name: "Forearms",
    category: "upper_body",
    description: "Lower arm muscles",
    color: "#00D2D3",
    icon: "🖐️"
  },

  // ===== LOWER BODY =====
  quadriceps: {
    name: "Quadriceps",
    category: "lower_body",
    description: "Front thigh muscles",
    color: "#FF6B6B",
    icon: "🦵"
  },

  hamstrings: {
    name: "Hamstrings",
    category: "lower_body",
    description: "Back thigh muscles",
    color: "#4ECDC4",
    icon: "🦵"
  },

  glutes: {
    name: "Glutes",
    category: "lower_body",
    description: "Hip extensor muscles",
    color: "#45B7D1",
    icon: "🍑"
  },

  calves: {
    name: "Calves",
    category: "lower_body",
    description: "Lower leg muscles",
    color: "#96CEB4",
    icon: "🦵"
  },

  ankles: {
    name: "Ankles",
    category: "lower_body",
    description: "Ankle stabilizer muscles",
    color: "#A3CB38",
    icon: "🦶"
  },

  inner_thighs: {
    name: "Inner Thighs",
    category: "lower_body",
    description: "Adductor muscles",
    color: "#E91E63",
    icon: "🦵"
  },

  // ===== CORE =====
  core: {
    name: "Core",
    category: "core",
    description: "Trunk stabilizer muscles",
    color: "#FECA57",
    icon: "🏋️"
  },

  abs: {
    name: "Abdominals",
    category: "core",
    description: "Rectus abdominis muscles",
    color: "#FF9FF3",
    icon: "🏋️"
  },

  obliques: {
    name: "Obliques",
    category: "core",
    description: "Rotational abdominal muscles",
    color: "#FFC107",
    icon: "🏋️"
  },

  hip_flexors: {
    name: "Hip Flexors",
    category: "core",
    description: "Hip flexion muscles",
    color: "#8BC34A",
    icon: "🦵"
  },

  // ===== CARDIO =====
  cardio: {
    name: "Cardio",
    category: "cardio",
    description: "Cardiovascular exercises",
    color: "#FF5722",
    icon: "❤️"
  }
};


export const muscleCategories = {
  upper_body: {
    name: "Upper Body",
    muscles: [
      "chest",
      "shoulders",
      "front_delts",
      "side_delts",
      "rear_delts",
      "lats",
      "rhomboids",
      "middle_back",
      "traps",
      "lower_back",
      "biceps",
      "triceps",
      "forearms"
    ]
  },

  lower_body: {
    name: "Lower Body",
    muscles: [
      "quadriceps",
      "hamstrings",
      "glutes",
      "calves",
      "ankles",
      "inner_thighs"
    ]
  },

  core: {
    name: "Core",
    muscles: [
      "core",
      "abs",
      "obliques",
      "hip_flexors"
    ]
  }
};

// Helper functions
export const getMusclesByCategory = (category) => {
  return muscleCategories[category]?.muscles || [];
};

export const getMuscleInfo = (muscleKey) => {
  return muscleGroups[muscleKey];
};

export const getAllMuscleGroups = () => {
  return Object.keys(muscleGroups).map(key => ({
    key,
    ...muscleGroups[key]
  }));
};

export default muscleGroups;