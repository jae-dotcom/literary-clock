# Raspberry Pi Chromium Screensaver (Literary Clock)

A custom screensaver for Raspberry Pi OS that launches a Chromium-based
full-screen web app after user inactivity and exits immediately on
mouse or keyboard activity.

This project replaces traditional screensavers with a lightweight,
script-driven solution using Chromium and X idle detection.

---

## Features

- Detects **mouse and keyboard inactivity**
- Launches **exactly one** Chromium instance
- Exits immediately on user activity
- Uses fullscreen (not kiosk) to avoid lock-in
- Automatically starts on login
- Fully logged for easy debugging

---

## Requirements

```bash
sudo apt update
sudo apt install -y chromium-browser xprintidle xdotool
````

> `xprintidle` is required for reliable keyboard + mouse activity detection.

---

## How It Works

* A Bash script polls X idle time using `xprintidle`
* After a configurable idle threshold, Chromium is launched fullscreen
* A unique Chromium user profile prevents tab/session conflicts
* User activity immediately closes the screensaver
* The script auto-starts via `.xsessionrc`

---

## Key Fixes & Lessons Learned

### 1. Keyboard input was not detected

**Problem:**
Mouse position alone does not reflect keyboard activity.

**Fix:**
Switched from `xdotool getmouselocation` to `xprintidle`, which tracks all X input.

```bash
IDLE_MS=$(xprintidle)
IDLE_SEC=$((IDLE_MS / 1000))
```

Also explicitly set the X environment:

```bash
export DISPLAY=:0
export XAUTHORITY=/home/jaer/.Xauthority
```

---

### 2. Chromium opened new tabs repeatedly

**Problem:**
Tracking Chromium via stored PIDs is unreliable; process names vary and
Chromium forks internally.

**Fix:**

* Launch Chromium with a **unique user profile**
* Detect it using `pgrep -f` instead of hard-coded PIDs

```bash
--user-data-dir=/tmp/screensaver-chrome
```

```bash
pgrep -f screensaver-chrome
```

A state flag prevents rapid relaunches.

---

### 3. Chromium fullscreen lock (no escape)

**Problem:**
Using `--kiosk` disables window controls and keyboard exits on Raspberry Pi.

**Fix:**
Replaced kiosk mode with safe fullscreen:

```bash
--start-fullscreen
```

This allows:

* `F11`
* `Alt+F4`
* clean script-driven shutdown

---

## Screensaver Script

The main script lives at:

```
~/start-screensaver.sh
```

Make it executable:

```bash
chmod +x ~/start-screensaver.sh
```

Run manually for testing:

```bash
~/start-screensaver.sh
```

Logs:

* `/tmp/screensaver.log`
* `/tmp/screensaver-error.log`

---

## Autostart on Login

The screensaver starts automatically via `.xsessionrc`.

```bash
nano ~/.xsessionrc
```

Contents:

```bash
# Auto-start literary clock screensaver
/home/jaer/start-screensaver.sh &
```

This ensures:

* Correct X session
* Correct DISPLAY
* One instance per login

⚠️ Do **not** also use `.desktop` autostart or systemd for this script,
or it may start twice.

---

## Optional Cleanup

Disable the default xscreensaver service if not used:

```bash
systemctl --user disable xscreensaver.service
```

---

## Future Improvements

* Fade-in / fade-out animation
* Hide mouse cursor while active
* Delay start until network is ready
* Bind a hotkey to temporarily disable the screensaver
* Multi-display support

---

## Notes

This approach is intentionally simple and transparent:

* No window manager hacks
* No system-level services required
* Easy to debug and extend

Perfect for Raspberry Pi display projects, dashboards, or clocks.

## Complete Screensaver Setup

This screensaver is implemented as a single Bash script that runs on
graphical login and monitors X idle time to launch a Chromium-based
full-screen display.

---

## File Overview

```

/home/jaer/start-screensaver.sh   # Main screensaver logic
/home/jaer/.xsessionrc           # Autostart hook (launches script on login)
/tmp/screensaver.log              # Runtime log
/tmp/screensaver-error.log        # Error log

````

---

## Main Screensaver Script

