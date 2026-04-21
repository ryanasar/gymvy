import ExpoModulesCore
import ActivityKit

public class LiveActivityModule: Module {
  private var currentActivity: Any? = nil

  public func definition() -> ModuleDefinition {
    Name("LiveActivityModule")

    Function("isSupported") { () -> Bool in
      if #available(iOS 16.1, *) {
        return ActivityAuthorizationInfo().areActivitiesEnabled
      }
      return false
    }

    AsyncFunction("startWorkout") { (workoutName: String, exerciseName: String, setInfo: String, weight: Double, reps: Int) in
      guard #available(iOS 16.1, *) else { return }
      self.endExistingActivity()

      let attributes = WorkoutAttributes(workoutName: workoutName)
      let state = WorkoutAttributes.ContentState(
        exerciseName: exerciseName,
        setInfo: setInfo,
        weight: weight,
        reps: reps,
        isResting: false,
        restSecondsRemaining: 0
      )
      let content = ActivityContent(state: state, staleDate: nil)
      do {
        let activity = try Activity<WorkoutAttributes>.request(
          attributes: attributes,
          content: content,
          pushType: nil
        )
        self.currentActivity = activity
      } catch {
        print("LiveActivity: Failed to start - \(error.localizedDescription)")
      }
    }

    AsyncFunction("updateExercise") { (exerciseName: String, setInfo: String, weight: Double, reps: Int) in
      guard #available(iOS 16.1, *) else { return }
      guard let activity = self.currentActivity as? Activity<WorkoutAttributes> else { return }
      let state = WorkoutAttributes.ContentState(
        exerciseName: exerciseName,
        setInfo: setInfo,
        weight: weight,
        reps: reps,
        isResting: false,
        restSecondsRemaining: 0
      )
      let content = ActivityContent(state: state, staleDate: nil)
      await activity.update(content)
    }

    AsyncFunction("startRest") { (remainingSeconds: Int) in
      guard #available(iOS 16.1, *) else { return }
      guard let activity = self.currentActivity as? Activity<WorkoutAttributes> else { return }
      var state = activity.content.state
      state.isResting = true
      state.restSecondsRemaining = remainingSeconds
      let content = ActivityContent(state: state, staleDate: nil)
      await activity.update(content)
    }

    AsyncFunction("updateRest") { (remainingSeconds: Int) in
      guard #available(iOS 16.1, *) else { return }
      guard let activity = self.currentActivity as? Activity<WorkoutAttributes> else { return }
      var state = activity.content.state
      state.restSecondsRemaining = remainingSeconds
      let content = ActivityContent(state: state, staleDate: nil)
      await activity.update(content)
    }

    AsyncFunction("endRest") { () in
      guard #available(iOS 16.1, *) else { return }
      guard let activity = self.currentActivity as? Activity<WorkoutAttributes> else { return }
      var state = activity.content.state
      state.isResting = false
      state.restSecondsRemaining = 0
      let content = ActivityContent(state: state, staleDate: nil)
      await activity.update(content)
    }

    AsyncFunction("stopWorkout") { () in
      guard #available(iOS 16.1, *) else { return }
      self.endExistingActivity()
    }

    AsyncFunction("isActive") { () -> Bool in
      guard #available(iOS 16.1, *) else { return false }
      guard let activity = self.currentActivity as? Activity<WorkoutAttributes> else { return false }
      return activity.activityState == .active
    }
  }

  private func endExistingActivity() {
    if #available(iOS 16.1, *) {
      guard let activity = currentActivity as? Activity<WorkoutAttributes> else { return }
      let state = activity.content.state
      let content = ActivityContent(state: state, staleDate: nil)
      Task {
        await activity.end(content, dismissalPolicy: .immediate)
      }
      currentActivity = nil
    }
  }
}
