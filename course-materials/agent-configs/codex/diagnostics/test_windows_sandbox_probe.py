import copy
import importlib.util
from pathlib import Path
import tomllib
import unittest

SPEC = importlib.util.spec_from_file_location("probe", Path(__file__).with_name("windows_sandbox_probe.py"))
probe = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(probe)


class ProbeTests(unittest.TestCase):
    def test_toml_roundtrip_preserves_paths_and_literal_text(self):
        value = {"filesystem": {"C:/synthetic/a b.txt": "deny", ":workspace_roots": {".": "write"}}, "note": 'a "quote"\n$not_a_command'}
        self.assertEqual(tomllib.loads("value = " + probe.toml_literal(value))["value"], value)

    def test_strict_probe_does_not_modify_course_profile(self):
        original = {"course-root": {"extends": ":workspace"}}
        expected = copy.deepcopy(original)
        result = probe.probe_profiles(original, Path("C:/synthetic/denied.txt"))
        self.assertEqual(original, expected)
        self.assertEqual(result["course-probe"]["extends"], "course-root")

    def test_sandbox_command_selects_backend_and_keeps_child_argv(self):
        command = probe.sandbox_command("codex.exe", "elevated", ":workspace", {}, ["python.exe", "a b.py"])
        self.assertIn("features.prefer_mxc=false", command)
        self.assertIn('windows.sandbox="elevated"', command)
        self.assertEqual(command[-3:], ["--", "python.exe", "a b.py"])
        self.assertNotIn("danger-full-access", " ".join(command))

    def test_agent_trial_keeps_workspace_boundary_and_explicit_profile(self):
        command = probe.agent_command("codex.exe", Path("C:/repo"), "elevated", "course-cli-probe", "probe only")
        self.assertIn('default_permissions="course-cli-probe"', command)
        self.assertIn("--ephemeral", command)
        self.assertNotIn("--dangerously-bypass-approvals-and-sandbox", command)

    def test_unknown_backend_is_rejected(self):
        with self.assertRaises(ValueError):
            probe.sandbox_command("codex.exe", "unsafe", ":workspace", {}, [])

    def test_output_summary_does_not_disclose_credentials(self):
        result = probe.summarize(1, "HTTP 401 sk-super-secret", "token=secret-value")
        self.assertIn("http_401", result["error_tags"])
        self.assertNotIn("secret", str(result))

    def test_nested_container_cannot_be_reported_as_host(self):
        with self.assertRaises(RuntimeError):
            probe.require_host({"is_appcontainer": True})
        probe.require_host({"is_appcontainer": False})

    def test_playwright_actions_are_bounded_to_owned_session(self):
        command = probe.playwright_command("playwright-cli.cmd", "course-probe-abc", "open")
        self.assertIn("-s=course-probe-abc", command)
        self.assertIn("about:blank", command)
        with self.assertRaises(ValueError):
            probe.playwright_command("playwright-cli.cmd", "other-session", "close-all")


if __name__ == "__main__":
    unittest.main()
