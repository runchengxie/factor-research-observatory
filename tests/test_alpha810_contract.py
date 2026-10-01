import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).parents[1]
SNAPSHOT = ROOT / "site" / "public" / "data" / "alpha810-snapshot.json"


class Alpha810ContractTests(unittest.TestCase):
    def test_snapshot_has_versioned_aggregate_evidence_contract(self):
        value = json.loads(SNAPSHOT.read_text())
        self.assertEqual(value["kind"], "moneytree_factor_evidence_snapshot")
        self.assertEqual(value["schema_version"], "1.1")
        self.assertEqual(len(value["factors"]), 810)
        self.assertIn("dataset", value)
        self.assertEqual(value["dataset"]["date_start"], "2016-01-04")
        self.assertEqual(value["dataset"]["date_end"], "2025-12-30")
        self.assertIn("data_version", value)
        self.assertTrue(value["code_revision"])
        self.assertIn("quality", value)
        self.assertIn(value["quality"]["status"], {"pass", "warn", "fail"})
        self.assertEqual(value["temporal_validation"]["status"], "complete")
        self.assertEqual(value["uncertainty"]["factor_count"], 810)
        self.assertEqual(value["multiple_testing"]["family_size"], 810)
        for factor in value["factors"]:
            self.assertNotIn("ticker", factor)
            self.assertNotIn("weights", factor)
            self.assertIn("coverage", factor)
            self.assertIn("rank_ic", factor)
            self.assertEqual(len(factor["annual_slices"]), 10)
        self.assertTrue(any("point-in-time" in item.lower() for item in value["public_limits"]))

    def test_alpha810_loader_validates_contract_and_uses_static_data(self):
        source = (ROOT / "site" / "src" / "data.ts").read_text()
        self.assertIn("loadAlpha810Snapshot", source)
        self.assertIn("schema_version", source)
        self.assertIn("alpha810-snapshot.json", source)
        self.assertNotRegex(source, re.compile(r"/home/|/Users/|private-panel"))

    def test_alpha810_pages_are_reachable_from_app(self):
        source = (ROOT / "site" / "src" / "App.tsx").read_text()
        self.assertIn("Alpha810OverviewPage", source)
        self.assertIn("Alpha810FactorPage", source)
        self.assertIn("alpha810", source)

    def test_readme_documents_alpha810_public_boundary(self):
        readme = (ROOT / "README.md").read_text()
        chinese_readme = (ROOT / "README.zh-CN.md").read_text()
        self.assertIn("alpha810", readme)
        self.assertIn("money-trees", readme)
        self.assertIn("aggregate", readme)
        self.assertIn("聚合", chinese_readme)

    def test_pull_request_validation_workflow_covers_public_checks(self):
        workflow = (ROOT / ".github" / "workflows" / "validate.yml").read_text()
        self.assertIn("pull_request", workflow)
        self.assertIn("python -m unittest discover", workflow)
        self.assertIn("audit_public_release.py", workflow)
        self.assertIn("npm run build --prefix site", workflow)

    def test_external_snapshot_workflow_is_manual_and_audited(self):
        workflow = (ROOT / ".github" / "workflows" / "validate-external-snapshot.yml").read_text()
        self.assertIn("workflow_dispatch", workflow)
        self.assertIn("validate_external_snapshot.py", workflow)
        self.assertIn("upload-artifact@v4", workflow)

    def test_external_snapshot_publish_workflow_opens_review_pr(self):
        workflow = (ROOT / ".github" / "workflows" / "publish-external-snapshot.yml").read_text()
        self.assertIn("workflow_dispatch", workflow)
        self.assertIn("contents: write", workflow)
        self.assertIn("pull-requests: write", workflow)
        self.assertIn("gh pr create", workflow)
        self.assertIn("alpha810-snapshot.json", workflow)
        self.assertIn("Candidate snapshot is unchanged", workflow)


if __name__ == "__main__":
    unittest.main()
