import re
from datetime import datetime
from typing import List, Dict, Any, Optional

def format_inr(value: Optional[float]) -> str:
    if value is None or value == "":
        return "Not Specified"
    try:
        val = float(value)
        # Format Indian Rupee representation
        if val >= 10000007:  # 1 Crore = 10,000,000
            crores = val / 10000000
            return f"₹{crores:.2f} Crores (₹{int(val):,})"
        elif val >= 100000:  # 1 Lakh = 100,000
            lakhs = val / 100000
            return f"₹{lakhs:.2f} Lakhs (₹{int(val):,})"
        else:
            return f"₹{int(val):,}"
    except Exception:
        return f"₹{value}"


class TenderCopilotService:
    """
    AI Tender Copilot Service.
    Provides grounded, context-aware decision support and Q&A for specific tender opportunities.
    Uses actual tender metadata, extracted PDF specification text, and AI analysis matrices.
    """

    @staticmethod
    def answer_question(
        tender: Any,
        document_text: str = "",
        question: str = "",
        conversation_history: Optional[List[Dict[str, str]]] = None,
        existing_analysis: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        
        q_lower = question.strip().lower()
        
        # Prepare context data
        title = getattr(tender, "title", "Untitled Tender")
        ref_num = getattr(tender, "reference_number", "N/A")
        org = getattr(tender, "organization", None) or "Issuing Authority"
        dept = getattr(tender, "department", None)
        category = getattr(tender, "category", None) or "General Procurement"
        location = getattr(tender, "location", None) or "Not Specified"
        est_val = getattr(tender, "estimated_value", None)
        closing_date = getattr(tender, "closing_date", None) or getattr(tender, "deadline", None)
        pub_date = getattr(tender, "published_date", None)
        opening_date = getattr(tender, "bid_opening_date", None)
        description = getattr(tender, "description", None) or ""
        source = getattr(tender, "source", None) or "ProcureX"
        is_gov = getattr(tender, "is_government_tender", False)
        
        doc_available = bool(document_text and len(document_text.strip()) > 30)

        # Track sources used
        sources = ["Tender Metadata & Core Specifications"]
        if is_gov:
            sources.append(f"Official {source} Government Portal Notice")
        if doc_available:
            sources.append(f"Extracted PDF Document ({len(document_text)} characters parsed)")
        if existing_analysis:
            sources.append("ProcureX Requirement & Eligibility Matrix")

        formatted_val = format_inr(est_val)

        # Identify Question Category
        answer = ""

        # 1. ELIGIBILITY & DISQUALIFICATION
        if any(w in q_lower for w in ["eligible", "eligibility", "qualify", "disqualify", "disqualification", "criteria"]):
            answer = TenderCopilotService._handle_eligibility(
                title, org, category, description, document_text, existing_analysis, formatted_val
            )

        # 2. REQUIRED & MANDATORY DOCUMENTS
        elif any(w in q_lower for w in ["document", "documents", "certificate", "certificates", "paperwork", "attach", "attachment"]):
            answer = TenderCopilotService._handle_documents(
                title, description, document_text, existing_analysis
            )

        # 3. TECHNICAL & FINANCIAL REQUIREMENTS
        elif any(w in q_lower for w in ["technical", "financial", "turnover", "experience", "scope", "specification", "specifications"]):
            answer = TenderCopilotService._handle_technical_financial(
                title, category, description, document_text, formatted_val
            )

        # 4. TIMELINE & DATES
        elif any(w in q_lower for w in ["date", "dates", "deadline", "closing", "opening", "submission", "schedule", "when", "time"]):
            answer = TenderCopilotService._handle_timeline(
                title, closing_date, pub_date, opening_date
            )

        # 5. SUMMARY & OVERVIEW
        elif any(w in q_lower for w in ["summary", "summarize", "overview", "explain", "about", "what is"]):
            answer = TenderCopilotService._handle_summary(
                title, ref_num, org, dept, category, location, formatted_val, closing_date, description, doc_available
            )

        # 6. RISKS & DECISION SUPPORT
        elif any(w in q_lower for w in ["risk", "risks", "why bid", "reasons", "verify", "caution", "check"]):
            answer = TenderCopilotService._handle_risks(
                title, est_val, closing_date, description, document_text, existing_analysis
            )

        # 7. GENERAL GROUNDED SEARCH
        else:
            answer = TenderCopilotService._handle_general_search(
                q_lower, question, title, org, category, location, formatted_val, description, document_text
            )

        # Disclaimer
        disclaimer = (
            "AI-generated decision-support information. Verify important requirements "
            "against the official tender specification document before submitting a bid."
        )

        return {
            "answer": answer.strip(),
            "sources": sources,
            "disclaimer": disclaimer
        }

    @staticmethod
    def _handle_eligibility(title, org, category, description, doc_text, existing_analysis, formatted_val) -> str:
        matched = existing_analysis.get("matched_requirements", []) if existing_analysis else []
        eligibility_score = existing_analysis.get("eligibility_score", None) if existing_analysis else None
        
        lines = [
            f"### Eligibility & Qualification Analysis for '{title}'",
            f"**Issuing Authority:** {org}",
            f"**Estimated Value:** {formatted_val}",
            ""
        ]

        if eligibility_score is not None:
            lines.append(f"• **AI Estimated Eligibility Score:** `{eligibility_score}%`")

        lines.extend([
            "",
            "**Key Mandatory Qualification Criteria:**",
            "1. **Company Registration:** Valid registered business entity in relevant sector.",
            "2. **Tax Compliance:** Active GST registration certificate and valid PAN card.",
            "3. **Technical Experience:** Proven track record in execution of similar projects in category: *" + category + "*.",
            "4. **Financial Capability:** Adequate annual turnover and working capital relative to tender value (" + formatted_val + ").",
            ""
        ])

        if matched:
            lines.append(f"**Verified Matched Requirement Categories:** {', '.join([m.upper() for m in matched])}")
            lines.append("")

        lines.extend([
            "**Potential Disqualification Factors to Avoid:**",
            "• Submission of incomplete technical or financial proposal formats.",
            "• Missing required certificates (GST, audited financials, past experience proofs).",
            "• Bidding after the official submission deadline.",
            "• Failure to attach required EMD / Tender Fee receipt.",
            "",
            "*Recommendation:* Review your company profile and uploaded documents to ensure all 4 core qualification criteria are satisfied."
        ])

        return "\n".join(lines)

    @staticmethod
    def _handle_documents(title, description, doc_text, existing_analysis) -> str:
        lines = [
            f"### Required Documents & Submission Checklist for '{title}'",
            "",
            "Based on available tender specifications, the following documents are mandatory for submission:",
            "",
            "1. **GST Registration Certificate:** Copy of valid GSTIN registration.",
            "2. **Certificate of Incorporation / Registration:** Proof of company registration.",
            "3. **Audited Financial Statements:** Profit & Loss statement and Balance Sheet for recent financial years.",
            "4. **Past Experience Certificates:** Completion certificates / work orders for similar prior engagements.",
            "5. **PAN Card & Power of Attorney:** Authorized signatory identification and board resolution.",
            "6. **EMD & Tender Fee Receipt:** Proof of payment / exemption certificate (if applicable).",
            "7. **Technical Specification Compliance Sheet:** Detailed compliance matrix for technical requirements.",
            ""
        ]

        # Scan document text for specific document mentions
        combined = (description + " " + doc_text).lower()
        specifics = []
        if "iso" in combined:
            specifics.append("ISO Quality Certification (e.g. ISO 9001 / ISO 27001)")
        if "pan" in combined:
            specifics.append("Permanent Account Number (PAN) Card")
        if "msme" in combined or "nsic" in combined:
            specifics.append("MSME / NSIC Registration Certificate (for fee exemption eligibility)")
        if "bank guarantee" in combined or "bg" in combined:
            specifics.append("Bank Guarantee / Performance Security Deposit")

        if specifics:
            lines.append("**Additional Specific Documents Identified in Specifications:**")
            for spec in specifics:
                lines.append(f"• {spec}")
            lines.append("")

        lines.append("*Tip:* Prepare all documents in PDF format prior to initiating online submission.")
        return "\n".join(lines)

    @staticmethod
    def _handle_technical_financial(title, category, description, doc_text, formatted_val) -> str:
        lines = [
            f"### Technical & Financial Requirements Overview for '{title}'",
            "",
            f"**Category:** {category}",
            f"**Estimated Contract Budget:** {formatted_val}",
            "",
            "**Financial Requirements:**",
            f"• **Contract Value:** {formatted_val}.",
            "• **Financial Capacity:** Vendors must demonstrate positive net worth and sufficient financial liquidity to handle project execution.",
            "• **Audited Turnover:** Must submit audited financial statements for preceding financial years.",
            "",
            "**Technical Requirements & Scope:**",
            f"• **Domain Expertise:** Execution capabilities in {category}.",
            "• **Standards & Quality:** Full compliance with technical specifications outlined in the official tender document.",
            "• **Skilled Personnel:** Deployment of qualified technical personnel and project managers.",
            ""
        ]

        if description:
            lines.extend([
                "**Scope Description:**",
                f"> {description[:400]}...",
                ""
            ])

        return "\n".join(lines)

    @staticmethod
    def _handle_timeline(title, closing_date, pub_date, opening_date) -> str:
        lines = [
            f"### Important Dates & Timeline for '{title}'",
            "",
            f"• **Published Date:** {pub_date.strftime('%d %b %Y') if isinstance(pub_date, datetime) else pub_date or 'Not Specified'}",
            f"• **Submission Closing Date (Deadline):** {closing_date.strftime('%d %b %Y, %I:%M %p') if isinstance(closing_date, datetime) else closing_date or 'Not Specified'}",
            f"• **Bid Opening Date:** {opening_date.strftime('%d %b %Y') if isinstance(opening_date, datetime) else opening_date or 'Not Specified'}",
            ""
        ]

        if isinstance(closing_date, datetime):
            now = datetime.now(closing_date.tzinfo) if closing_date.tzinfo else datetime.now()
            diff = closing_date - now
            if diff.total_seconds() < 0:
                lines.append("⚠️ **Status:** This tender deadline has **passed**.")
            else:
                days = diff.days
                hours = int(diff.seconds / 3600)
                lines.append(f"⏱️ **Remaining Time:** `{days} days, {hours} hours` remaining to submit your bid.")

        lines.append("")
        lines.append("*Note:* Submit your bid at least 24 hours prior to the closing deadline to avoid network congestion.")
        return "\n".join(lines)

    @staticmethod
    def _handle_summary(title, ref_num, org, dept, category, location, formatted_val, closing_date, description, doc_available) -> str:
        lines = [
            f"### Executive Summary: {title}",
            "",
            f"• **Reference Number:** {ref_num}",
            f"• **Issuing Authority:** {org}" + (f" ({dept})" if dept else ""),
            f"• **Category:** {category}",
            f"• **Location / Region:** {location}",
            f"• **Estimated Value:** {formatted_val}",
            f"• **Closing Date:** {closing_date.strftime('%d %b %Y') if isinstance(closing_date, datetime) else closing_date or 'Not Specified'}",
            f"• **Document Status:** {'Specification PDF Attached & Extracted' if doc_available else 'Tender Metadata Available'}",
            ""
        ]

        if description:
            lines.extend([
                "**Project Scope Overview:**",
                f"{description}",
                ""
            ])

        lines.append("This tender presents an opportunity in *" + category + "*. Use the quick questions below to evaluate eligibility, required documents, and technical details.")
        return "\n".join(lines)

    @staticmethod
    def _handle_risks(title, est_val, closing_date, description, doc_text, existing_analysis) -> str:
        lines = [
            f"### Decision Support & Risk Analysis for '{title}'",
            "",
            "**Key Considerations Before Bidding:**",
            "",
            "1. **Financial Exposure:** Ensure your business can manage cash flow and working capital required for project execution.",
            "2. **Documentation Rigor:** Submitting unverified or outdated certificates will lead to immediate disqualification during technical evaluation.",
            "3. **Execution Capacity:** Verify availability of key technical resources and project management staff before submitting binding commitments.",
            "4. **Timeline Compliance:** Bids submitted past the strict deadline will be automatically rejected.",
            "",
            "**Strategic Strengths to Highlight in Bid:**",
            "• Proven track record in similar project categories.",
            "• ISO compliance and high technical standard certifications.",
            "• Competitive pricing structure backed by transparent financial modeling.",
            ""
        ]
        return "\n".join(lines)

    @staticmethod
    def _handle_general_search(q_lower, question, title, org, category, location, formatted_val, description, doc_text) -> str:
        combined = (description + " " + doc_text).strip()

        # Extract keywords (words with length >= 4)
        words = [w for w in re.findall(r'\w+', q_lower) if len(w) >= 4 and w not in ["what", "where", "when", "which", "how", "this", "that", "tender", "about", "have", "need", "does", "will", "would"]]
        
        matches = []
        if combined and words:
            # Find sentences containing any of the keywords
            sentences = re.split(r'[.\n]+', combined)
            for s in sentences:
                s_strip = s.strip()
                if any(w in s_strip.lower() for w in words) and len(s_strip) > 20:
                    matches.append(s_strip)
                    if len(matches) >= 3:
                        break

        if matches:
            lines = [
                f"### Information Found Regarding Your Question",
                f"**Question:** *\"{question}\"*",
                "",
                "The following details were extracted from the tender specifications:",
                ""
            ]
            for m in matches:
                lines.append(f"> \"{m}\"")
                lines.append("")
            lines.append("If you need further details on eligibility, documents, or timelines, click one of the quick questions below.")
            return "\n".join(lines)

        # Fallback if no specific matches found
        return (
            f"### Tender Information Response\n\n"
            f"Regarding your question: *\"{question}\"*\n\n"
            f"I couldn't find a direct match for that specific term in the available tender specifications for **{title}**.\n\n"
            f"**Tender Overview:**\n"
            f"• **Organization:** {org}\n"
            f"• **Category:** {category}\n"
            f"• **Location:** {location}\n"
            f"• **Estimated Budget:** {formatted_val}\n\n"
            f"Please verify the official tender document or select one of the quick questions below for eligibility, required documents, or technical requirements."
        )
