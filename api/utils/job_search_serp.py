"""
Fetch job listing URLs via search APIs (SerpAPI, Google Programmable Search, or Tavily).
Direct scraping of LinkedIn/Naukri/Glassdoor is not used (ToS / blocking).
Recency: SerpAPI/CSE use a past-day filter; Tavily uses time_range=day (~last 24h).
"""
import os
from typing import Any

import requests

# Domains that identify which portal a result belongs to
PORTAL_SITES = {
    "linkedin": ("linkedin.com/jobs", "LinkedIn"),
    "naukri": ("naukri.com", "Naukri"),
    "glassdoor": ("glassdoor.com", "Glassdoor"),
}


def _serpapi_google_jobs(query: str, num: int = 10) -> list[dict[str, Any]]:
    key = os.getenv("SERPAPI_KEY", "").strip()
    if not key:
        return []
    params = {
        "engine": "google",
        "q": query,
        "api_key": key,
        "num": num,
        # Past 24 hours (Google search)
        "tbs": "qdr:d",
    }
    try:
        r = requests.get("https://serpapi.com/search.json", params=params, timeout=45)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print(f"SerpAPI error: {e}")
        return []

    organic = data.get("organic_results") or []
    out: list[dict[str, Any]] = []
    for row in organic:
        link = row.get("link") or ""
        title = row.get("title") or "Job listing"
        snippet = row.get("snippet") or ""
        if not link:
            continue
        portal = _portal_from_url(link)
        if not portal:
            continue
        out.append(
            {
                "title": title,
                "url": link,
                "snippet": snippet,
                "portal": portal[1],
                "portal_key": portal[0],
            }
        )
    return out


def _google_cse_search(query: str, num: int = 10) -> list[dict[str, Any]]:
    api_key = os.getenv("GOOGLE_SEARCH_API_KEY", "").strip()
    cx = os.getenv("GOOGLE_SEARCH_CX", "").strip()
    if not api_key or not cx:
        return []
    params = {
        "key": api_key,
        "cx": cx,
        "q": query,
        "num": min(num, 10),
        "dateRestrict": "d1",
    }
    try:
        r = requests.get(
            "https://www.googleapis.com/customsearch/v1",
            params=params,
            timeout=45,
        )
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print(f"Google CSE error: {e}")
        return []

    items = data.get("items") or []
    out: list[dict[str, Any]] = []
    for row in items:
        link = row.get("link") or ""
        title = row.get("title") or "Job listing"
        snippet = row.get("snippet") or ""
        if not link:
            continue
        portal = _portal_from_url(link)
        if not portal:
            continue
        out.append(
            {
                "title": title,
                "url": link,
                "snippet": snippet,
                "portal": portal[1],
                "portal_key": portal[0],
            }
        )
    return out


def _tavily_search_jobs(query: str, num: int = 15) -> list[dict[str, Any]]:
    key = os.getenv("TAVILY_API_KEY", "").strip()
    if not key:
        return []
    payload: dict[str, Any] = {
        "api_key": key,
        "query": query,
        "max_results": min(max(num, 1), 20),
        "search_depth": "basic",
        "time_range": "day",
        "include_answer": False,
    }
    try:
        r = requests.post("https://api.tavily.com/search", json=payload, timeout=60)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print(f"Tavily error: {e}")
        return []

    results = data.get("results") or []
    out: list[dict[str, Any]] = []
    for row in results:
        link = (row.get("url") or "").strip()
        title = row.get("title") or "Job listing"
        snippet = (row.get("content") or row.get("snippet") or "")[:500]
        if not link:
            continue
        portal = _portal_from_url(link)
        if not portal:
            continue
        out.append(
            {
                "title": title,
                "url": link,
                "snippet": snippet,
                "portal": portal[1],
                "portal_key": portal[0],
            }
        )
    return out


def _portal_from_url(url: str) -> tuple[str, str] | None:
    u = url.lower()
    if "linkedin.com" in u and "job" in u:
        return ("linkedin", "LinkedIn")
    if "naukri.com" in u:
        return ("naukri", "Naukri")
    if "glassdoor." in u and ("job" in u or "/job" in u):
        return ("glassdoor", "Glassdoor")
    return None


def fetch_portal_jobs(target_role: str, portal_key: str) -> list[dict[str, Any]]:
    """
    One portal: site:-restricted query + last 24h when using SerpAPI tbs=qdr:d or CSE dateRestrict.
    """
    site_tuple = PORTAL_SITES.get(portal_key)
    if not site_tuple:
        return []
    site = site_tuple[0]
    q = f'site:{site} {target_role}'
    rows = _serpapi_google_jobs(q)
    if not rows:
        rows = _google_cse_search(q)
    if not rows:
        rows = _tavily_search_jobs(q)
    return rows


def fetch_all_portal_jobs(target_role: str) -> list[dict[str, Any]]:
    """Collect jobs from LinkedIn, Naukri, and Glassdoor (via search index)."""
    combined: list[dict[str, Any]] = []
    for key in PORTAL_SITES:
        combined.extend(fetch_portal_jobs(target_role, key))
    # Dedupe by URL
    seen: set[str] = set()
    unique: list[dict[str, Any]] = []
    for j in combined:
        u = j.get("url") or ""
        if u in seen:
            continue
        seen.add(u)
        unique.append(j)
    return unique


def rank_by_skills(jobs: list[dict[str, Any]], skills: list[str], top_n: int = 6) -> list[dict[str, Any]]:
    if not skills:
        return jobs[:top_n]
    skill_l = [s.strip().lower() for s in skills if s and s.strip()]
    scored: list[tuple[float, dict[str, Any]]] = []
    for j in jobs:
        blob = f"{j.get('title', '')} {j.get('snippet', '')}".lower()
        hits = sum(1 for s in skill_l if s and s in blob)
        # Slight boost for title matches
        title_l = (j.get("title") or "").lower()
        title_bonus = sum(0.5 for s in skill_l if s and s in title_l)
        score = hits + title_bonus
        row = {**j, "match_score": round(min(100, score * 12 + 10), 0)}
        scored.append((score, row))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [r for _, r in scored[:top_n]]


def search_capability_message() -> str | None:
    if os.getenv("SERPAPI_KEY", "").strip():
        return None
    if os.getenv("GOOGLE_SEARCH_API_KEY", "").strip() and os.getenv("GOOGLE_SEARCH_CX", "").strip():
        return None
    if os.getenv("TAVILY_API_KEY", "").strip():
        return None
    return (
        "Job discovery requires TAVILY_API_KEY, or SERPAPI_KEY, or GOOGLE_SEARCH_API_KEY + "
        "GOOGLE_SEARCH_CX (Programmable Search). Add one to .env.local and restart the API."
    )
