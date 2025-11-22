from .strategy import LevelServiceStrategy

class LevelContext:
    def __init__(self, strategy: LevelServiceStrategy):
        self.strategy = strategy

    def set_strategy(self, strategy: LevelServiceStrategy):
        self.strategy = strategy

    def evaluate_level_test(self, db, user, payload):
        return self.strategy.evaluate_level_test(db, user, payload)

    def evaluate_session_feedback(self, db, user, payload):
        return self.strategy.evaluate_session_feedback(db, user, payload)

    def set_manual_level(self, db, user, payload):
        return self.strategy.set_manual_level(db, user, payload)