import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).parents[1]
PUBLIC_DATA = ROOT / "site" / "public" / "data"
PUBLIC_SOURCE = ROOT / "site" / "src"


def _factor_rows(value):
    if isinstance(value, dict) and isinstance(value.get("factors"), list):
        return value["factors"]
    return []


class PublicResearchContractTests(unittest.TestCase):
    def test_public_factor_artifacts_do_not_expose_exact_operators(self):
        for path in sorted(PUBLIC_DATA.glob("*.json")):
            value = json.loads(path.read_text())
            for factor in _factor_rows(value):
                self.assertNotIn("formula", factor, path.name)
                self.assertNotIn("formulaLatex", factor, path.name)
                self.assertNotIn("data_requirements", factor, path.name)

    def test_public_catalog_has_research_definition_and_labor_family(self):
        catalog = json.loads((PUBLIC_DATA / "fundamental-factor-catalog.json").read_text())
        self.assertTrue(all(factor.get("definition") for factor in catalog["factors"]))
        self.assertTrue(all(factor.get("research_status") for factor in catalog["factors"]))
        self.assertIn("人力资本 / 劳动", {factor["family"] for factor in catalog["factors"]})
        labor = [factor for factor in catalog["factors"] if factor["family"] == "人力资本 / 劳动"]
        self.assertTrue(all(factor["research_status"] == "experimental" for factor in labor))
        self.assertTrue(all("rank_ic" not in factor for factor in labor))

    def test_public_pages_do_not_render_formula_fields(self):
        source = "\n".join(path.read_text() for path in PUBLIC_SOURCE.rglob("*.tsx"))
        self.assertNotRegex(source, re.compile(r"factor\.formula|formulaLatex|<code>\{factor\.formula"))


if __name__ == "__main__":
    unittest.main()
