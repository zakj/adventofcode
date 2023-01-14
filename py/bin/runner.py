import argparse
import cProfile
import pstats
import signal
import sys
import time
from collections.abc import Callable
from dataclasses import dataclass
from importlib.machinery import SourceFileLoader
from pathlib import Path
from typing import cast

from aoc import Solver, get_year_day, load
from rich import box
from rich.columns import Columns
from rich.console import RenderableType, RenderResult
from rich.live import Live
from rich.measure import Measurement
from rich.panel import Panel
from rich.rule import Rule
from rich.spinner import Spinner
from rich.table import Table


@dataclass
class R:
    renderable: RenderableType = ""

    def __rich_console__(self, console, options) -> RenderResult:
        yield self.renderable

    def __rich_measure__(self, console, options) -> Measurement:
        return Measurement.get(console, options, self.renderable)

    def set(self, value: RenderableType) -> None:
        self.renderable = value


def format_duration(seconds: float):
    color = "red" if seconds > 0.5 else "yellow" if seconds > 0.1 else "dim"
    value = (
        f"{seconds:.2f}s"
        if seconds >= 1
        else f"{seconds * 1000:.0f}ms"
        if seconds > 0.001
        else "< 1ms"
    )
    return f"[{color}]{value}[/]"


def with_duration(fn: Callable, *args):
    start = time.time()
    result = fn(*args)
    return result, time.time() - start


def run_day(path: Path):
    module = SourceFileLoader("day", str(path)).load_module()
    year, day = get_year_day(path)
    panel = Panel.fit("", title=f"{year}/{day}", title_align="left")
    group = Columns([panel])

    def make_table():
        table = Table.grid(padding=(0, 1))
        table.add_column("Part")
        table.add_column("Result", min_width=3)
        table.add_column("Time", min_width=8, justify="right")
        return table

    def term_handler(num, frame):
        panel.border_style = "dim"
        raise SystemExit(1)

    def format_result(result, expected):
        return (
            f"[green]{result}"
            if result == expected
            else f"[yellow]{result}"
            if expected is None
            else f"[red]{result}[/] != [green]{expected}"
        )

    signal.signal(signal.SIGTERM, term_handler)

    with Live(group, refresh_per_second=8):
        # Avoid flash of wide table on first render.
        panel.renderable = table = make_table()

        if hasattr(module, "examples"):
            success = True
            for solver in module.examples:
                input = load(day_file=solver.path, suffix=solver.suffix)
                result_r = R(Spinner("line"))
                duration_r = R()
                table.add_row("", result_r, duration_r)
                result, duration = with_duration(solver.fn, input)
                result_r.set(format_result(result, solver.expected))
                duration_r.set(format_duration(duration))
                if result != solver.expected:
                    success = False

            # Hide example results if all pass.
            if success:
                panel.renderable = table = make_table()
            else:
                table.add_row(*[Rule(style="dim")] * 3)

        if not hasattr(module, "parts"):
            table.add_row("[red]𐄂", "cannot import 'parts'", "")
            return

        for part, solver in enumerate(cast(list[Solver], module.parts), start=1):
            input = load(day_file=solver.path, suffix=solver.suffix)
            result_r = R(Spinner("line"))
            duration_r = R()
            table.add_row(f"{part}:", result_r, duration_r)
            if solver.should_profile:
                result, stats_table = profile(solver, input)
                group.add_renderable(stats_table)
                result_r.set(format_result(result, solver.expected))
                duration_r.set("->")
            else:
                result, duration = with_duration(solver.fn, input)
                result_r.set(format_result(result, solver.expected))
                duration_r.set(format_duration(duration))


def profile(solver: Solver, input: str):
    base_dir = Path(__file__).parent.parent

    def line(p: pstats.FunctionProfile):
        name = Path(p.file_name)
        if p.file_name == "~":
            return p.file_name
        if name == solver.path:
            return str(p.line_number)
        if name.is_relative_to(base_dir):
            name = name.relative_to(base_dir)
        else:
            lib = next((d for d in sys.path if name.is_relative_to(d)), None)
            if lib:
                name = "/" / name.relative_to(lib)
        return f"{name}:{p.line_number}"

    profile = cProfile.Profile()
    profile.enable()
    rv = solver.fn(input)
    profile.create_stats()

    table = Table(box=box.ROUNDED)
    table.add_column("line")
    table.add_column("function")
    table.add_column("total time", justify="right")
    table.add_column("calls", justify="right")
    profiles = pstats.Stats(profile).get_stats_profile().func_profiles
    items = sorted(
        profiles.items(), key=lambda np: (np[1].tottime, np[1].ncalls), reverse=True
    )
    for name, p in items[:5]:
        table.add_row(line(p), name, str(p.tottime), p.ncalls)
    return rv, table


def run_year(path: Path):
    table = Table.grid(padding=(0, 2))
    table.add_column("Day")
    table.add_column("Part 1", justify="right")
    table.add_column("Part 2", justify="right")
    panel = Panel.fit(
        table,
        title=f"[bright_white italic]{path.name}",
        title_align="left",
        subtitle_align="right",
        border_style="dim",
    )
    stars = 0

    def add_star():
        nonlocal stars
        stars += 1
        panel.subtitle = f"[bright_yellow]{stars}*"

    with Live(panel, refresh_per_second=8, vertical_overflow="visible") as live:
        for day in range(1, 26):
            day_file = path / f"day{day:02}.py"
            cells = [R("[dim]-")]
            if day < 25:
                cells.append(R("[dim]-"))
            table.add_row(f"Day {day}", *cells)

            if not day_file.exists():
                continue

            try:
                module = SourceFileLoader(f"day{day}", str(day_file)).load_module()
            except:
                cells[0].set("[red]Load failed ×")
                continue

            if not hasattr(module, "parts"):
                continue

            # TODO: run examples just to be sure?

            for part, solver in enumerate(module.parts):
                input = load(day_file=day_file, suffix=solver.suffix)
                if part >= len(cells):
                    live.console.print(f"[red]+[/] Extra parts in {day_file.name}")
                    break
                cells[part].set(Spinner("line"))
                try:
                    result, duration = with_duration(solver.fn, input)
                    success = "[green]✓" if result == solver.expected else "[red]×"
                    cells[part].set(" ".join([format_duration(duration), success]))
                    if result == solver.expected:
                        add_star()
                except:
                    cells[part].set(f"[red]Exception ×")
        if stars >= 49:
            add_star()


def run_all_years():
    path = Path(__file__).parent.parent
    years = sorted(d for d in path.glob("[0-9]*") if d.is_dir())
    for year_dir in years:
        run_year(year_dir)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "path",
        nargs="?",
        help="Relative path to either a year's directory or a single day's file.",
    )
    args = parser.parse_args()

    try:
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
    except KeyboardInterrupt:
        pass
