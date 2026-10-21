"""
Golden-vector generator for USAC SimLab (brief §7 "Kiểm chứng chéo").

Produces reference values with established scientific libraries so the TypeScript
core can be cross-checked. Output: reference/golden.json

    python -m pip install astropy numpy scipy
    python reference/golden_vectors.py

Optional (GR): einsteinpy for Schwarzschild geodesics.
"""
import json
import math
from pathlib import Path

import numpy as np
from astropy import units as u
from astropy.coordinates import get_body_barycentric, get_sun, EarthLocation, AltAz, solar_system_ephemeris
from astropy.cosmology import Planck18
from astropy.time import Time
from scipy.integrate import solve_ivp

out = {}

# ── Time & Sun (A1) ───────────────────────────────────────────────────────────
t = Time("1992-10-13T00:00:00", scale="tt")
sun = get_sun(t)
out["sun_1992_10_13"] = {"ra_deg": sun.ra.deg, "dec_deg": sun.dec.deg}

hanoi = EarthLocation(lat=21.0285 * u.deg, lon=105.8542 * u.deg)
t_noon = Time("2024-06-21T05:00:00", scale="utc")
aa = get_sun(t_noon).transform_to(AltAz(obstime=t_noon, location=hanoi))
out["sun_hanoi_2024_06_21_05utc"] = {"alt_deg": aa.alt.deg, "az_deg": aa.az.deg}

# ── Planets (E1) — heliocentric ecliptic J2000 positions from the built-in ephemeris ──
with solar_system_ephemeris.set("builtin"):
    t0 = Time("2000-01-01T12:00:00", scale="tdb")
    emb = get_body_barycentric("earth", t0) - get_body_barycentric("sun", t0)
    out["earth_helio_j2000_equatorial_au"] = [float(v.to(u.au).value) for v in (emb.x, emb.y, emb.z)]

# ── Cosmology (D8) ───────────────────────────────────────────────────────────
out["planck18"] = {
    "age_gyr": float(Planck18.age(0).to(u.Gyr).value),
    "comoving_distance_z1_mpc": float(Planck18.comoving_distance(1).to(u.Mpc).value),
    "luminosity_distance_z1_mpc": float(Planck18.luminosity_distance(1).to(u.Mpc).value),
    "lookback_z2_gyr": float(Planck18.lookback_time(2).to(u.Gyr).value),
}

# ── Schwarzschild light deflection (D3/D5): exact integral ───────────────────
def deflection(b, M=1.0):
    def rhs(phi, y):
        return [y[1], -y[0] + 3 * M * y[0] ** 2]
    ev = lambda phi, y: y[0]
    ev.terminal, ev.direction = True, -1
    sol = solve_ivp(rhs, [1e-9, 20], [1e-12, 1 / b], events=ev, rtol=1e-12, atol=1e-16)
    return sol.t_events[0][0] - math.pi

out["deflection_exact"] = {str(b): deflection(b) for b in (6.0, 10.0, 100.0, 1000.0)}

Path(__file__).with_name("golden.json").write_text(json.dumps(out, indent=2))
print(json.dumps(out, indent=2))
