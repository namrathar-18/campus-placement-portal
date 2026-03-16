import json
import re
import sys
from pathlib import Path

try:
	from docx import Document  # type: ignore
except Exception:
	Document = None

try:
	from pypdf import PdfReader  # type: ignore
except Exception:
	PdfReader = None

try:
	from sklearn.feature_extraction.text import TfidfVectorizer  # type: ignore
	from sklearn.metrics.pairwise import cosine_similarity  # type: ignore
except Exception:
	TfidfVectorizer = None
	cosine_similarity = None


SKILL_ALIASES = {
	"python": ["python"],
	"java": ["java"],
	"c++": ["c++", "cpp"],
	"c#": ["c#", "csharp"],
	"javascript": ["javascript", "js"],
	"typescript": ["typescript", "ts"],
	"react": ["react", "reactjs", "react.js"],
	"node.js": ["node", "nodejs", "node.js"],
	"express": ["express", "expressjs"],
	"mongodb": ["mongodb", "mongo"],
	"sql": ["sql", "mysql", "postgresql", "postgres"],
	"html": ["html"],
	"css": ["css"],
	"tailwind": ["tailwind", "tailwindcss"],
	"git": ["git", "github", "gitlab"],
	"docker": ["docker"],
	"kubernetes": ["kubernetes", "k8s"],
	"aws": ["aws", "amazon web services"],
	"azure": ["azure"],
	"gcp": ["gcp", "google cloud"],
	"data structures": ["data structures", "dsa"],
	"algorithms": ["algorithms", "algorithm design"],
	"oop": ["oop", "object oriented programming"],
	"rest api": ["rest api", "restful api", "api development"],
	"machine learning": ["machine learning", "ml"],
	"deep learning": ["deep learning", "neural networks"],
	"nlp": ["nlp", "natural language processing"],
	"pandas": ["pandas"],
	"numpy": ["numpy"],
	"scikit-learn": ["scikit-learn", "sklearn"],
	"tensorflow": ["tensorflow"],
	"pytorch": ["pytorch"],
	"power bi": ["power bi"],
	"tableau": ["tableau"],
	"excel": ["excel", "ms excel"],
	"problem solving": ["problem solving", "problem-solving"],
	"communication": ["communication", "communication skills"],
	"leadership": ["leadership"],
	"teamwork": ["teamwork", "collaboration"],
}


def _normalize_spaces(text: str) -> str:
	return re.sub(r"\s+", " ", text).strip()


def _sanitize_text(text: str) -> str:
	return _normalize_spaces(text.lower())


def _extract_text_from_resume_path(resume_path: str) -> str:
	path = Path(resume_path)
	if not path.exists() or not path.is_file():
		raise ValueError("resume_path does not exist or is not a file")

	suffix = path.suffix.lower()
	if suffix == ".txt":
		return _normalize_spaces(path.read_text(encoding="utf-8", errors="ignore"))

	if suffix == ".pdf":
		if PdfReader is None:
			raise ValueError("PDF parsing requires pypdf package")
		reader = PdfReader(str(path))
		text = "\n".join(page.extract_text() or "" for page in reader.pages)
		return _normalize_spaces(text)

	if suffix == ".docx":
		if Document is None:
			raise ValueError("DOCX parsing requires python-docx package")
		doc = Document(str(path))
		text = "\n".join(paragraph.text for paragraph in doc.paragraphs)
		return _normalize_spaces(text)

	raise ValueError("unsupported resume format, use .txt, .pdf, or .docx")


def _contains_alias(lower_text: str, normalized_text: str, alias: str) -> bool:
	alias = alias.lower().strip()
	if not alias:
		return False

	if re.search(r"[^a-z0-9\s]", alias):
		pattern = rf"(?<!\w){re.escape(alias)}(?!\w)"
		return re.search(pattern, lower_text) is not None

	alias_pattern = re.sub(r"\s+", r"\\s+", re.escape(alias))
	pattern = rf"\b{alias_pattern}\b"
	return re.search(pattern, normalized_text) is not None


def extract_skills(text: str) -> list[str]:
	lower_text = _sanitize_text(text)
	normalized_text = re.sub(r"[^a-z0-9\s]", " ", lower_text)
	normalized_text = _normalize_spaces(normalized_text)

	found = []
	for canonical_skill, aliases in SKILL_ALIASES.items():
		if any(_contains_alias(lower_text, normalized_text, alias) for alias in aliases):
			found.append(canonical_skill)

	return sorted(found)


