import sys
import json
from .agent import MatchingAgent
from .schemas import MatchCandidateInput, MatchExplanationResult

class MatchingService:
    def __init__(self):
        self.agent = MatchingAgent()

    def generate_explanation(self, candidate_data: dict) -> dict:
        validated_input = MatchCandidateInput(**candidate_data)
        raw_result = self.agent.generate_explanation(
            validated_input.child,
            validated_input.opportunity,
            validated_input.score_breakdown or {}
        )
        validated_output = MatchExplanationResult(**raw_result)
        return validated_output.model_dump()

if __name__ == "__main__":
    try:
        input_data = json.loads(sys.argv[1]) if len(sys.argv) > 1 else json.load(sys.stdin)
        service = MatchingService()
        result = service.generate_explanation(input_data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

