import sys
import json
from .agent import NeedsAnalysisAgent
from .schemas import NeedsAnalysisResult, AnonymizedChildInput

class NeedsAnalysisService:
    def __init__(self):
        self.agent = NeedsAnalysisAgent()

    def run(self, profile_data: dict) -> dict:
        validated_input = AnonymizedChildInput(**profile_data)
        raw_result = self.agent.analyze_needs(validated_input.model_dump())
        validated_output = NeedsAnalysisResult(**raw_result)
        return validated_output.model_dump()

if __name__ == "__main__":
    try:
        input_data = json.loads(sys.argv[1]) if len(sys.argv) > 1 else json.load(sys.stdin)
        service = NeedsAnalysisService()
        result = service.run(input_data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

