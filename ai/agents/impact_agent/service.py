from .agent import ImpactAgent

class ImpactService:
    def __init__(self):
        self.agent = ImpactAgent()

    def evaluate(self, metrics: dict):
        return self.agent.evaluate_impact(metrics)
