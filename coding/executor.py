import tempfile
import subprocess
import os

def run_code(code, language, stdin=""):
    language = language.lower()
    
    # Pre-process stdin to convert JSON arrays (like "[1, 2, 3]") into space-separated strings ("1 2 3")
    # This ensures standard input().split() logic works as expected in competitive programming.
    try:
        import json
        parsed = json.loads(stdin)
        if isinstance(parsed, list):
            stdin = " ".join(map(str, parsed))
    except Exception:
        pass

    if language not in ["python", "javascript"]:
        return {
            "stdout": "",
            "stderr": f"{language} is currently not supported on this environment.",
            "compile_output": "",
            "message": "",
            "status": {
                "id": 0,
                "description": "Unsupported Language"
            }
        }

    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            if language == "python":
                file_path = os.path.join(temp_dir, "script.py")
                command = ["python", file_path]
            elif language == "javascript":
                file_path = os.path.join(temp_dir, "script.js")
                command = ["node", file_path]

            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)

            process = subprocess.run(
                command,
                input=stdin,
                text=True,
                capture_output=True,
                timeout=10
            )

            stdout = process.stdout
            stderr = process.stderr
            status_id = 3 if process.returncode == 0 else 4
            description = "Accepted" if process.returncode == 0 else "Runtime Error"

            return {
                "stdout": stdout,
                "stderr": stderr,
                "compile_output": "",
                "message": "",
                "status": {
                    "id": status_id,
                    "description": description
                }
            }

    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": "Execution Timeout",
            "compile_output": "",
            "message": "",
            "status": {
                "id": 13,
                "description": "Timeout"
            }
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": str(e),
            "compile_output": "",
            "message": "",
            "status": {
                "id": 500,
                "description": "Internal Error"
            }
        }