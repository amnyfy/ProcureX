import re


def analyze_tender(text: str):
    text_lower = text.lower()

    requirements = []

    keywords = {
        "experience": [
            "experience",
            "years of experience",
            "prior experience"
        ],
        "turnover": [
            "turnover",
            "annual turnover",
            "financial turnover"
        ],
        "registration": [
            "registration",
            "registered company",
            "company registration"
        ],
        "gst": [
            "gst",
            "gst registration"
        ],
        "technical": [
            "technical qualification",
            "technical capability",
            "technical requirement"
        ],
        "documents": [
            "documents required",
            "supporting documents",
            "documents"
        ]
    }

    matched = []

    for requirement, words in keywords.items():
        for word in words:
            if word in text_lower:
                matched.append(requirement)
                break

    matched = list(set(matched))

    score = min(len(matched) * 12, 100)

    # Base score if the document contains readable content
    if len(text.strip()) > 500:
        score = min(score + 20, 100)

    # Estimate winning probability
    winning_probability = min(
        round(score * 0.85),
        95
    )

    if score >= 70:
        recommendation = "HIGHLY RECOMMENDED"
    elif score >= 50:
        recommendation = "RECOMMENDED"
    elif score >= 30:
        recommendation = "REVIEW REQUIRED"
    else:
        recommendation = "NOT RECOMMENDED"

    return {
        "eligibility_score": float(score),
        "winning_probability": float(winning_probability),
        "recommendation": recommendation,
        "matched_requirements": matched,
        "summary": generate_summary(
            score,
            matched,
            len(text)
        )
    }


def generate_summary(score, matched, text_length):

    if score >= 70:
        level = "The tender appears highly suitable."
    elif score >= 50:
        level = "The tender appears reasonably suitable."
    elif score >= 30:
        level = "The tender requires further eligibility review."
    else:
        level = "The tender appears to have limited matching requirements."

    return (
        f"{level} "
        f"The system identified {len(matched)} key requirement categories "
        f"from approximately {text_length} characters of tender content."
    )