from .agent import ChildProfileAgent

class ChildProfileService:
    def __init__(self):
        self.agent = ChildProfileAgent()

    def analyze_child(self, data: dict):
        return self.agent.process_profile(data)
