from .agent import NeedsAnalysisAgent

class NeedsAnalysisService:
    def __init__(self):
        self.agent = NeedsAnalysisAgent()

    def run(self, child_id: str, data: dict):
        return self.agent.analyze_needs(child_id, data)
