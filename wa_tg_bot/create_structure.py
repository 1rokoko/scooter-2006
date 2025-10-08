"""Script to create project structure"""
import os
from pathlib import Path

# Define project structure
structure = {
    "src": {
        "whatsapp": ["__init__.py", "bot.py", "handlers.py"],
        "telegram": ["__init__.py", "bot.py", "handlers.py"],
        "core": ["__init__.py", "base.py", "state_manager.py", "message_processor.py", "router.py"],
        "integrations": ["__init__.py", "directus.py", "ai.py"],
        "utils": ["__init__.py", "logger.py", "validators.py"],
        "__init__.py": None,
        "config.py": None,
        "main.py": None,
    },
    "tests": {
        "__init__.py": None,
        "test_whatsapp.py": None,
        "test_telegram.py": None,
        "test_directus.py": None,
        "test_integration.py": None,
    },
    "docs": [],
    "sessions": [],
}

def create_structure(base_path: Path, structure: dict):
    """Recursively create directory structure"""
    for name, content in structure.items():
        path = base_path / name
        
        if isinstance(content, dict):
            # It's a directory with subdirectories/files
            path.mkdir(parents=True, exist_ok=True)
            create_structure(path, content)
        elif isinstance(content, list):
            # It's a directory with files
            path.mkdir(parents=True, exist_ok=True)
            for file in content:
                if file:
                    (path / file).touch()
        elif content is None:
            # It's a file
            path.parent.mkdir(parents=True, exist_ok=True)
            path.touch()

if __name__ == "__main__":
    base = Path(__file__).parent
    create_structure(base, structure)
    print("✅ Project structure created successfully!")

