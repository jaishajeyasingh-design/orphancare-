import sys
import json
from .agent import DevelopmentPlanAgent
from .schemas import DevelopmentPlanInput, DevelopmentPlanResult

class DevelopmentPlanService:
    def __init__(self):
        self.agent = DevelopmentPlanAgent()

    def generate(self, payload: dict) -> dict:
        validated_input = DevelopmentPlanInput(**payload)
        raw_result = self.agent.create_plan(
            validated_input.child,
            validated_input.approved_opportunities or []
        )
        validated_output = DevelopmentPlanResult(**raw_result)
        return validated_output.model_dump()

if __name__ == "__main__":
    try:
        input_data = json.loads(sys.argv[1]) if len(sys.argv) > 1 else json.load(sys.stdin)
        service = DevelopmentPlanService()
        result = service.generate(input_data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