**File:** `/home/jaer/start-screensaver.sh`

Create or replace the file:

```bash
cat > /home/jaer/start-screensaver.sh << 'ENDSCRIPT'
#!/bin/bash

# -------------------------------------------------
# Environment (required for keyboard + mouse input)
# -------------------------------------------------
export DISPLAY=:0
export XAUTHORITY=/home/jaer/.Xauthority

# ----------------
# Configuration
# ----------------
IDLE_THRESHOLD=120        # Seconds before screensaver activates
CHECK_INTERVAL=5          # Poll interval (seconds)
URL="http://localhost:4173"

LOG=/tmp/screensaver.log
ERR=/tmp/screensaver-error.log

# ----------------
# Initialization
# ----------------
echo "[$(date '+%H:%M:%S')] Screensaver monitor started" > "$LOG"
echo "[$(date '+%H:%M:%S')] Errors:" > "$ERR"

SCREENSAVER_ACTIVE=0

# ----------------
# Main Loop
# ----------------
while true; do
  IDLE_MS=$(xprintidle 2>>"$ERR")
  IDLE_SEC=$((IDLE_MS / 1000))

  echo "[$(date '+%H:%M:%S')] Idle=${IDLE_SEC}s Active=$SCREENSAVER_ACTIVE" >> "$LOG"

  # ---- IDLE → START SCREENSAVER ----
  if (( IDLE_SEC >= IDLE_THRESHOLD )) && (( SCREENSAVER_ACTIVE == 0 )); then
    echo "[$(date '+%H:%M:%S')] → Launching Chromium screensaver" >> "$LOG"

    chromium-browser \
      --start-fullscreen \
      --no-first-run \
      --disable-infobars \
      --disable-extensions \
      --disable-background-networking \
      --password-store=basic \
      --user-data-dir=/tmp/screensaver-chrome \
      "$URL" >>"$LOG" 2>>"$ERR" &

    sleep 2

    if pgrep -f screensaver-chrome > /dev/null; then
      SCREENSAVER_ACTIVE=1
      echo "[$(date '+%H:%M:%S')] → Screensaver active" >> "$LOG"
    else
      echo "[$(date '+%H:%M:%S')] → Failed to start Chromium" >> "$LOG"
    fi
  fi

  # ---- ACTIVITY → STOP SCREENSAVER ----
  if (( IDLE_SEC < IDLE_THRESHOLD )) && (( SCREENSAVER_ACTIVE == 1 )); then
    echo "[$(date '+%H:%M:%S')] → Activity detected, closing screensaver" >> "$LOG"
    pkill -f screensaver-chrome
    SCREENSAVER_ACTIVE=0
  fi

  sleep "$CHECK_INTERVAL"
done
ENDSCRIPT
````

Make it executable:

```bash
chmod +x /home/jaer/start-screensaver.sh
```

---

## Autostart on Graphical Login

The screensaver is started automatically via `.xsessionrc`.

**File:** `/home/jaer/.xsessionrc`

Edit or create the file:

```bash
nano /home/jaer/.xsessionrc
```

Add:

```bash
# Auto-start literary clock screensaver
/home/jaer/start-screensaver.sh &
```

This ensures:

* The script runs once per graphical login
* The correct X session is used
* Keyboard and mouse activity are detected properly

⚠️ Do not also use `.desktop` autostart or systemd for this script,
or multiple instances may start.

---

## Dependencies

Install required packages:

```bash
sudo apt update
sudo apt install -y chromium-browser xprintidle xdotool
```

> `xprintidle` is required for reliable keyboard and mouse idle detection.

---

## Logs & Debugging

Runtime logs:

```bash
tail -f /tmp/screensaver.log
```

Error output:

```bash
tail -f /tmp/screensaver-error.log
```

---

## Testing

Run manually (foreground):

```bash
/home/jaer/start-screensaver.sh
```

Wait for the idle threshold and confirm Chromium launches.
Move mouse or press a key to confirm it exits.

---

## Notes

* Chromium is launched with a temporary user profile to avoid session conflicts
* Fullscreen mode is used instead of kiosk mode to allow clean exits
* The script is intentionally simple and transparent for easy modification

