import argparse
from dataclasses import dataclass
from importlib.machinery import SourceFileLoader
from pathlib import Path
import signal
import time
from typing import Tuple

from aoc import load, get_year_day
from rich.live import Live
from rich.panel import Panel
from rich.rule import Rule
from rich.spinner import Spinner
from rich.table import Table


def run_day(path: Path):
    module = SourceFileLoader("day", str(path)).load_module()
    year, day = get_year_day(path)
    Cell = Rule | str | None
    rows: list[Tuple[Cell, Cell, Cell]] = []

    def format_result(result, expected):
        if result == expected:
            return f"[green]{result}"
        elif expected is None:
            return f"[yellow]{result}"
        else:
            return f"[red]{result}[/] != [green]{expected}"

    def format_duration(seconds):
        if seconds >= 1:
            return f"{seconds:.2f}s"
        elif seconds > 0.001:
            return f"{seconds * 1000:.0f}ms"
        else:
            return "< 1ms"

    def render():
        table = Table.grid(padding=(0, 1))
        table.add_column("Part")
        table.add_column("Result", min_width=3)
        table.add_column("Time", style="dim", min_width=8, justify="right")
        for row in rows:
            table.add_row(*row)
        return Panel.fit(table, title=f"{year}/{day}", title_align="left")

    def run(solvers, show_part=True):
        success = True
        if not isinstance(solvers, list):
            solvers = [solvers]
        for solver in solvers:
            input = load(day_file=path, suffix=solver.suffix)
            for part, [fn, expected] in enumerate(solver, start=1):
                if fn is None:
                    continue
                row = [f"{part}:" if show_part else None, Spinner("line"), None]
                rows.append(row)
                live.update(render())
                start = time.time()
                result = fn(input)
                duration = time.time() - start
                if result != expected:
                    success = False
                row[1] = format_result(result, expected)
                row[2] = format_duration(duration)
                live.update(render())
        return success

    with Live(refresh_per_second=8) as live:

        def term_handler(num, frame):
            if any(isinstance(c, Spinner) for c in rows[-1]):
                rows[-1][1] = "[dim red]KILLED"
                live.update(render())
            raise SystemExit(1)

        signal.signal(signal.SIGTERM, term_handler)

        if hasattr(module, "examples"):
            success = run(module.examples, show_part=False)
            if success:
                rows = []
            else:
                rows.append((Rule(style="dim"),) * 3)
        if hasattr(module, "parts"):
            run(module.parts)
        else:
            rows.append(("[red]𐄂", "cannot import 'parts'", None))
            live.update(render())


def run_year(path: Path):
    raise NotImplementedError()


def run_all_years():
    raise NotImplementedError()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "path",
        nargs="?",
        help="Relative path to either a year's directory or a single day's file.",
    )
    args = parser.parse_args()

    if args.path:
        path = Path(args.path)
        if not path.exists():
            parser.error(f"{path}: file not found")
            raise
        elif path.is_file():
            run_day(path)
        elif path.is_dir():
            run_year(path)
    else:
        run_all_years()
