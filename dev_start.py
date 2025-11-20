from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"


def _detect_backend_python() -> list[str]:
    venv_python = BACKEND_DIR / ".venv" / "Scripts" / "python.exe"
    if venv_python.exists():
        return [str(venv_python)]
    # Fallback to current interpreter
    return [sys.executable]


def main() -> None:
    backend_cmd = _detect_backend_python() + [
        "-m",
        "flask",
        "--app",
        "app",
        "run",
        "--debug",
        "--port",
        "8000",
    ]
    backend_env = os.environ.copy()
    backend_env["PYTHONPATH"] = os.pathsep.join(
        filter(None, [str(BACKEND_DIR), backend_env.get("PYTHONPATH")])
    )

    processes: list[subprocess.Popen] = []
    try:
        print("Starting AeroSense backend (Flask)…")
        backend_process = subprocess.Popen(
            backend_cmd,
            cwd=str(BACKEND_DIR),
            env=backend_env,
        )
        processes.append(backend_process)

        print("Starting AeroSense frontend (Vite dev server)…")
        frontend_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=str(FRONTEND_DIR),
        )
        processes.append(frontend_process)

        for process in processes:
            process.wait()
    except KeyboardInterrupt:
        print("\nStopping development servers…")
    finally:
        for process in processes:
            if process.poll() is None:
                process.terminate()
        for process in processes:
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()


if __name__ == "__main__":
    main()


