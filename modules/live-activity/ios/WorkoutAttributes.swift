import ActivityKit

@available(iOS 16.1, *)
public struct WorkoutAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    var exerciseName: String
    var setInfo: String
    var weight: Double
    var reps: Int
    var isResting: Bool
    var restSecondsRemaining: Int
  }

  var workoutName: String
}
