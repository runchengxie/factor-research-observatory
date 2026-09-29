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
        self.assertEqual(value["schema_version"], "1.0")
        self.assertGreaterEqual(len(value["factors"]), 2)
        self.assertIn("dataset", value)
        self.assertIn("data_version", value)
        self.assertIn("quality", value)
        self.assertIn(value["quality"]["status"], {"pass", "warn", "fail"})
        for factor in value["factors"]:
            self.assertNotIn("ticker", factor)
            self.assertNotIn("weights", factor)
            self.assertIn("coverage", factor)
            self.assertIn("rank_ic", factor)

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
        self.assertIn("alpha810", readme)
        self.assertIn("money-trees", readme)
        self.assertIn("聚合", readme)

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


if __name__ == "__main__":
    unittest.main()
