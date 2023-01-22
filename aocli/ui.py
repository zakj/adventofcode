from dataclasses import dataclass
from typing import NamedTuple

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


class DayRow(NamedTuple):
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


class Day:
    live: Live
    table: Table
    panel: Panel
    columns: Columns
    row: DayRow | None
    failed: bool

    def __init__(self, title: str):
        self.table = self.make_table()
        self.panel = Panel.fit("", title=title, title_align="left")
        self.columns = Columns([self.panel])
        self.live = Live(self.columns, refresh_per_second=8)
        self.row = None
        self.failed = False

    def __enter__(self):
        self.live.__enter__()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.live.__exit__(exc_type, exc_val, exc_tb)

    def quit(self):
        self.panel.border_style = "dim"
        if self.row:
            self.row.result.set("[dim red]KILLED")
        self.live.refresh()

    def clear(self):
        self.panel.renderable = ""
        self.table = self.make_table()

    def make_table(self) -> Table:
        table = Table.grid(padding=(0, 1))
        table.add_column("Part")
        table.add_column("Result", min_width=3)
        table.add_column("Time", min_width=8, justify="right")
        return table

    def start(self, part: int, example: bool):
        self.panel.renderable = self.table  # Prevent flash of wide panel.
        self.row = DayRow(f"{part}:" if not example else "", R(Spinner("line")), R())
        self.table.add_row(*self.row)

    def complete(self, result, expected, duration):
        assert self.row is not None
        if result != expected:
            self.failed = True
        self.row.result.set(format_result(result, expected))
        self.row.duration.set(format_duration(duration))

    def end_examples(self):
        if self.failed:
            self.table.add_row(*[Rule(style="dim")] * 3)
        else:
            self.clear()