def _safe_similarity(resume_text: str, jd_text: str) -> float:
	corpus = [resume_text.strip(), jd_text.strip()]
	if not corpus[0] or not corpus[1]:
		return 0.0

	if TfidfVectorizer is None or cosine_similarity is None:
		resume_tokens = set(tokenize(corpus[0]))
		jd_tokens = set(tokenize(corpus[1]))
		if not resume_tokens or not jd_tokens:
			return 0.0
		intersection = len(resume_tokens.intersection(jd_tokens))
		union = len(resume_tokens.union(jd_tokens))
		return (intersection / union) if union else 0.0

	try:
		vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
		matrix = vectorizer.fit_transform(corpus)
		similarity = float(cosine_similarity(matrix[0:1], matrix[1:2])[0][0])
		return max(0.0, min(1.0, similarity))
	except ValueError:
		return 0.0


def tokenize(text: str) -> list[str]:
	clean = re.sub(r"[^a-z0-9\s]", " ", text.lower())
	return [token for token in clean.split() if len(token) > 2]


def analyze_resume_job_match(payload: dict) -> dict:
	job_description = str(payload.get("job_description", "") or "").strip()
	if not job_description:
		raise ValueError("job_description is required")

	resume_text = str(payload.get("resume_text", "") or "").strip()
	resume_path = str(payload.get("resume_path", "") or "").strip()

	if not resume_text and resume_path:
		resume_text = _extract_text_from_resume_path(resume_path)

	if not resume_text:
		raise ValueError("resume_text is required when resume_path is not provided")

	top_k_missing = int(payload.get("top_k_missing", 10) or 10)
	top_k_missing = max(1, min(top_k_missing, 25))

	resume_skills = extract_skills(resume_text)
	jd_skills = extract_skills(job_description)

	resume_skill_set = set(resume_skills)
	jd_skill_set = set(jd_skills)

	matched_skills = sorted(resume_skill_set.intersection(jd_skill_set))
	missing_skills = sorted(jd_skill_set.difference(resume_skill_set))[:top_k_missing]
	extra_skills = sorted(resume_skill_set.difference(jd_skill_set))

	skill_match_ratio = (len(matched_skills) / len(jd_skill_set)) if jd_skill_set else 0.0
	semantic_similarity = _safe_similarity(resume_text, job_description)

	# Weighted score prioritizes explicit skill match while still considering semantic overlap.
	overall_score = (skill_match_ratio * 0.7 + semantic_similarity * 0.3) * 100
	overall_score = round(max(0.0, min(100.0, overall_score)), 2)

	if overall_score >= 85:
		fit_level = "strong"
	elif overall_score >= 65:
		fit_level = "moderate"
	else:
		fit_level = "weak"

	summary = (
		f"{fit_level.title()} fit: {len(matched_skills)} matched skills, "
		f"{len(missing_skills)} key skills missing, semantic similarity {round(semantic_similarity * 100, 2)}%."
	)

	return {
		"score": overall_score,
		"fit_level": fit_level,
		"skill_match_percent": round(skill_match_ratio * 100, 2),
		"semantic_similarity_percent": round(semantic_similarity * 100, 2),
		"matched_skills": matched_skills,
		"missing_skills": missing_skills,
		"additional_resume_skills": extra_skills,
		"resume_skills": resume_skills,
		"job_description_skills": jd_skills,
		"resume_excerpt": _normalize_spaces(resume_text)[:500],
		"job_description_excerpt": _normalize_spaces(job_description)[:500],
		"summary": summary,
		"note": "No resume analyzer can guarantee 100% real-world accuracy; this score is an estimation.",
	}


def main() -> int:
	try:
		raw_input = sys.stdin.read()
		if not raw_input.strip():
			raise ValueError("no JSON payload received on stdin")

		payload = json.loads(raw_input)
		result = analyze_resume_job_match(payload)
		sys.stdout.write(json.dumps({"success": True, "data": result}))
		return 0
	except Exception as exc:
		sys.stdout.write(json.dumps({"success": False, "error": str(exc)}))
		return 1


if __name__ == "__main__":
	raise SystemExit(main())
