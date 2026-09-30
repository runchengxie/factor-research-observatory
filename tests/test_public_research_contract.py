import json
import re
import subprocess
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
    def test_demo_factor_group_counts_match_published_rows(self):
        snapshot = json.loads((PUBLIC_DATA / "factor-snapshot.json").read_text())
        self.assertEqual(sum(group["count"] for group in snapshot["factor_groups"]), len(snapshot["factors"]))

    def test_research_publication_manifest_is_a_redacted_projection_contract(self):
        manifest = json.loads((PUBLIC_DATA / "research-publication-manifest.json").read_text())
        self.assertEqual(manifest["schema_version"], "observatory.research_publication.v1")
        self.assertEqual(manifest["source_repository"], "quant-research")
        self.assertTrue(manifest["projections"])
        for projection in manifest["projections"]:
            self.assertRegex(projection["source_ref"], r"^doc:quant-research\.")
            self.assertEqual(set(projection["locales"]), {"en-US", "zh-CN"})
            excluded = " ".join(projection["excluded_fields"])
            self.assertIn("per_security_signals", excluded)

    def test_research_publication_manifest_contains_no_private_paths_or_credentials(self):
        text = (PUBLIC_DATA / "research-publication-manifest.json").read_text()
        self.assertNotRegex(text, re.compile(r"/home/|/Users/|private-panel|(?:api|access|secret)[_-]?key", re.I))

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

    def test_study_pages_keep_evidence_status_and_avoid_unreviewed_payroll_metrics(self):
        catalog = json.loads((PUBLIC_DATA / "research-studies.json").read_text())
        studies = {study["id"]: study for study in catalog["studies"]}
        self.assertEqual(
            set(studies), {"pb-roe", "rd-investment", "employee-compensation", "cashflow-indices"}
        )
        self.assertEqual(studies["pb-roe"]["status"], "historical-reviewed")
        self.assertEqual(len(studies["pb-roe"]["rows"]), 5)
        self.assertEqual(studies["rd-investment"]["status"], "preliminary")
        self.assertIn("历史重建", studies["rd-investment"]["source_note"])
        self.assertEqual(studies["employee-compensation"]["status"], "hypothesis")
        self.assertEqual(studies["employee-compensation"]["rows"], [])
        self.assertEqual(studies["cashflow-indices"]["status"], "preliminary")
        self.assertEqual(len(studies["cashflow-indices"]["rows"]), 2)

    def test_study_pages_publish_complete_english_copy(self):
        catalog = json.loads((PUBLIC_DATA / "research-studies.json").read_text())
        required = {"title", "family", "status_label", "summary", "period", "source_note", "columns", "rows", "findings", "limits"}
        for study in catalog["studies"]:
            self.assertIn("translations", study)
            self.assertIn("en-US", study["translations"])
            self.assertEqual(set(study["translations"]["en-US"]), required, study["id"])
            english = study["translations"]["en-US"]
            self.assertTrue(all(len(row) == len(english["columns"]) for row in english["rows"]), study["id"])

    def test_rd_study_translations_and_public_method_note_are_consistent(self):
        catalog = json.loads((PUBLIC_DATA / "research-studies.json").read_text())
        study = next(item for item in catalog["studies"] if item["id"] == "rd-investment")
        english = study["translations"]["en-US"]
        self.assertEqual(len(english["findings"]), len(set(english["findings"])))
        self.assertTrue(any("R&D growth" in item and "revenue" in item for item in english["findings"]))
        self.assertIn("reserved-window", " ".join(english["limits"]))
        self.assertEqual(study["source_url"], "research/rd-investment-method.html")
        note = (ROOT / "site" / "public" / study["source_url"]).read_text()
        for required_claim in ("revision_safe=false", "2020-01-23", "retrospective reserved-window diagnostic", "2015"):
            self.assertIn(required_claim, note)
        self.assertNotIn("/home/", note)

    def test_cashflow_study_is_backed_by_a_stable_source_projection(self):
        manifest = json.loads((PUBLIC_DATA / "research-publication-manifest.json").read_text())
        projection = next(
            item for item in manifest["projections"] if item["public_id"] == "cashflow-indices"
        )
        self.assertEqual(
            projection["source_ref"], "doc:quant-research.research.cashflow-indices"
        )
        self.assertIn("aggregate_rows", projection["allowed_fields"])
        self.assertIn("per_security_signals", projection["excluded_fields"])
        self.assertIn("portfolio_weights", projection["excluded_fields"])

    def test_public_pages_do_not_render_formula_fields(self):
        source = "\n".join(path.read_text() for path in PUBLIC_SOURCE.rglob("*.tsx"))
        self.assertNotRegex(source, re.compile(r"factor\.formula|formulaLatex|<code>\{factor\.formula"))

    def test_public_tree_excludes_private_implementation_and_internal_docs(self):
        tracked = set(subprocess.check_output(['git', 'ls-files'], cwd=ROOT, text=True).splitlines())
        allowed_roots = {'.gitignore', 'README.md', 'README.zh-CN.md', 'AGENTS.md'}
        allowed_prefixes = ('.github/', 'docs/', 'scripts/', 'site/', 'tests/')
        self.assertEqual(sorted(path for path in tracked if path not in allowed_roots and not path.startswith(allowed_prefixes)), [])

    def test_public_docs_are_part_of_the_release_contract(self):
        contract = ROOT / "docs" / "alpha810-public-contract.md"
        self.assertTrue(contract.exists())
        text = contract.read_text()
        self.assertIn("schema_version", text)
        self.assertIn("逐股票", text)

    def test_public_release_audit_passes(self):
        from scripts.audit_public_release import audit

        self.assertEqual(audit(), [])


if __name__ == "__main__":
    unittest.main()
