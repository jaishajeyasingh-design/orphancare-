from .agent import OpportunityAgent

class OpportunityService:
    def __init__(self):
        self.agent = OpportunityAgent()

    def process(self, data: dict):
        return self.agent.parse_opportunity(data)
