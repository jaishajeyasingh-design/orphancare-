from .agent import DevelopmentPlanAgent

class DevelopmentPlanService:
    def __init__(self):
        self.agent = DevelopmentPlanAgent()

    def generate(self, child_id: str, goals: list):
        return self.agent.create_plan(child_id, goals)
