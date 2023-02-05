from contextlib import contextmanager
from dataclasses import dataclass
from typing import NamedTuple, TypedDict

from rich import box
from rich.columns import Columns
from rich.console import Group, RenderableType, RenderResult
from rich.live import Live
from rich.measure import Measurement
from rich.panel import Panel
from rich.rule import Rule
from rich.spinner import Spinner
from rich.table import Table


class Aside(TypedDict):
    header: list[str]
    rows: list[list[str]]


@dataclass
class R:
    renderable: RenderableType

    def __rich_console__(self, console, options) -> RenderResult:
        yield self.renderable

    def __rich_measure__(self, console, options) -> Measurement:
        return Measurement.get(console, options, self.renderable)

    def set(self, value: RenderableType) -> None:
        self.renderable = value


class DayRow(NamedTuple):
    day: str
    parts: list[R]


class PartRow(NamedTuple):
    part: str
    result: R
    duration: R


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


from typing import Any


class BaseUI:
    live: Live

    def __enter__(self):
        self.live.__enter__()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.live.__exit__(exc_type, exc_val, exc_tb)

    def start(self) -> None:
        raise NotImplementedError

    def complete(self, result: Any, expected: Any, duration: float) -> None:
        raise NotImplementedError

    def quit(self):
        raise NotImplementedError

    def aside(self, aside: Aside):
        return  # default to ignore


class Year(BaseUI):
    current_part: int
    panel: Panel
    row: DayRow
    stars: int
    table: Table

    def __init__(self, title: str):
        self.table = Table.grid(padding=(0, 2))
        self.table.add_column("Day")
        self.table.add_column("Part 1", justify="right")
        self.table.add_column("Part 2", justify="right")
        self.panel = Panel.fit(
            "",
            title=f"[bright_white italic]{title}",
            title_align="left",
            subtitle_align="right",
            border_style="dim",
        )
        self.stars = 0
        self.live = Live(self.panel, refresh_per_second=8)

    def start_day(self, day: str):
        self.panel.renderable = self.table  # Prevent flash of wide panel.
        # TODO: skipped days? or maybe just leave it because we have star count
        # only one part cell for day 25
        parts = [R("[dim]-"), R("[dim]-")]
        if day == 25:
            parts = parts[:1]
        self.row = DayRow(f"Day {day}", parts)
        self.table.add_row(self.row.day, *self.row.parts)
        self.current_part = 0

    def start(self):
        self.current_part += 1
        self.row.parts[self.current_part - 1].set(Spinner("line"))

    def complete(self, result, expected, duration):
        # TODO: handle extra parts
        # TODO: handle exceptions somehow
        # cells[part].set(f"[red]Exception ×")
        success = "[green]✓" if result == expected else "[red]×"
        self.row.parts[self.current_part - 1].set(
            " ".join([format_duration(duration), success])
        )
        if result == expected:
            self.stars += 1
            self.panel.subtitle = f"[bright_yellow]{self.stars}*"


class Day(BaseUI):
    current_part: int
    examples_running: bool
    asides: Group
    failed: bool
    panel: Panel
    row: PartRow | None
    table: Table

    def __init__(self, title: str):
        self.current_part = 0
        self.examples_running = False
        self.failed = False
        self.row = None
        self.table = self.make_table()
        self.panel = Panel.fit("", title=title, title_align="left")
        self.asides = Group()
        self.live = Live(Columns([self.panel, self.asides]), refresh_per_second=8)

    def quit(self):
        self.panel.border_style = "dim"
        if self.row:
            self.row.result.set("[dim red]KILLED")
        self.live.refresh()

    def make_table(self) -> Table:
        table = Table.grid(padding=(0, 1))
        table.add_column("Part")
        table.add_column("Result", min_width=3)
        table.add_column("Time", min_width=8, justify="right")
        return table

    @property
    @contextmanager
    def examples(self):
        self.examples_running = True
        yield
        self.examples_running = False
        if self.current_part > 0:
            self.current_part = 0
            if self.failed:
                self.table.add_row(*[Rule(style="dim")] * 3)
            else:
                # Clear successful example output.
                self.panel.renderable = ""
                self.table = self.make_table()

    def start(self):
        self.current_part += 1
        self.panel.renderable = self.table  # Prevent flash of wide panel.
        self.row = PartRow(
            f"{self.current_part}:" if not self.examples_running else "",
            R(Spinner("line")),
            R(""),
        )
        self.table.add_row(*self.row)

    def complete(self, result, expected, duration):
        assert self.row is not None
        if result != expected:
            self.failed = True
        self.row.result.set(format_result(result, expected))
        self.row.duration.set(format_duration(duration))

    def aside(self, aside: Aside):
        # TODO: how to handle extras when there are examples? aoc.py needs to
        # know not to send it unless it's running an example
        table = Table(*aside["header"], box=box.ROUNDED)
        for row in aside["rows"]:
            table.add_row(*row)
        if self.row and isinstance(self.row.duration.renderable, str):
            self.row.duration.renderable += " [bright_white]→"
        self.asides.renderables.append(table)
