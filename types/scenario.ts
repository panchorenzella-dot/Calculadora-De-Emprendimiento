export type ScenarioValue = string | number | boolean | null;

export type ScenarioData = Record<
  string,
  ScenarioValue | ScenarioValue[] | Record<string, ScenarioValue>
>;

export type ScenarioDraft = {
  calculatorType: string;
  calculatorName: string;
  calculatorPath: string;
  inputs: ScenarioData;
  results: ScenarioData;
};

export type SavedScenario = {
  id: string;
  user_id: string;
  calculator_type: string;
  title: string | null;
  inputs: ScenarioData;
  results: ScenarioData;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
