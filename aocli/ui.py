from contextlib import contextmanager
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
    has_aside: bool = False


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

    def __init__(self) -> None:
        self.live = Live(self, refresh_per_second=8)
        self.done = False

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

    def quit(self) -> None:
        raise NotImplementedError

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
    title: str
    examples_running: bool
    example_runs: list[DayRun]
    runs: list[DayRun]
    killed: bool

    def __init__(self, path: Path):
        super().__init__()
        self.asides = Group()
        self.title = "/".join(path.parts[-2:])
        self.examples_running = False
        # TODO: just keep them all in one list with an is_example?
        self.example_runs = []
        self.runs = []
        self.killed = False

    # TODO: cache repeated runs?
    def __rich__(self):
        table = Table.grid(padding=(0, 1))
        table.add_column("Part")
        table.add_column("Result", min_width=3)
        table.add_column("Time", min_width=8, justify="right")

        # Don't show examples if they're finished and they all succeeded. If
        # any of them failed, show them all with a dim rule between sections.
        any_example_failed = any(not r.is_correct for r in self.example_runs)
        if self.examples_running or any_example_failed:
            for row in self.example_runs:
                table.add_row("", row.result, row.duration)
            if any_example_failed and not self.examples_running:
                table.add_row(*[Rule(style="dim")] * 3)

        # Main output.
        for i, row in enumerate(self.runs):
            table.add_row(
                f"{i + 1}:",
                row.result,
                row.duration + (" [bright_white]→" if row.has_aside else ""),
            )

        # Loading spinner, showing the part number when appropriate.
        if not self.done:
            if self.examples_running:
                table.add_row(Spinner("line"))
            else:
                table.add_row(f"{len(self.runs) + 1}:", Spinner("line"))

        panel = Panel.fit(table, title=self.title, title_align="left")
        return Columns([panel, self.asides])

    @property
    @contextmanager
    def examples(self):
        self.examples_running = True
        yield
        self.examples_running = False

    @property
    def current_runs(self):
        return self.example_runs if self.examples_running else self.runs

    def complete(self, result, expected, duration):
        self.current_runs.append(
            DayRun(
                format_result(result, expected),
                format_duration(duration),
                result == expected,
            )
        )

    def error(self):
        self.current_runs.append(
            DayRun(
                "[red]Error",
                "[red]×",
                False,
            )
        )

    def aside(self, aside: Aside):
        table = Table(*aside["header"], box=box.ROUNDED)
        for row in aside["rows"]:
            table.add_row(*row)
        current_runs = self.example_runs if self.examples_running else self.runs
        current_runs[-1] = current_runs[-1]._replace(has_aside=True)
        self.asides.renderables.append(table)
