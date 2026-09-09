#!/usr/bin/env python3
"""Render a 1200x630 Open Graph card from an HTML template.

Pipeline: headless Chrome screenshot at 2x -> Pillow downsample -> progressive JPEG.

Usage:
    python3 scripts/og/render.py scripts/og/newsletter-card.html assets/og-newsletter.jpg

Requires Google Chrome at the standard macOS path and Pillow (python3 -m pip install pillow).
The intermediate PNG is left in a temp directory and its path is printed for a visual check.
"""
import pathlib
import subprocess
import sys
import tempfile
import time

from PIL import Image

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
WIDTH, HEIGHT = 1200, 630
SCALE = 2
CHROME_TIMEOUT_S = 30


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__.strip(), file=sys.stderr)
        return 2
    src = pathlib.Path(sys.argv[1]).resolve()
    out = pathlib.Path(sys.argv[2])
    if not src.is_file():
        print(f"template not found: {src}", file=sys.stderr)
        return 1

    tmp = pathlib.Path(tempfile.mkdtemp(prefix="og-render-"))
    png = tmp / "card.png"
    cmd = [
        CHROME,
        "--headless",
        "--hide-scrollbars",
        "--no-first-run",
        "--disable-extensions",
        "--disable-gpu",
        f"--window-size={WIDTH},{HEIGHT}",
        f"--force-device-scale-factor={SCALE}",
        # Lets the web fonts arrive before the capture; there is no script hook with --screenshot.
        "--virtual-time-budget=10000",
        # A throwaway profile, otherwise an already-running Chrome swallows the launch.
        f"--user-data-dir={tmp / 'profile'}",
        f"--screenshot={png}",
        src.as_uri(),
    ]
    # Chrome writes the PNG within seconds but, with --virtual-time-budget, the new
    # headless mode sometimes never shuts down afterward. Bound the wait and reclaim it.
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    deadline = time.monotonic() + CHROME_TIMEOUT_S
    last_size = -1
    while proc.poll() is None and time.monotonic() < deadline:
        time.sleep(0.5)
        size = png.stat().st_size if png.is_file() else -1
        if size > 0 and size == last_size:
            break  # screenshot fully written; Chrome will not exit on its own
        last_size = size
    if proc.poll() is None:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait()
    if not png.is_file():
        print("Chrome produced no screenshot", file=sys.stderr)
        return 1

    im = Image.open(png).convert("RGB")
    if im.size != (WIDTH, HEIGHT):
        im = im.resize((WIDTH, HEIGHT), Image.LANCZOS)
    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out, "JPEG", quality=85, progressive=True, optimize=True, subsampling=0)
    print(f"wrote {out} ({out.stat().st_size // 1024} KB, {WIDTH}x{HEIGHT}); preview PNG: {png}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
