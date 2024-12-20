import time
from pathlib import Path
from typing import Any, NamedTuple

from rich import box
from rich.columns import Columns
from rich.console import Group
from rich.live import Live
from rich.panel import Panel
from rich.rule import Rule
from rich.spinner import Spinner
from rich.table import Table

from .websocket import Aside


class DayRun(NamedTuple):
    result: str
    duration: str
    is_correct: bool


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


def format_result(result, expected):
    return (
        f"[green]{result}"
        if result == expected
        else f"[yellow]{result}"
        if expected is None
        else f"[red]{result}[/] != [green]{expected}"
    )


class BaseUI:
    live: Live
    done: bool
    run_started_at: float

    def __init__(self) -> None:
        self.live = Live(self, refresh_per_second=8)
        self.done = False
        self.run_started_at = time.time()

    def __enter__(self):
        self.live.__enter__()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.done = True
        self.live.__exit__(exc_type, exc_val, exc_tb)

    def __rich__(self):
        raise NotImplementedError

    def complete(self, result: Any, expected: Any, duration: float) -> None:
        raise NotImplementedError

    def error(self) -> None:
        raise NotImplementedError

    def start_run(self) -> None:
        self.run_started_at = time.time()

    def status(self, message: str) -> None:
        return  # default to ignore

    def aside(self, aside: Aside) -> None:
        return  # default to ignore


class Year(BaseUI):
    stars: int
    title: str
    days: list[tuple[str, list[str]]]

    def __init__(self, year: str):
        super().__init__()
        self.stars = 0
        self.title = year
        self.days = []

    def __rich__(self):
        table = Table(box=box.ROUNDED, show_header=False)
        table.add_column("Day")
        table.add_column("Part 1", justify="right")
        table.add_column("Part 2", justify="right")

        for day, parts in self.days:
            table.add_row(f"Day {day}", *parts)
        table.add_section()
        table.add_row(
            f"[bright_white italic]{self.title}", "", f"[bright_yellow]{self.stars}*"
        )
        return table

    def start_day(self, day: str):
        self.days.append((day, []))

    def complete(self, result, expected, duration):
        _, parts = self.days[-1]
        success = "[green]✓" if result == expected else "[red]×"
        parts.append(" ".join([format_duration(duration), success]))
        if result == expected:
            self.stars += 1
            # Day 25 only has one part, the last star is free.
            if self.stars == 49:
                self.stars = 50

    def error(self):
        _, parts = self.days[-1]
        parts.append("[red]Error ×")


class Day(BaseUI):
    asides: Group
    last_status: str = ""
    main_start: int | None
    runs: list[DayRun]
    title: str

    def __init__(self, path: Path):
        super().__init__()
        self.asides = Group()
        self.main_start = None
        self.runs = []
        self.title = "/".join(path.parts[-2:])

    # TODO: cache repeated runs?
    def __rich__(self):
        table = Table.grid(padding=(0, 1))
        table.add_column("Part")
        table.add_column("Result", min_width=3)
        table.add_column("Time", min_width=8, justify="right")

        i = len(self.runs) if self.main_start is None else self.main_start
        example_runs = self.runs[:i]
        main_runs = self.runs[i:]

        # Don't show examples if they're finished and they all succeeded. If
        # any of them failed, show them all with a dim rule between sections.
        any_example_failed = any(not r.is_correct for r in example_runs)
        if self.main_start is None or any_example_failed:
            for row in example_runs:
                table.add_row("", row.result, row.duration)
            if any_example_failed and self.main_start is not None:
                table.add_row(*[Rule(style="dim")] * 3)

        # Main output.
        for i, row in enumerate(main_runs):
            table.add_row(f"{i + 1}:", row.result, row.duration)

        # Loading spinner, showing the part number when appropriate.
        if not self.done:
            cols = [
                self.last_status or Spinner("line"),
                format_duration(time.time() - self.run_started_at),
            ]
            if self.main_start is None:
                table.add_row(*cols)
            else:
                table.add_row(f"{len(main_runs) + 1}:", *cols)

        panel = Panel.fit(table, title=self.title, title_align="left")
        return Columns([panel, self.asides])

    def finish_examples(self):
        self.main_start = len(self.runs)

    def complete(self, result, expected, duration):
        self.last_status = ""
        self.runs.append(
            DayRun(
                format_result(result, expected),
                format_duration(duration),
                result == expected,
            )
        )

    def error(self):
        self.last_status = ""
        self.runs.append(DayRun("[red]Error", "[red]×", False))

    def status(self, message: str) -> None:
        self.last_status = message

    def aside(self, aside: Aside):
        if self.main_start is None:
            return
        table = Table(*aside["header"], box=box.ROUNDED)
        for row in aside["rows"]:
            table.add_row(*row)
        run = self.runs[-1]
        self.runs[-1] = run._replace(duration=run.duration + " [bright_white]→")
        self.asides.renderables.append(table)
