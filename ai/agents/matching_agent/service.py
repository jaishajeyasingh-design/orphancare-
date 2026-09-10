from .agent import MatchingAgent

class MatchingService:
    def __init__(self):
        self.agent = MatchingAgent()

    def run_match(self, child_id: str, opportunity_ids: list):
        return self.agent.match(child_id, opportunity_ids)
